"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, Functions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyC-nX_G4Hv3cNOo8sQJnOiHa5N16p3f514",
  authDomain: "breadboard-3b5b8.firebaseapp.com",
  projectId: "breadboard-3b5b8",
  storageBucket: "breadboard-3b5b8.firebasestorage.app",
  messagingSenderId: "656693529157",
  appId: "1:656693529157:web:71e3b1073bbfd61a37712c",
  measurementId: "G-M2RVJG5TD0"
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth: Auth = getAuth(app);
const firestore: Firestore = getFirestore(app);
const functions: Functions = getFunctions(app);

// Connect to emulators if in a development environment
// This check ensures you only use emulators locally
if (process.env.NODE_ENV === 'development') {
    console.log("Connecting to Firebase Emulators...");
    try {
        connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
        connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
        connectFunctionsEmulator(functions, '127.0.0.1', 5001);
        console.log("Successfully connected to emulators.");
    } catch (error) {
        console.error("Error connecting to emulators:", error);
    }
}

// Export the initialized services
export { auth, firestore, functions };