import { Response } from 'express';
import Trainer from '../models/trainer';
import Member from '../models/member';
import { AuthRequest } from '../middleware/auth';

export const getAllTrainers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const trainers = await Trainer.find()
      .populate('userId', '-password')
      .populate('assignedMembers');

    res.json(trainers);
  } catch (error) {
    console.error('Get all trainers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const assignMember = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { trainerId, memberId } = req.body;

    if (!trainerId || !memberId) {
      res
        .status(400)
        .json({ message: 'Trainer ID and Member ID are required' });
      return;
    }

    const trainer = await Trainer.findById(trainerId);
    const member = await Member.findById(memberId);

    if (!trainer || !member) {
      res.status(404).json({ message: 'Trainer or Member not found' });
      return;
    }

    // Remove from previous trainer if assigned
    if (member.assignedTrainer) {
      await Trainer.findByIdAndUpdate(member.assignedTrainer, {
        $pull: { assignedMembers: memberId },
      });
    }

    // Assign to new trainer
    if (!trainer.assignedMembers.includes(member._id)) {
      trainer.assignedMembers.push(member._id);
      await trainer.save();
    }

    member.assignedTrainer = trainer._id;
    await member.save();

    res.json({ message: 'Member assigned successfully', trainer, member });
  } catch (error) {
    console.error('Assign member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
