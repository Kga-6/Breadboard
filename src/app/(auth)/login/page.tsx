// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext"

export default function Login() {

  const {loginEmail, loginGoogle} = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    setLoading(true)
    e.preventDefault();
    try {
      await loginEmail(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
    setLoading(false)
  };

  const handleloginGoogle = () => {
    setLoading(true)
    loginGoogle()
      .then(() => {
          console.log("Logged in!");
      })
      .catch(() => {
          console.error("Something went wrong");
      });
    setLoading(false)
  };

  return (
    <div className="flex w-full h-full items-center justify-center">
      <div className="bg-gray-200 p-4 rounded-md">
        <h1 className="text-3xl mb-4">Holla, Welcome back!</h1>
        <form onSubmit={handleLogin} className="flex flex-col">
          <input
            className="h-[44px] p-2 rounded-md text-black bg-white shadow-lg border border-gray-100 mb-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            className="h-[44px] p-2 rounded-md text-black bg-white shadow-lg border border-gray-100 mb-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button className="p-2 bg-amber-500 rounded-md text-white" type="submit" disabled={loading}>Login</button>
        </form>
        
        <div className="flex flex-col mt-4">
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          <Link className="text-amber-800 text-sm text-center mb-4" href="/forgot-password">Forgot Password?</Link>
          <button className="bg-white shadow-sm h-[44px] rounded-md mb-4" onClick={handleloginGoogle}>Login in with Google</button>
          <Link className="text-center text-gray-500" href="/register">Don&apos;t have an account? <span className="text-amber-600 font-bold">register</span></Link>
        </div>
      </div>
    </div>
  );
}