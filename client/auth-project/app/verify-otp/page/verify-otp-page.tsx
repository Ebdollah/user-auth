"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/utils/base-url";

function VerifyOtpComponent() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  let action = null;
  if (searchParams.get("action") === "1") {
    action = 1;
  } else if (searchParams.get("action") === "0") {
    action = 0;
  }

  const handleVerifyOtp = async () => {
    setLoading(true);
    setMessage("");

    const token = localStorage.getItem("authToken");

    try {
      const res = await fetch(`${API_BASE_URL}/otp-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp_code: otp, action: action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP verification failed");

      setMessage("OTP Verified Successfully!");

      if (data.data?.Access_Token) {
        localStorage.setItem("authToken", data.data.Access_Token);
      }

      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Enter OTP</h1>

      <input
        type="text"
        placeholder="Enter OTP"
        className="border p-2 rounded mb-2 w-64 text-center"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-2 w-64"
        onClick={handleVerifyOtp}
        disabled={loading || otp.length === 0}
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      {message && <p className="mt-2 text-center">{message}</p>}
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpComponent />
    </Suspense>
  );
}
