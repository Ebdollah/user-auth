"use client";

import { useState } from "react";
import { API_BASE_URL } from '@/utils/base-url'
import { useRouter } from "next/navigation";

export enum SkipType {
    DO_NOT_ASK_AGAIN = "Do Not Ask Again",
    REMIND_ME_LATER = "Remind me after 3 days",
}

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Login failed");
            localStorage.setItem("authToken", data.token);

            const token = data.token;

            const { email2faStatus, skipType } = data;
            if (skipType === SkipType.DO_NOT_ASK_AGAIN) {
                router.push("/dashboard");
                return;
            }

            const triggerRes = await fetch(`${API_BASE_URL}/trigger-otp-verification`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const triggerData = await triggerRes.json();
            if (!triggerRes.ok) throw new Error(triggerData.message || "Failed to trigger OTP verification");


            if (email2faStatus === true) {
                router.push("/verify-otp");
            } else if (email2faStatus === false && skipType === SkipType.REMIND_ME_LATER) {
                if (triggerData?.data?.three_day_reminder_flag) {
                    router.push("/change-2fa?three_day_reminder_flag=true");
                } else {
                    router.push("/dashboard");
                }
            } else if (email2faStatus === null || skipType === null) {
                router.push("/change-2fa");
            }

            console.log("Login successful:", data);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            <input
                type="email"
                placeholder="Email"
                className="border p-2 rounded mb-2 w-64"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                className="border p-2 rounded mb-2 w-64"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                onClick={handleLogin}
                disabled={loading}
            >
                {loading ? "Logging in..." : "Login"}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
}
