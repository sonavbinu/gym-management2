import { Response } from 'express';
import Subscription from '../models/subscription';
import Member from '../models/member';
import Payment from '../models/payment';
import Plan from '../models/plan';
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

const resolvePlan = async (planId?: string, planType?: string) => {
  if (planId) {
    const dbPlan = await Plan.findById(planId);
    if (!dbPlan) return null;
    return {
      name: dbPlan.name,
      duration: dbPlan.duration,
      price: dbPlan.price,
    };
  }
  if (planType) {
    return PLANS[planType] || null;
  }
  return null;
};

export const getPlans = (req: AuthRequest, res: Response): void => {
  res.json(PLANS);
};

export const createSubscription = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { memberId, planId, planType, paymentMethod } = req.body;

    const plan = await resolvePlan(planId, planType);
    if (!plan) {
      res.status(400).json({ message: 'Invalid plan' });
      return;
    }

    const member = await Member.findById(memberId);
    if (!member) {
      res.status(404).json({ message: 'Member not found' });
      return;
    }

    // Calculate dates (by months)
    const startDate = new Date();
    const endDate = new Date(startDate);
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
export const subscribeMe = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { planId, planType, paymentMethod } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const member = await Member.findOne({ userId });
    if (!member) {
      res.status(404).json({ message: 'Member profile not found' });
      return;
    }

    const plan = await resolvePlan(planId, planType);
    if (!plan) {
      res.status(400).json({ message: 'Invalid plan' });
      return;
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + plan.duration);

    const payment = await Payment.create({
      memberId: member._id,
      amount: plan.price,
      method: paymentMethod as PaymentMethod,
      status: 'completed',
      transactionId: `TXN${Date.now()}`,
      invoiceNumber: `INV${Date.now()}`,
    });

    const subscription = await Subscription.create({
      memberId: member._id,
      plan,
      startDate,
      endDate,
      status: SubscriptionStatus.ACTIVE,
      paymentId: payment._id,
    });

    payment.subscriptionId = subscription._id;
    await payment.save();

    if (member.currentSubscription) {
      member.subscriptionHistory.push(member.currentSubscription);
    }

    member.currentSubscription = subscription._id;
    await member.save();

    res.status(201).json(subscription);
  } catch (error) {
    console.error('Subscribe me error:', error);
    res.status(500).json({ message: 'Server error' });
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

export const assignPlanToMember = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { memberId } = req.params;
    const { planId, planKey, paymentMethod } = req.body;

    const plan = await resolvePlan(planId, planKey);
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
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + plan.duration);

    // Create payment record
    const payment = new Payment({
      memberId,
      amount: plan.price,
      method: (paymentMethod as PaymentMethod) || PaymentMethod.CASH,
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
    console.error('Assign plan error:', error);
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

export const getAllSubscriptions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const subscriptions = await Subscription.find()
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
    res.status(500).json({ message: 'Server error' });
  }
};

export const resumeSubscription = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findByIdAndUpdate(
      id,
      { status: SubscriptionStatus.ACTIVE },
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

    console.log(` Checked subscriptions: ${result.modifiedCount} expired`);
  } catch (error) {
    console.error('Error checking subscriptions:', error);
  }
};

// Member-specific subscription endpoints
export const getMySubscriptions = async (
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

    const subscriptions = await Subscription.find({ memberId: member._id })
      .populate('paymentId')
      .sort({ createdAt: -1 });

    res.json(subscriptions);
  } catch (error) {
    console.error('Get my subscriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
export const getMyCurrentSubscription = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const member = await Member.findOne({ userId }).populate({
      path: 'currentSubscription',
      populate: { path: 'paymentId' },
    });

    if (!member || !member.currentSubscription) {
      res.json(null);
      return;
    }

    res.json(member.currentSubscription);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const pauseMySubscription = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const member = await Member.findOne({ userId });
    if (!member) {
      res.status(404).json({ message: 'Member profile not found' });
      return;
    }

    const subscription = await Subscription.findOne({
      _id: id,
      memberId: member._id,
    });

    if (!subscription) {
      res.status(404).json({ message: 'Subscription not found' });
      return;
    }

    subscription.status = SubscriptionStatus.PAUSED;
    await subscription.save();

    res.json(subscription);
  } catch (error) {
    console.error('Pause my subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resumeMySubscription = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const member = await Member.findOne({ userId });
    if (!member) {
      res.status(404).json({ message: 'Member profile not found' });
      return;
    }

    const subscription = await Subscription.findOne({
      _id: id,
      memberId: member._id,
    });

    if (!subscription) {
      res.status(404).json({ message: 'Subscription not found' });
      return;
    }

    subscription.status = SubscriptionStatus.ACTIVE;
    await subscription.save();

    res.json(subscription);
  } catch (error) {
    console.error('Resume my subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const cancelMySubscription = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const member = await Member.findOne({ userId });
    if (!member) {
      res.status(404).json({ message: 'Member profile not found' });
      return;
    }

    const subscription = await Subscription.findOne({
      _id: id,
      memberId: member._id,
    });

    if (!subscription) {
      res.status(404).json({ message: 'Subscription not found' });
      return;
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    await subscription.save();

    res.json(subscription);
  } catch (error) {
    console.error('Cancel my subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteSubscription = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      res.status(404).json({ message: 'Subscription not found' });
      return;
    }

    // Update member's currentSubscription and history
    const member = await Member.findById(subscription.memberId);
    if (member) {
      if (member.currentSubscription?.toString() === id) {
        member.currentSubscription = undefined;
      }
      member.subscriptionHistory = member.subscriptionHistory.filter(
        subId => subId.toString() !== id
      );
      await member.save();
    }

    // Delete associated payment if exists
    if (subscription.paymentId) {
      await Payment.findByIdAndDelete(subscription.paymentId);
    }

    // Delete subscription
    await Subscription.findByIdAndDelete(id);

    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Delete subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
