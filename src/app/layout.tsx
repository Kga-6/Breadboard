import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider
import { ThemeProvider } from "next-themes";

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
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>{children}</AuthProvider> 
        </ThemeProvider>
      </body>
    </html>
  );
}
