import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from backend/.env or root env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

import { connectDB, mongoose } from '../config/db';
import { Achievement } from '../features/gamification/achievement.model';
import { HabitTemplate } from '../features/habits/habit-template.model';
import { achievementsSeed } from './achievements.seed';
import { habitTemplatesSeed } from './habitTemplates.seed';

async function seed() {
  console.log('Starting seed script...');
  
  if (!process.env.MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    await connectDB();
    console.log('Connected to MongoDB successfully.');

    // 1. Seed Achievements
    console.log('Seeding achievements...');
    // Upsert achievements based on key
    for (const achievementData of achievementsSeed) {
      await Achievement.findOneAndUpdate(
        { key: achievementData.key },
        achievementData,
        { upsert: true, new: true }
      );
    }
    console.log(`Successfully seeded ${achievementsSeed.length} achievements.`);

    // 2. Seed Habit Templates
    console.log('Seeding habit templates...');
    // Clear old system templates and insert new ones
    await HabitTemplate.deleteMany({ isSystem: true });
    await HabitTemplate.insertMany(habitTemplatesSeed);
    console.log(`Successfully seeded ${habitTemplatesSeed.length} habit templates.`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
