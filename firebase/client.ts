"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyC-nX_G4Hv3cNOo8sQJnOiHa5N16p3f514",
  authDomain: "breadboard-3b5b8.firebaseapp.com",
  projectId: "breadboard-3b5b8",
  storageBucket: "breadboard-3b5b8.firebasestorage.app",
  messagingSenderId: "656693529157",
  appId: "1:656693529157:web:71e3b1073bbfd61a37712c",
  measurementId: "G-M2RVJG5TD0"
};


let auth:Auth | undefined = undefined

const currentApps = getApps();
if(currentApps.length <=0 ){
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  if(
    process.env.NEXT_PUBLIC_APP_ENV === "emulator" &&
    process.env.NEXT_PUBLIC_EMULATOR_AUTH_PATH
  ) {
    connectAuthEmulator(
      auth,
      `http://${process.env.NEXT_PUBLIC_EMULATOR_AUTH_PATH}`
    )
  }
}else{
  auth = getAuth(currentApps[0]);
  if(
    process.env.NEXT_PUBLIC_APP_ENV === "emulator" &&
    process.env.NEXT_PUBLIC_EMULATOR_AUTH_PATH
  ) {
    connectAuthEmulator(
      auth,
      `http://${process.env.NEXT_PUBLIC_EMULATOR_AUTH_PATH}`
    )
  }
}

export { auth }