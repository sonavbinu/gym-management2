import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import Member from '../models/member';
import Trainer from '../models/trainer';
import { UserRole, JwtPayload } from '../types';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role, profile } = req.body;

    if (
      !email ||
      !password ||
      !role ||
      !profile?.firstName ||
      !profile?.lastName
    ) {
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 5);

    const user = new User({
      email,
      password: hashedPassword,
      role,
      profile,
    });
    await user.save();

    if (role === UserRole.MEMBER) {
      await Member.create({ userId: user._id });
    } else if (role === UserRole.TRAINER) {
      await Trainer.create({ userId: user._id });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role } as JwtPayload,
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res
      .status(500)
      .json({ message: 'Server error', error: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: 'Please provide email and password',
      });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }
    if (!user.isActive) {
      res.status(403).json({ message: 'Account is deactivated' });
      return;
    }

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role } as JwtPayload,
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
