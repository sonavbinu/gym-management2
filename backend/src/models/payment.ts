import mongoose, { Schema } from 'mongoose';
import { IPayment, PaymentMethod, PaymentStatus } from '../types';

const paymentSchema = new Schema<IPayment>({
  memberId: {
    type: Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  subscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription',
  },
  amount: {
    type: Number,
    required: true,
  },
  method: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.COMPLETED,
  },
  transactionId: { type: String },
  invoiceNumber: { type: String },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IPayment>('Payment', paymentSchema);
