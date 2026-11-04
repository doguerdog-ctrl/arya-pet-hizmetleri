import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import * as path from 'path';
import { LocalFirestore } from './localFirestore';

dotenv.config();

// Yerel mod: Firebase kimliği (FIREBASE_SERVICE_ACCOUNT_KEY) ve Firestore emulator yoksa veriler
// bir JSON dosyasında tutulur. USE_LOCAL_DB=true bunu zorlar, USE_LOCAL_DB=false gerçek Firestore'u zorlar.
const forced = process.env.USE_LOCAL_DB;
export const isLocalDb =
  forced === 'true' ||
  (forced !== 'false' && !process.env.FIREBASE_SERVICE_ACCOUNT_KEY && !process.env.FIRESTORE_EMULATOR_HOST);

function createDb(): admin.firestore.Firestore {
  if (isLocalDb) {
    const file = process.env.LOCAL_DB_FILE || path.resolve(__dirname, '../../.local-db.json');
    console.log(`🗄️  Yerel mock veritabanı kullanılıyor (Firebase kimliği yok): ${file}`);
    // Servislerin kullandığı Firestore alt kümesini sağlar (bkz. localFirestore.ts)
    return new LocalFirestore(file) as unknown as admin.firestore.Firestore;
  }

  // Firebase Admin SDK ilklendirmesi
  if (!admin.apps.length) {
    try {
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      } else {
        // Firestore emulator veya default uygulama credential'ı
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'arya-pet-nakil'
        });
      }
    } catch (error) {
      console.warn('Firebase başlatılırken uyarı:', error);
    }
  }
  return admin.firestore();
}

export const db = createDb();

// Firestore Koleksiyon İsimleri Sabitleri
export const COLLECTIONS = {
  USERS: 'users',
  PETS: 'pets',
  BOOKINGS: 'bookings',
  SETTINGS: 'system_settings',
  SAH_LISTINGS: 'sah_listings',
  PRODUCTS: 'products',
  GROOMING: 'grooming_appointments',
  BLOG_POSTS: 'blog_posts'
} as const;
