import mongoose, { Schema } from 'mongoose';
import { ISubscription, SubscriptionStatus } from '../types';

const subscriptionSchema = new Schema<ISubscription>({
  memberId: {
    type: Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  plan: {
    name: { type: String, required: true },
    duration: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(SubscriptionStatus),
    default: SubscriptionStatus.ACTIVE,
  },
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<ISubscription>(
  'Subscription',
  subscriptionSchema
);
