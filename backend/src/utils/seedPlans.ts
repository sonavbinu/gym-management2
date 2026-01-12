import Plan from '../models/plan';

export const seedPlans = async () => {
  try {
    // Check if plans already exist
    const existingPlans = await Plan.find();
    if (existingPlans.length > 0) {
      console.log('Plans already exist, skipping seed');
      return;
    }

    // Create default plans
    const plans = [
      {
        name: 'Basic Plan',
        duration: 1,
        price: 999,
      },
      {
        name: 'Standard Plan',
        duration: 3,
        price: 2499,
      },
      {
        name: 'Premium Plan',
        duration: 6,
        price: 4499,
      },
      {
        name: 'Annual Plan',
        duration: 12,
        price: 7999,
      },
    ];

    await Plan.insertMany(plans);
    console.log('Default plans seeded successfully');
  } catch (error) {
    console.error('Error seeding plans:', error);
  }
};
