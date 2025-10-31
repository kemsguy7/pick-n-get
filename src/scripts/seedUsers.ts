import mongoose from 'mongoose';
import { User } from '../models/userModel';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pickngET';

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('📦 Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});

    // Create seed users
    const users = [
      {
        id: 1,
        name: 'Kemsguy',
        email: 'john@example.com',
        phoneNumber: '+2347032739465',
        role: 'Recycler',
        status: 'Active',
        country: 'Nigeria',
        totalRecycled: 45.5,
        totalEarnings: 2450,
        co2Saved: 23.4,
        totalPickups: 12,
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        phoneNumber: '+2348087654321',
        role: 'Recycler',
        status: 'Active',
        country: 'Nigeria',
        totalRecycled: 32.1,
        totalEarnings: 1800,
        co2Saved: 18.2,
        totalPickups: 8,
      },
    ];

    await User.insertMany(users);

    console.log('✅ Seed users created successfully!');
    console.log('Test with these numbers:');
    users.forEach((user) => {
      console.log(`- ${user.name}: ${user.phoneNumber}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
