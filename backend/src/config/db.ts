import dotenv from 'dotenv';
import mongoose from 'mongoose';
import admin from 'firebase-admin'; // Changed from: import * as admin
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uri: string = process.env.MONGODB_URI || '';

export const startServer = async () => {
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');
};

const db = await mongoose.createConnection(uri).asPromise();
export const session = await db.startSession();

// FIREBASE ADMIN SETUP
const databaseURL = process.env.DATABASE_URL;

let firebaseApp: admin.app.App | null = null;
let database: admin.database.Database;
let auth: admin.auth.Auth;

try {
  let serviceAccount: admin.ServiceAccount;

  // Try to load from .env first
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.log('📝 Loading Firebase credentials from .env...');
    const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

    // Validate required fields
    if (!parsed.project_id || !parsed.private_key || !parsed.client_email) {
      throw new Error('Missing required Firebase service account fields');
    }

    // Fix the private key newlines (convert \\n to actual newlines)
    if (parsed.private_key) {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
    }

    serviceAccount = parsed as admin.ServiceAccount;
  } else {
    // Fallback to JSON file
    console.log('📝 Loading Firebase credentials from file...');
    const serviceAccountPath = join(__dirname, '../../firebase-service-account.json');
    const serviceAccountFile = readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(serviceAccountFile) as admin.ServiceAccount;
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseURL,
  });

  auth = admin.auth(firebaseApp);
  database = admin.database(firebaseApp);

  console.log('✅ Firebase Admin initialized successfully');
  console.log(`📍 Firebase Database: ${databaseURL}`);
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  console.log('⚠️ Creating mock Firebase instance for development...');

  // Mock database
  database = {
    ref: (path: string) => ({
      set: async (data: any) => {
        console.log(`📍 MOCK: Would update location at ${path}`, data);
        return Promise.resolve();
      },
      get: async () => ({
        exists: () => false,
        val: () => null,
      }),
      update: async (data: any) => {
        console.log(`📍 MOCK: Would update at ${path}`, data);
        return Promise.resolve();
      },
      remove: async () => {
        console.log(`📍 MOCK: Would remove location at ${path}`);
        return Promise.resolve();
      },
      once: async () => ({
        exists: () => false,
        val: () => null,
      }),
    }),
  } as any;

  auth = {
    verifyIdToken: async () => {
      throw new Error('Firebase Auth not initialized - running in mock mode');
    },
    createUser: async () => {
      throw new Error('Firebase Auth not initialized - running in mock mode');
    },
  } as any;
}

export { auth, database };
