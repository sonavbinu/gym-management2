import mongoose, { Schema } from 'mongoose';
import { Document } from 'mongoose';

export interface IPlan extends Document {
  name: string;
  duration: number; // in months
  price: number;
  createdAt: Date;
}

const planSchema = new Schema<IPlan>({
  name: { type: String, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPlan>('Plan', planSchema);
