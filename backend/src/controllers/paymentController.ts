import { Response } from 'express';
import Payment from '../models/payment';
import Member from '../models/member';
import Subscription from '../models/subscription';
import Plan from '../models/plan';
import { AuthRequest } from '../middleware/auth';
import { PaymentMethod, SubscriptionStatus } from '../types';

export const getMemberPayments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { memberId } = req.params;

    const payments = await Payment.find({ memberId })
      .populate('subscriptionId')
      .sort({ paymentDate: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Get member payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllPayments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'memberId',
        populate: {
          path: 'userId',
          select: 'profile.firstName profile.lastName email',
        },
      })
      .populate('subscriptionId')
      .sort({ paymentDate: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyPayments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const member = await Member.findOne({ userId });
    if (!member) {
      res.status(404).json({ message: 'Member profile not found' });
      return;
    }

    const payments = await Payment.find({ memberId: member._id })
      .populate('subscriptionId')
      .sort({ paymentDate: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Get my payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createPayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const member = await Member.findOne({ userId });
    if (!member) {
      res.status(404).json({ message: 'Member profile not found' });
      return;
    }

    const { planId, paymentMethod } = req.body;

    // Get plan from database
    const plan = await Plan.findById(planId);

    if (!plan) {
      res.status(400).json({ message: 'Invalid plan' });
      return;
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + plan.duration);

    // Create payment record
    const payment = new Payment({
      memberId: member._id,
      amount: plan.price,
      method: paymentMethod as PaymentMethod,
      status: 'completed',
      transactionId: `TXN${Date.now()}`,
      invoiceNumber: `INV${Date.now()}`,
    });
    await payment.save();

    // Create subscription
    const subscription = new Subscription({
      memberId: member._id,
      plan: {
        name: plan.name,
        duration: plan.duration,
        price: plan.price,
      },
      startDate,
      endDate,
      status: SubscriptionStatus.ACTIVE,
      paymentId: payment._id,
    });
    await subscription.save();

    // Update payment with subscription ID
    payment.subscriptionId = subscription._id;
    await payment.save();

    // Update member
    if (member.currentSubscription) {
      member.subscriptionHistory.push(member.currentSubscription);
    }
    member.currentSubscription = subscription._id;
    await member.save();

    res.status(201).json({ payment, subscription });
  } catch (error) {
    console.error('Create payment error:', error);
    res
      .status(500)
      .json({ message: 'Server error', error: (error as Error).message });
  }
};
