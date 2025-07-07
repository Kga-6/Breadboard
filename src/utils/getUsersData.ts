// lib/firebase/userData.ts
import { firestore } from "@/../firebase/server";

export async function getUserData(userId: string) {
  if (!firestore) {
    throw new Error("Firestore not initialized");
  }

  const userDocumentRef = firestore.collection("users").doc(userId);
  const userDocument = await userDocumentRef.get();

  if (!userDocument.exists) {
    return null;
  }

  const friendsCollection = await userDocumentRef.collection("friends").get();
  const friends = friendsCollection.docs.map(doc => doc.id);

  return {
    ...userDocument.data(),
    friends
  };
}
