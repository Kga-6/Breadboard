import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC-nX_G4Hv3cNOo8sQJnOiHa5N16p3f514",
  authDomain: "breadboard-3b5b8.firebaseapp.com",
  projectId: "breadboard-3b5b8",
  storageBucket: "breadboard-3b5b8.firebasestorage.app",
  messagingSenderId: "656693529157",
  appId: "1:656693529157:web:71e3b1073bbfd61a37712c",
  measurementId: "G-M2RVJG5TD0"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };