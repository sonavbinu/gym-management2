import { Response } from 'express';
import Member from '../models/member';
import User from '../models/user';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../types';
import bcrypt from 'bcryptjs';

export const getAllMembers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const members = await Member.find()
      .populate('userId', '-password')
      .populate({
        path: 'assignedTrainer',
        populate: { path: 'userId', select: 'profile' },
      })
      .populate('currentSubscription');

    res.json(members);
  } catch (error) {
    console.error('Get all members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createMember = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, password, profile, personalInfo } = req.body;

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
      role: UserRole.MEMBER,
      profile,
    });
    await user.save();

    // Create member with personal info
    const member = new Member({
      userId: user._id,
      personalInfo: personalInfo || {},
    });
    await member.save();

    const populatedMember = await Member.findById(member._id)
      .populate('userId', '-password')
      .populate({
        path: 'assignedTrainer',
        populate: { path: 'userId', select: 'profile' },
      })
      .populate('currentSubscription');

    res.status(201).json(populatedMember);
  } catch (error) {
    console.error('Create member error:', error);
    res
      .status(500)
      .json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getMemberById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('userId', '-password')
      .populate({
        path: 'assignedTrainer',
        populate: { path: 'userId', select: 'profile' },
      })
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
    )
      .populate('userId', '-password')
      .populate({
        path: 'assignedTrainer',
        populate: { path: 'userId', select: 'profile' },
      });

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

export const getMyProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    console.log(' getMyProfile called, user:', req.user);

    const userId = req.user?.userId;
    if (!userId) {
      console.log(' No userId in request');
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    console.log(' Looking for member with userId:', userId);

    let member = await Member.findOne({ userId });
    if (!member) {
      console.log(
        ' Member not found, creating new member profile for userId:',
        userId
      );
      member = new Member({ userId });
      await member.save();
    }

    const populatedMember = await Member.findById(member._id)
      .populate('userId', '-password')
      .populate({
        path: 'assignedTrainer',
        populate: { path: 'userId', select: 'profile' },
      })
      .populate({
        path: 'currentSubscription',
        populate: { path: 'paymentId' },
      })
      .populate('subscriptionHistory');

    console.log(' Member profile loaded:', populatedMember?._id);
    res.json(populatedMember);
  } catch (error) {
    console.error('Get my profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateMyProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { personalInfo } = req.body;

    const member = await Member.findOneAndUpdate(
      { userId },
      { $set: { personalInfo } },
      { new: true }
    )
      .populate('userId', '-password')
      .populate({
        path: 'assignedTrainer',
        populate: { path: 'userId', select: 'profile' },
      });

    if (!member) {
      res.status(404).json({ message: 'Member profile not found' });
      return;
    }

    res.json(member);
  } catch (error) {
    console.error('Update my profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
