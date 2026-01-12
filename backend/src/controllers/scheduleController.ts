import { Response } from 'express';
import Schedule from '../models/schedule';
import Trainer from '../models/trainer';
import Member from '../models/member';
import { AuthRequest } from '../middleware/auth';

// Create a new schedule
export const createSchedule = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { memberId, startDate, endDate, routines } = req.body;

    // Find trainer
    const trainer = await Trainer.findOne({ userId: req.user?.userId });
    if (!trainer) {
      res.status(404).json({ message: 'Trainer profile not found' });
      return;
    }

    if (!memberId || !startDate || !endDate || !routines) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const schedule = new Schedule({
      memberId,
      trainerId: trainer._id,
      startDate,
      endDate,
      routines,
    });

    await schedule.save();

    res.status(201).json(schedule);
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get schedule for a member
export const getMemberSchedule = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { memberId } = req.params;

    const schedules = await Schedule.find({ memberId })
      .sort({ startDate: -1 })
      .populate('trainerId', 'specialization');

    res.json(schedules);
  } catch (error) {
    console.error('Get member schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a schedul
export const updateSchedule = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const schedule = await Schedule.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!schedule) {
      res.status(404).json({ message: 'Schedule not found' });
      return;
    }

    res.json(schedule);
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateExerciseStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { day, exerciseIndex, completed } = req.body;

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      res.status(404).json({ message: 'Schedule not found' });
      return;
    }

    // Verify ownership (Member or assigned Trainer/Admin)
    if (req.user?.role === 'member') {
      const member = await Member.findOne({ userId: req.user.userId });
      if (!member || schedule.memberId.toString() !== member._id.toString()) {
        res
          .status(403)
          .json({ message: 'Not authorized to update this schedule' });
        return;
      }
    }

    const routine = schedule.routines.find(r => r.day === day);
    if (!routine) {
      res.status(404).json({ message: 'Routine day not found' });
      return;
    }

    if (!routine.exercises[exerciseIndex]) {
      res.status(404).json({ message: 'Exercise not found' });
      return;
    }

    routine.exercises[exerciseIndex].completed = completed;
    await schedule.save();

    res.json(schedule);
  } catch (error) {
    console.error('Update exercise status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMemberProgressStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { memberId } = req.params;

    // Get the most recent schedule
    const schedule = await Schedule.findOne({ memberId }).sort({
      createdAt: -1,
    });

    if (!schedule) {
      res.json({
        weeklyCompletion: [],
        overallConsistency: 0,
      });
      return;
    }

    const weeklyCompletion = schedule.routines.map(routine => {
      const total = routine.exercises.length;
      const completed = routine.exercises.filter(e => e.completed).length;
      return {
        day: routine.day,
        total,
        completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });

    // Sort by day of week
    const dayOrder = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    weeklyCompletion.sort(
      (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
    );

    const totalExercises = weeklyCompletion.reduce(
      (sum, day) => sum + day.total,
      0
    );
    const totalCompleted = weeklyCompletion.reduce(
      (sum, day) => sum + day.completed,
      0
    );
    const overallConsistency =
      totalExercises > 0
        ? Math.round((totalCompleted / totalExercises) * 100)
        : 0;

    res.json({
      weeklyCompletion,
      overallConsistency,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
