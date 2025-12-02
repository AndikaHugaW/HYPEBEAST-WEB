"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createUserClient } from "@/lib/supabase";

export default function SignUp() {
  const router = useRouter();
  const supabase = createUserClient();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please make sure both password fields are identical.");
      setLoading(false);
      return;
    }

    try {
      // Sign up user with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim() || null,
          },
          emailRedirectTo: `${window.location.origin}/sign-in`,
        },
      });

      if (signUpError) {
        // Provide more user-friendly error messages
        let errorMessage = signUpError.message;
        
        if (signUpError.message.includes("User already registered") || signUpError.message.includes("already registered")) {
          errorMessage = "This email is already registered. Please sign in instead.";
        } else if (signUpError.message.includes("Password") || signUpError.message.includes("password")) {
          errorMessage = "Password is too weak. Please use a stronger password (at least 6 characters).";
        } else if (signUpError.message.includes("Invalid email") || signUpError.message.includes("invalid")) {
          errorMessage = "Please enter a valid email address (e.g., yourname@example.com).";
        } else if (signUpError.message.includes("Email rate limit")) {
          errorMessage = "Too many sign-up attempts. Please try again later.";
        } else {
          // Generic error - try to make it more user-friendly
          errorMessage = signUpError.message.replace(/email address "([^"]+)"/gi, "email address").replace(/"/g, "");
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Update profile with full name and set role to 'user' by default
        const updateData: any = { role: 'user' };
        if (formData.fullName) {
          updateData.full_name = formData.fullName.trim();
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", data.user.id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
          // Don't fail signup if profile update fails, just log it
        }

        // Check if email confirmation is required
        if (data.user && !data.session) {
          // Email confirmation required
          setSuccess(true);
          setError(null);
          // Show message that confirmation email was sent
          setTimeout(() => {
            router.push("/sign-in?message=Please check your email to confirm your account");
          }, 3000);
        } else if (data.session) {
          // No email confirmation required, sign in immediately
          setSuccess(true);
          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 1000);
        } else {
          // Fallback
          setSuccess(true);
          setTimeout(() => {
            router.push("/sign-in");
          }, 2000);
        }
      }
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(err.message || "An error occurred during sign up. Please try again.");
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
          <h2 className="mt-6 text-3xl font-normal text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-black hover:underline">
              Sign in
            </Link>
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Admin access? Contact administrator or{" "}
            <Link href="/admin/sign-in" className="font-medium text-black hover:underline">
              sign in as admin
            </Link>
          </p>
        </div>

        {/* Sign Up Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              Account created successfully! Redirecting to sign in...
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                value={formData.fullName}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                placeholder="Enter your full name"
              />
            </div>

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
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:z-10 sm:text-sm ${
                  formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
                    ? "border-red-500 focus:border-red-500"
                    : formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
                    ? "border-green-500 focus:border-green-500"
                    : "border-gray-300 focus:border-black"
                }`}
                placeholder="Enter your email (e.g., yourname@example.com)"
              />
              {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) && (
                <p className="mt-1 text-xs text-red-600">Please enter a valid email address</p>
              )}
              {formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) && (
                <p className="mt-1 text-xs text-green-600">✓ Valid email address</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                  placeholder="Enter your password (min. 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-3 py-2 pr-10 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:z-10 sm:text-sm ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? "border-red-500 focus:border-red-500"
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? "border-green-500 focus:border-green-500"
                      : "border-gray-300 focus:border-black"
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password.length > 0 && (
                <p className="mt-1 text-xs text-green-600">✓ Passwords match</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{" "}
              <Link href="#" className="font-medium text-black hover:underline">
                Terms and Conditions
              </Link>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || success}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating account..." : success ? "Account Created!" : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

