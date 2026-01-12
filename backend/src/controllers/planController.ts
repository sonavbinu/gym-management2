import { Response } from 'express';
import Plan from '../models/plan';
import { AuthRequest } from '../middleware/auth';

export const getAllPlans = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    res.json(plans);
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createPlan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, duration, price } = req.body;
    if (!name || duration === undefined || price === undefined) {
      res
        .status(400)
        .json({ message: 'name, duration and price are required' });
      return;
    }

    const plan = new Plan({ name, duration, price });
    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updatePlan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, duration, price } = req.body;

    const plan = await Plan.findByIdAndUpdate(
      id,
      { name, duration, price },
      { new: true }
    );

    if (!plan) {
      res.status(404).json({ message: 'Plan not found' });
      return;
    }

    res.json(plan);
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deletePlan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const plan = await Plan.findByIdAndDelete(id);
    if (!plan) {
      res.status(404).json({ message: 'Plan not found' });
      return;
    }

    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
