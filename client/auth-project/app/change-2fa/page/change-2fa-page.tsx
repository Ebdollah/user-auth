"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/utils/base-url";

export enum SkipType {
  DO_NOT_ASK_AGAIN = "Do Not Ask Again",
  REMIND_ME_LATER = "Remind me after 3 days",
}

export default function Change2FAStatusPage() {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({}); 
  const [message, setMessage] = useState("");
  const [showReminder, setShowReminder] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const reminder_flag = searchParams.get("three_day_reminder_flag") === "true";

  useEffect(() => {
    if (reminder_flag) {
      setShowReminder(true);
    }
  }, [reminder_flag]);

  const handleAction = async (
    actionType: "Enable Now" | SkipType.DO_NOT_ASK_AGAIN | SkipType.REMIND_ME_LATER
  ) => {
    setLoading((prev) => ({ ...prev, [actionType]: true })); 
    setMessage("");

    const token = localStorage.getItem("authToken");

    try {
      const endpoint =
        actionType === "Enable Now"
          ? `${API_BASE_URL}/enable2fa`
          : `${API_BASE_URL}/change2faStatus`;

      const body =
        actionType === "Enable Now"
          ? {}
          : {
              skipType: actionType,
              skipTimestamp: actionType === SkipType.REMIND_ME_LATER ? new Date() : undefined,
            };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update 2FA status");

      setMessage(`Success: ${data.message}`);

      if (actionType === "Enable Now") {
        router.push("/verify-otp?action=0");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, [actionType]: false }));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Change 2FA Status</h1>

      <button
        className="bg-green-500 text-white px-4 py-2 rounded mb-2 w-64"
        onClick={() => handleAction("Enable Now")}
        disabled={loading["Enable Now"]}
      >
        {loading["Enable Now"] ? "Processing..." : "Enable Now"}
      </button>

      <button
        className="bg-gray-500 text-white px-4 py-2 rounded mb-2 w-64"
        onClick={() => handleAction(SkipType.DO_NOT_ASK_AGAIN)}
        disabled={loading[SkipType.DO_NOT_ASK_AGAIN]}
      >
        {loading[SkipType.DO_NOT_ASK_AGAIN] ? "Processing..." : "Don't Ask Again"}
      </button>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-2 w-64"
        onClick={() => handleAction(SkipType.REMIND_ME_LATER)}
        disabled={loading[SkipType.REMIND_ME_LATER]}
      >
        {loading[SkipType.REMIND_ME_LATER] ? "Processing..." : "Remind Me in 3 Days"}
      </button>

      {message && <p className="mt-2 text-center">{message}</p>}

      {/* ✅ Reminder Modal */}
      {showReminder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-semibold mb-4">Reminder: Enable 2FA</h2>
            <p className="text-gray-700 mb-4">
              It's been 3 days since you postponed enabling 2FA. For security, we recommend enabling it now.
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  setShowReminder(false);
                  handleAction("Enable Now");
                }}
                disabled={loading["Enable Now"]}
              >
                {loading["Enable Now"] ? "Processing..." : "Enable Now"}
              </button>
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => setShowReminder(false)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
