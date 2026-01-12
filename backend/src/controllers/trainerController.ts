import { Response } from 'express';
import Trainer from '../models/trainer';
import Member from '../models/member';
import User from '../models/user';
import Subscription from '../models/subscription';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../types';
import bcrypt from 'bcryptjs';

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

export const createTrainer = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, password, profile, specialization, experience } = req.body;

    // Validate required fields
    if (!email || !password || !profile?.firstName || !profile?.lastName) {
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      role: UserRole.TRAINER,
      profile,
    });
    await user.save();

    // Create trainer with additional fields
    const trainer = new Trainer({
      userId: user._id,
      specialization: specialization || [],
      experience: experience || 0,
    });
    await trainer.save();

    // Populate and return
    const populatedTrainer = await Trainer.findById(trainer._id)
      .populate('userId', '-password')
      .populate('assignedMembers');

    res.status(201).json(populatedTrainer);
  } catch (error) {
    console.error('Create trainer error:', error);
    res
      .status(500)
      .json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getTrainerById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .populate('userId', '-password')

      .populate({
        path: 'assignedMembers',
        populate: {
          path: 'userId',
          select: '-password',
        },
      });

    if (!trainer) {
      res.status(404).json({ message: 'Trainer not found' });
      return;
    }

    res.json(trainer);
  } catch (error) {
    console.error('Get trainer by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const assignMember = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { trainerId, memberId } = req.body;

    console.info('AssignMember called', {
      user: req.user,
      body: { trainerId, memberId },
    });

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

export const unassignMember = async (
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

    // Remove member from trainer
    trainer.assignedMembers = trainer.assignedMembers.filter(
      mId => mId.toString() !== memberId
    );
    await trainer.save();

    // Remove trainer assignment from member
    if (member.assignedTrainer?.toString() === trainerId) {
      member.assignedTrainer = undefined;
      await member.save();
    }

    res.json({ message: 'Member unassigned successfully', trainer, member });
  } catch (error) {
    console.error('Unassign member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTrainer = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      specialization,
      experience,
      certifications,
      availability,
      profile,
    } = req.body;

    const trainer = await Trainer.findById(id);
    if (!trainer) {
      res.status(404).json({ message: 'Trainer not found' });
      return;
    }

    // Update trainer-specific fields
    if (specialization) trainer.specialization = specialization;
    if (experience !== undefined) trainer.experience = experience;
    if (certifications) trainer.certifications = certifications;
    if (availability) trainer.availability = availability;

    await trainer.save();

    // Update associated user profile if provided
    if (profile) {
      const user = await User.findById(trainer.userId);
      if (user) {
        if (profile.firstName) user.profile.firstName = profile.firstName;
        if (profile.lastName) user.profile.lastName = profile.lastName;
        if (profile.phone) user.profile.phone = profile.phone;
        await user.save();
      }
    }

    const updated = await Trainer.findById(id)
      .populate('userId', '-password')
      .populate({
        path: 'assignedMembers',
        populate: {
          path: 'userId',
          select: '-password',
        },
      });

    res.json(updated);
  } catch (error) {
    console.error('Update trainer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteTrainer = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const trainer = await Trainer.findById(id);
    if (!trainer) {
      res.status(404).json({ message: 'Trainer not found' });
      return;
    }

    // Unassign all members
    await Member.updateMany(
      { assignedTrainer: trainer._id },
      { $unset: { assignedTrainer: '' } }
    );

    await Trainer.findByIdAndDelete(id);

    res.json({ message: 'Trainer deleted successfully' });
  } catch (error) {
    console.error('Delete trainer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyAssignedMembers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Find trainer by userId
    const trainer = await Trainer.findOne({ userId: req.user.userId });
    if (!trainer) {
      res.status(404).json({ message: 'Trainer not found' });
      return;
    }

    // Get assigned members with populated data
    const members = await Member.find({ assignedTrainer: trainer.id })
      .populate('userId', '-password')
      .populate('currentSubscription')
      .populate('assignedTrainer', 'userId specialization experience');

    res.json(members);
  } catch (error) {
    console.error('Get my assigned members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyAssignedMembersSubscriptions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Find trainer by userId
    const trainer = await Trainer.findOne({ userId: req.user.userId });
    if (!trainer) {
      res.status(404).json({ message: 'Trainer not found' });
      return;
    }

    // Get subscriptions for assigned members
    const subscriptions = await Subscription.find({
      memberId: { $in: trainer.assignedMembers },
    })
      .populate({
        path: 'memberId',
        populate: {
          path: 'userId',
          select: 'profile.firstName profile.lastName email',
        },
      })
      .populate('paymentId')
      .sort({ createdAt: -1 });

    res.json(subscriptions);
  } catch (error) {
    console.error('Get my assigned members subscriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const trainer = await Trainer.findOne({ userId })
      .populate('userId', '-password')
      .populate('assignedMembers');

    if (!trainer) {
      res.status(404).json({ message: 'Trainer not found' });
      return;
    }

    res.json(trainer);
  } catch (error) {
    console.error('Get my profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
