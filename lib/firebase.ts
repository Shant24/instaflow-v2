import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  onAuthStateChanged,
  signInAnonymously,
  type Auth,
  type User,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

type Persistence = unknown;

/**
 * Resolved from firebase/auth at runtime via the Metro "react-native"
 * export condition. It's not declared in firebase/auth's public TS types
 * (those ship the browser surface), so we pull it dynamically and cast.
 */
const getReactNativePersistence = (
  require("firebase/auth") as {
    getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
  }
).getReactNativePersistence;

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export type FirebaseConfigStatus =
  | { ok: true }
  | { ok: false; missing: string[] };

export function checkFirebaseConfig(): FirebaseConfigStatus {
  const required: Array<keyof typeof firebaseConfig> = [
    "apiKey",
    "authDomain",
    "projectId",
    "appId",
  ];
  const missing = required
    .filter((key) => !firebaseConfig[key])
    .map((key) => `EXPO_PUBLIC_FIREBASE_${toEnvSuffix(key)}`);
  return missing.length === 0 ? { ok: true } : { ok: false, missing };
}

function toEnvSuffix(key: string) {
  return key
    .replace(/([A-Z])/g, "_$1")
    .toUpperCase()
    .replace(/^_/, "");
}

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

/**
 * Lazily initializes Firebase. Throws a descriptive error if config is
 * missing so we can render a friendly setup screen instead of crashing at
 * import time.
 */
function ensureInitialized(): {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
} {
  const status = checkFirebaseConfig();
  if (!status.ok) {
    throw new Error(
      `Missing Firebase env vars: ${status.missing.join(", ")}. Add them to .env.local and restart Metro.`,
    );
  }

  if (!_app) {
    _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }

  if (!_auth) {
    try {
      _auth = initializeAuth(_app, {
        persistence: getReactNativePersistence(AsyncStorage) as never,
      });
    } catch {
      _auth = getAuth(_app);
    }
  }

  if (!_db) {
    _db = getFirestore(_app);
  }

  return { app: _app, auth: _auth, db: _db };
}

export function getFirebase() {
  return ensureInitialized();
}

export function getDb(): Firestore {
  return ensureInitialized().db;
}

export function getAuthInstance(): Auth {
  return ensureInitialized().auth;
}

/**
 * Ensures we have an anonymous user. Resolves to the current user once ready.
 * Safe to call multiple times; reuses existing sessions.
 */
export function ensureAnonymousAuth(): Promise<User> {
  const { auth } = ensureInitialized();
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsub();
        resolve(user);
      }
    });

    if (!auth.currentUser) {
      signInAnonymously(auth).catch((err) => {
        unsub();
        reject(err);
      });
    }
  });
}
