"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createUserClient } from "@/lib/supabase";

export default function ForgotPassword() {
  const router = useRouter();
  const supabase = createUserClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Basic validation
    if (!email) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        let errorMessage = resetError.message;
        
        if (resetError.message.includes("rate limit")) {
          errorMessage = "Too many requests. Please try again later.";
        } else if (resetError.message.includes("not found")) {
          // Don't reveal if email exists for security
          errorMessage = "If an account exists with this email, you will receive a password reset link.";
          setSuccess(true);
          setError(null);
          setLoading(false);
          return;
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Success - show message
      setSuccess(true);
      setError(null);
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/logo/logo.svg"
              alt="HYPEBEAST Logo"
              width={200}
              height={48}
              className="h-10 w-auto mx-auto"
              priority
            />
          </Link>
          <h2 className="mt-6 text-3xl font-normal text-gray-900">Reset your password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Reset Password Form */}
        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              <p className="font-medium">Check your email</p>
              <p className="text-sm mt-1">
                If an account exists with this email, you will receive a password reset link shortly.
              </p>
            </div>
          )}

          {error && !success && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || success}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Sending..." : success ? "Email Sent!" : "Send reset link"}
            </button>
          </div>

          <div className="text-center">
            <Link href="/sign-in" className="text-sm font-medium text-black hover:underline">
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

