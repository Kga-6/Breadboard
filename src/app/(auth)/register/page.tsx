"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext"

export default function Register() {

  const {registerEmail, loginGoogle} = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      const res = await registerEmail(email, password);
      if (!res.success) {
        setError(res.msg);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
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
        <h1 className="text-3xl mb-4">Create an account</h1>
        <form onSubmit={handleRegister} className="flex flex-col">
          {/* <input
            className="h-[44px] p-2 rounded-md text-black bg-white shadow-lg border border-gray-100 mb-2"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
          /> */}
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
          <input
            className="h-[44px] p-2 rounded-md text-black bg-white shadow-lg border border-gray-100 mb-2"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            required
          />
          <button className="p-2 bg-amber-500 rounded-md text-white" type="submit" disabled={loading}>Create account</button>
        </form>

        <div className="flex flex-col mt-4">

          <button className="bg-white shadow-sm h-[44px] rounded-md mb-4" onClick={handleloginGoogle}>Sign up with Google</button>
          <Link className="text-center text-gray-500" href="/login">Have an account? <span className="text-amber-600 font-bold">login</span></Link>
        </div>
      </div>
    </div>
  );
}