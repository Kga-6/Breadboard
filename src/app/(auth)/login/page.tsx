// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../../firebase/client";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext"
import { useRouter } from "next/navigation";

export default function Login() {

  const {loginEmail, loginGoogle} = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginEmail(email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleloginGoogle = () => {
    loginGoogle()
      .then(() => {
          console.log("Logged in!");
      })
      .catch(() => {
          console.error("Something went wrong");
      });
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
        {error && <p>{error}</p>}
      </form>
      <Link href="/register">Don't have an account? Register</Link>
      <br />
      <Link href="/forgot-password">Forgot Password?</Link>
      <button onClick={handleloginGoogle}>Use Google</button>
    </div>
  );
}