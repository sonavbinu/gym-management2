import mongoose from 'mongoose';
import Plan from './models/plan';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const cleanupPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    const plans = await Plan.find({}).sort({ price: 1 });
    const uniquePlans = new Map();
    const duplicates = [];

    for (const plan of plans) {
      // Key based on name and price
      const key = `${plan.name}-${plan.price}`;
      if (uniquePlans.has(key)) {
        duplicates.push(plan._id);
      } else {
        uniquePlans.set(key, plan._id);
      }
    }

    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} duplicate plans. Deleting...`);
      await Plan.deleteMany({ _id: { $in: duplicates } });
      console.log('Duplicates deleted successfully.');
    } else {
      console.log('No duplicate plans found.');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error cleaning up plans:', error);
    process.exit(1);
  }
};

cleanupPlans();
