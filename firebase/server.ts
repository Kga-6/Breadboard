import serviceAccount from "./serviceAccount.json"
import { ServiceAccount, cert, getApps, initializeApp } from "firebase-admin/app"
import { getFirestore, Firestore } from "firebase-admin/firestore"

let firestore: Firestore | undefined = undefined

const currentApps = getApps();
if(currentApps.length <0 ){
  if(process.env.NEXT_PUBLIC_APP_ENV==="emulator"){
    process.env["FIRESTORE_EMULATOR_HOST"]=process.env.NEXT_PUBLIC_EMULATOR_FIRESTORE_PATH;
    process.env["FIRESTORE_AUTH_EMULATOR_HOST"]=process.env.NEXT_PUBLIC_EMULATOR_AUTH_PATH;
  }
  const app = initializeApp({
    credential:cert(serviceAccount as ServiceAccount)
  });
  firestore = getFirestore(app);
}else{
  firestore = getFirestore(currentApps[0]);
}

const app = initializeApp({
  credential: cert(serviceAccount as ServiceAccount)
})

export {firestore}