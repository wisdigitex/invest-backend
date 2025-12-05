import { Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseService } from './firebase.service';

const firebaseParams = process.env.FIREBASE_ADMIN_KEY
  ? JSON.parse(process.env.FIREBASE_ADMIN_KEY)
  : null;

if (firebaseParams) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseParams),
    storageBucket: firebaseParams.project_id + '.appspot.com',
  });
}

@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
