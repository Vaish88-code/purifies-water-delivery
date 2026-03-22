// Script to check Firebase configuration
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const envPath = join(process.cwd(), '.env');

console.log('🔍 Checking Firebase Configuration...\n');

if (!existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log('\n📝 Please create a .env file in the project root with the following variables:');
  console.log(`
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
  `);
  console.log('\n💡 Based on your earlier setup, your config should be:');
  console.log(`
VITE_FIREBASE_API_KEY=AIzaSyBelRVOlqr7llPPEZ49y0bKSD5oikhkH9k
VITE_FIREBASE_AUTH_DOMAIN=purifies-b425b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=purifies-b425b
VITE_FIREBASE_STORAGE_BUCKET=purifies-b425b.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=275913752888
VITE_FIREBASE_APP_ID=1:275913752888:web:11915ec36a8e1aa15241cd
  `);
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

  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  let allPresent = true;
  console.log('Checking required environment variables:\n');
  
  requiredVars.forEach(varName => {
    const value = envVars[varName];
    if (value && value !== `your-${varName.toLowerCase().replace('vite_firebase_', '').replace(/_/g, '-')}-here`) {
      console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`❌ ${varName}: Missing or placeholder value`);
      allPresent = false;
    }
  });

  if (allPresent) {
    console.log('\n✅ All Firebase configuration variables are present!');
    console.log('\n⚠️  Note: Restart your dev server (npm run dev) after creating/updating .env file');
  } else {
    console.log('\n❌ Some configuration variables are missing or incomplete.');
    console.log('Please update your .env file with valid Firebase credentials.');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error reading .env file:', error.message);
  process.exit(1);
}

