import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider

export const metadata: Metadata = {
  title: "Breadboard",
  description: "Bible studies with friends!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider> 
      </body>
    </html>
  );
}
