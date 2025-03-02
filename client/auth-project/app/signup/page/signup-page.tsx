"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/utils/base-url";

export default function SignupPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      // Redirect to login page after successful signup
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>

      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        className="border p-2 rounded mb-2 w-64"
        value={form.firstName}
        onChange={handleChange}
      />
      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
        className="border p-2 rounded mb-2 w-64"
        value={form.lastName}
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        className="border p-2 rounded mb-2 w-64"
        value={form.email}
        onChange={handleChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        className="border p-2 rounded mb-2 w-64"
        value={form.password}
        onChange={handleChange}
      />

      <button
        className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handleSignup}
        disabled={loading}
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <p className="mt-4">
        Already have an account?{" "}
        <span
          className="text-blue-500 cursor-pointer"
          onClick={() => router.push("/login")}
        >
          Login
        </span>
      </p>
    </div>
  );
}
