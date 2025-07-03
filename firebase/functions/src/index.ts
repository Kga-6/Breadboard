import * as functions from "firebase-functions/v1";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

initializeApp();

const db = getFirestore();

// Define admin/pro emails (consider moving to environment variables)
const ADMIN_EMAILS = ["admin@example.com"];
const PRO_EMAILS = ["pro@example.com"];

export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  // Validate required user data
  if (!user?.email || !user?.uid) {
    console.error("Missing required user data:", { 
      email: user?.email, 
      uid: user?.uid 
    });
    return;
  }

  try {
    const isAdmin = ADMIN_EMAILS.includes(user.email);
    const isPro = isAdmin || PRO_EMAILS.includes(user.email);

    // Create user document with isPro flag
    await db.doc(`users/${user.uid}`).set({
      isPro: isPro,
      email: user.email,
      createdAt: new Date().toISOString(),
      name: user.displayName || null,
      photoURL: user.photoURL || null,
    });

    console.log(`User document created for ${user.email} with isPro: ${isPro}`);

    // Set custom claims for admin users
    if (isAdmin) {
      await getAuth().setCustomUserClaims(user.uid, { 
        role: "admin",
        isPro: true 
      });
      console.log(`Admin custom claims set for ${user.email}`);
    } else if (isPro) {
      await getAuth().setCustomUserClaims(user.uid, { 
        isPro: true 
      });
      console.log(`Pro custom claims set for ${user.email}`);
    }

  } catch (error) {
    console.error("Error in onUserCreate function:", error);
    // Optionally re-throw to trigger retries
    // throw error;
  }
});