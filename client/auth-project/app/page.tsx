'use client'
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-6 sm:p-20">
      <h1 className="text-3xl font-bold mb-6">Welcome to Our App 🚀</h1>

      <div className="flex gap-4">
        <button
          className="bg-blue-500 text-white px-6 py-3 rounded-lg"
          onClick={() => router.push("/login")}
        >
          Login
        </button>

        <button
          className="bg-green-500 text-white px-6 py-3 rounded-lg"
          onClick={() => router.push("/signup")}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
