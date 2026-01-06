import mongoose, { Schema } from 'mongoose';
import { ITrainer } from '../types';

const trainerSchema = new Schema<ITrainer>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  specialization: [{ type: String }],
  experience: { type: Number, default: 0 },
  certifications: [{ type: String }],
  assignedMembers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Member',
    },
  ],
  availability: {
    monday: [{ type: String }],
    tuesday: [{ type: String }],
    wednesday: [{ type: String }],
    thursday: [{ type: String }],
    friday: [{ type: String }],
    saturday: [{ type: String }],
    sunday: [{ type: String }],
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
});
export default mongoose.model<ITrainer>('Trainer', trainerSchema);
