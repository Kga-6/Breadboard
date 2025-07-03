import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const cookiesStore = cookies()
  const authToken = cookiesStore.get("firebaseIdToken")?.value

  if(!authToken){
    return redirect("/")
  }

  return (
    <div>{children}</div>
  );
}
