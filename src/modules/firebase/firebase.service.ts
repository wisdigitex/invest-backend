import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { v4 as uuid } from 'uuid';

@Injectable()
export class FirebaseService {
  private bucket = admin.storage().bucket();

  async uploadFile(file: Express.Multer.File, folder: string) {
    const uniqueId = uuid();
    const fileName = `${folder}/${Date.now()}-${uniqueId}-${file.originalname}`;
    
    const firebaseFile = this.bucket.file(fileName);
    await firebaseFile.save(file.buffer, {
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: uniqueId
        },
        contentType: file.mimetype,
        cacheControl: 'public,max-age=31536000'
      }
    });

    return `https://firebasestorage.googleapis.com/v0/b/${this.bucket.name}/o/${encodeURIComponent(fileName)}?alt=media&token=${uniqueId}`;
  }
}
