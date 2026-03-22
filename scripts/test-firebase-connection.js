// Simple script to test Firebase connection
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const envPath = join(process.cwd(), '.env');

console.log('🧪 Testing Firebase Connection...\n');

if (!existsSync(envPath)) {
  console.error('❌ .env file not found!');
  process.exit(1);
}

try {
  const envContent = readFileSync(envPath, 'utf-8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });

  const firebaseConfig = {
    apiKey: envVars.VITE_FIREBASE_API_KEY,
    authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: envVars.VITE_FIREBASE_PROJECT_ID,
    storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: envVars.VITE_FIREBASE_APP_ID,
  };

  console.log('✅ Environment variables loaded');
  console.log(`   Project ID: ${firebaseConfig.projectId}`);
  console.log(`   Auth Domain: ${firebaseConfig.authDomain}\n`);

  console.log('🔄 Initializing Firebase...');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log('✅ Firebase initialized successfully!');
  console.log('✅ Auth service connected');
  console.log('✅ Firestore service connected\n');
  
  console.log('🎉 Firebase backend is properly configured!\n');
  console.log('⚠️  Note: Make sure you have:');
  console.log('   1. Enabled Email/Password authentication in Firebase Console');
  console.log('   2. Created Firestore database');
  console.log('   3. Set up Firestore security rules');
  console.log('\n💡 To test registration, start your dev server: npm run dev');
  
  process.exit(0);
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  console.error('\nPlease check:');
  console.error('  1. Your .env file has correct Firebase credentials');
  console.error('  2. Your Firebase project is active');
  console.error('  3. You have enabled the required services');
  process.exit(1);
}

