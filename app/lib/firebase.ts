// lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  Auth,
} from "firebase/auth";

let firebaseApp: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    firebaseApp =
      getApps()[0] ??
      initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId:
          process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      });
  }

  return firebaseApp;
}

export function getDb(): Firestore {
  if (!db) {
    const app = getFirebaseApp();
    db = getFirestore(app);
  }
  return db;
}

export function getAuthInstance(): Auth {
  if (!auth) {
    const app = getFirebaseApp();
    auth = getAuth(app);
  }
  return auth;
}

export function getGoogleProvider(): GoogleAuthProvider {
  if (!googleProvider) {
    googleProvider = new GoogleAuthProvider();
  }
  return googleProvider;
}
