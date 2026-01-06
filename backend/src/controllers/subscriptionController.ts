import { Response } from 'express';
import Subscription from '../models/subscription';
import Member from '../models/member';
import Payment from '../models/payment';
import { AuthRequest } from '../middleware/auth';
import { PaymentMethod, SubscriptionStatus } from '../types';

interface SubscriptionPlan {
  name: string;
  duration: number;
  price: number;
}

const PLANS: Record<string, SubscriptionPlan> = {
  monthly: { name: 'Monthly', duration: 1, price: 1000 },
  quarterly: { name: 'Quarterly', duration: 3, price: 2700 },
  yearly: { name: 'Yearly', duration: 12, price: 10000 },
};

export const getPlans = (req: AuthRequest, res: Response): void => {
  res.json(PLANS);
};

export const createSubscription = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { memberId, planType, paymentMethod } = req.body;

    const plan = PLANS[planType];
    if (!plan) {
      res.status(400).json({ message: 'Invalid plan' });
      return;
    }

    const member = await Member.findById(memberId);
    if (!member) {
      res.status(404).json({ message: 'Member not found' });
      return;
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.duration);

    // Create payment record
    const payment = new Payment({
      memberId,
      amount: plan.price,
      method: paymentMethod as PaymentMethod,
      status: 'completed',
      transactionId: `TXN${Date.now()}`,
      invoiceNumber: `INV${Date.now()}`,
    });
    await payment.save();

    // Create subscription
    const subscription = new Subscription({
      memberId,
      plan,
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

    res.status(201).json(subscription);
  } catch (error) {
    console.error('Create subscription error:', error);
    res
      .status(500)
      .json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getMemberSubscriptions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { memberId } = req.params;

    const subscriptions = await Subscription.find({ memberId })
      .populate('paymentId')
      .sort({ createdAt: -1 });

    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const pauseSubscription = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findByIdAndUpdate(
      id,
      { status: SubscriptionStatus.PAUSED },
      { new: true }
    );

    if (!subscription) {
      res.status(404).json({ message: 'Subscription not found' });
      return;
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const checkExpiredSubscriptions = async (): Promise<void> => {
  try {
    const now = new Date();

    const result = await Subscription.updateMany(
      { endDate: { $lt: now }, status: SubscriptionStatus.ACTIVE },
      { status: SubscriptionStatus.EXPIRED }
    );

    console.log(`✅ Checked subscriptions: ${result.modifiedCount} expired`);
  } catch (error) {
    console.error('Error checking subscriptions:', error);
  }
};
