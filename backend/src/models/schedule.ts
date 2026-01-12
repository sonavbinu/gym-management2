import mongoose, { Schema, Document } from 'mongoose';

export interface ISchedule extends Document {
  memberId: mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  routines: {
    day: string;
    exercises: {
      name: string;
      sets: number;
      reps: number;
      weight?: number;
      notes?: string;
      completed?: boolean;
    }[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new Schema<ISchedule>(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    trainerId: {
      type: Schema.Types.ObjectId,
      ref: 'Trainer',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    routines: [
      {
        day: {
          type: String,
          required: true,
          enum: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
        },
        exercises: [
          {
            name: { type: String, required: true },
            sets: { type: Number, required: true },
            reps: { type: Number, required: true },
            weight: { type: Number },
            notes: { type: String },
            completed: { type: Boolean, default: false },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ISchedule>('Schedule', scheduleSchema);
