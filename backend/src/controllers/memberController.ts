import { Response } from 'express';
import Member from '../models/member';
import User from '../models/user';
import { AuthRequest } from '../middleware/auth';

export const getAllMembers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const members = await Member.find()
      .populate('userId', '-password')
      .populate('assignedTrainer')
      .populate('currentSubscription');

    res.json(members);
  } catch (error) {
    console.error('Get all members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMemberById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('userId', '-password')
      .populate('assignedTrainer')
      .populate('currentSubscription')
      .populate('subscriptionHistory');

    if (!member) {
      res.status(404).json({ message: 'Member not found' });
      return;
    }

    res.json(member);
  } catch (error) {
    console.error('Get member by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateMember = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { personalInfo, assignedTrainer } = req.body;

    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { personalInfo, assignedTrainer },
      { new: true }
    ).populate('userId', '-password');

    if (!member) {
      res.status(404).json({ message: 'Member not found' });
      return;
    }

    res.json(member);
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteMember = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      res.status(404).json({ message: 'Member not found' });
      return;
    }

    await User.findByIdAndDelete(member.userId);
    await Member.findByIdAndDelete(req.params.id);

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
