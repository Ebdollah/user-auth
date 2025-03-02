"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/utils/base-url";

export default function DashboardPage() {
  const [user, setUser] = useState<{ firstName: string; email2fa?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [disabling, setDisabling] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        router.push("/login"); 
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/current-user`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch user");

        setUser(data.user); 
      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleDisable2FA = async () => {
    setDisabling(true);
    setMessage("");

    const token = localStorage.getItem("authToken");

    try {
      const res = await fetch(`${API_BASE_URL}/disable2fa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to disable 2FA");
      router.push('/verify-otp?action=1')

    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setDisabling(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user?.firstName || "User"}! 👋</h1>
      <p className="text-lg text-gray-700">This is your dashboard.</p>

      {/* Disable 2FA Button */}
      
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded mt-4"
          onClick={handleDisable2FA}
          disabled={disabling}
        >
          {disabling ? "Disabling 2FA..." : "Disable 2FA"}
        </button>
      

      {/* Logout Button */}
      <button
        className="bg-red-500 text-white px-4 py-2 rounded mt-4"
        onClick={() => {
          localStorage.removeItem("authToken");
          router.push("/login");
        }}
      >
        Logout
      </button>

      {message && <p className="mt-2 text-center">{message}</p>}
    </div>
  );
}
