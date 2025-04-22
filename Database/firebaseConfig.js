// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyANQDDc-s10INbRQivkIHd1EC47V6n4q9c",
  authDomain: "truet-we.firebaseapp.com",
  projectId: "truet-we",
  storageBucket: "truet-we.appspot.com",
  messagingSenderId: "491625787819",
  appId: "1:491625787819:web:481bae47b092a3f45d22ee",
  measurementId: "G-TDRXYJXH2L"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
