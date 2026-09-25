import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APKEY,
  authDomain: "cortexai-20945.firebaseapp.com",
  projectId: "cortexai-20945",
  storageBucket: "cortexai-20945.firebasestorage.app",
  messagingSenderId: "244528232921",
  appId: "1:244528232921:web:001ea52ecaaa75965b81c8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth =getAuth(app)
export const googleProvider = new GoogleAuthProvider();