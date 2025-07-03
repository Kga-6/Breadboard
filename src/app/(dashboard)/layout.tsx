import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <div>{children}</div>
  );
}
