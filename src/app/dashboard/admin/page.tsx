import { cookies } from "next/headers";
import { auth } from "../../../../firebase/server";
import { DecodedIdToken } from "firebase-admin/auth";

export default async function Admin(){

  const cookieStore = cookies();
  const authToken = (await cookieStore).get("firebaseIdToken")?.value;

  let user: DecodedIdToken | null = null;
  try {
      user = await auth.verifyIdToken(authToken);
  } catch (error) {
      // One possible error is the token being expired, return forbidden
      console.log(error);
  }

  if (!user) {
      return <h1 className=" text-xl mb-10">Restricted</h1>;
      // return redirect("/");
  }

  const isAdmin = user.role === "admin";

  if (!isAdmin) {
      return <h1 className=" text-xl mb-10">Restricted</h1>;
  }

  return (
    <div >
      <h1 className="text-3xl font-bold mb-4">Admin</h1>
      <p className="text-gray-600">Welcome, {user.email}</p>
    </div>
  );
}