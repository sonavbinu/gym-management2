import { Response } from 'express';
import Payment from '../models/payment';
import { AuthRequest } from '../middleware/auth';

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
