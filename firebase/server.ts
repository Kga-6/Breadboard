// firebase/server.ts
import { getApps, initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let firestore: Firestore | undefined;
let auth: Auth | undefined;

// Construct service account from env vars
const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")!,
};

if (!getApps().length) {
  if (process.env.NEXT_PUBLIC_APP_ENV === "emulator") {
    process.env.FIRESTORE_EMULATOR_HOST = process.env.NEXT_PUBLIC_EMULATOR_FIRESTORE_PATH!;
    process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.NEXT_PUBLIC_EMULATOR_AUTH_PATH!;

    process.env.LIVEBLOCKS_PUBLIC_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!;
    process.env.LIVEBLOCKS_SECRET_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_SECRET_KEY!;
  }

  const app = initializeApp({ credential: cert(serviceAccount) });
  firestore = getFirestore(app);
  auth = getAuth(app);
} else {
  firestore = getFirestore();
  auth = getAuth();
}

export { firestore, auth };

























// import {
//     ServiceAccount,
//     cert,
//     getApps,
//     initializeApp,
// } from "firebase-admin/app";
// import { Firestore, getFirestore } from "firebase-admin/firestore";
// import serviceAccount from "./serviceAccount.json";
// import { Auth, getAuth } from "firebase-admin/auth";

// let firestore: Firestore | undefined = undefined;
// let auth: Auth | undefined = undefined;

// const currentApps = getApps();
// if (currentApps.length <= 0) {
//     if (process.env.NEXT_PUBLIC_APP_ENV === "emulator") {
//         process.env["FIRESTORE_EMULATOR_HOST"] =
//             process.env.NEXT_PUBLIC_EMULATOR_FIRESTORE_PATH;
//         process.env["FIREBASE_AUTH_EMULATOR_HOST"] =
//             process.env.NEXT_PUBLIC_EMULATOR_AUTH_PATH;
//     }

//     const app = initializeApp({
//         credential: cert(serviceAccount as ServiceAccount),
//     });

//     firestore = getFirestore(app);
//     auth = getAuth(app);
// } else {
//     firestore = getFirestore(currentApps[0]);
//     auth = getAuth(currentApps[0]);
// }

// export { firestore, auth };
