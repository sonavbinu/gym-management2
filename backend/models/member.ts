import mongoose, { Schema } from 'mongoose';
import { IMember, Gender } from '../types';

const memberSchema = new Schema<IMember>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  personalInfo: {
    height: { type: Number },
    weight: { type: Number },
    age: { type: Number },
    gender: {
      type: String,
      enum: Object.values(Gender),
    },
    goal: { type: String },
    medicalConditions: { type: String },
  },
  assignedTrainer: {
    type: Schema.Types.ObjectId,
    ref: 'Trainer',
  },
  currentSubscription: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription',
  },
  subscriptionHistory: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
    },
  ],
  joinDate: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IMember>('Member', memberSchema);
