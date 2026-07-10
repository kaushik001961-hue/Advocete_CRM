"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginForm() {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    setError("");

    const res = await signIn(
      "credentials",
      {
        email,
        password,
        redirect: true,
        callbackUrl: "/",
      }
    );

    if (res?.error) {
      setError("Invalid credentials");
    }
  }

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        className="w-full border rounded-lg p-3"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        className="w-full border rounded-lg p-3"
      />

      {error && (
        <p className="text-red-600">
          {error}
        </p>
      )}

      <button
        className="w-full bg-blue-600 text-white py-3 rounded-lg"
      >
        Login
      </button>

    </form>

  );
}
