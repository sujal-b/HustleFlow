import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    // This assumes your serviceAccountKey.json is in the root directory.
    // Make sure this path is correct for your project structure.
    const serviceAccount = require('../../serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const db = admin.firestore();
export { admin }; // Export the entire admin object