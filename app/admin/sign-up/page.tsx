"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase";

export default function AdminSignUp() {
  const router = useRouter();
  const supabase = createAdminClient();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    adminCode: "", // Secret code untuk admin registration
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    // Admin code validation (optional security measure)
    // You can set this in environment variable or remove if not needed
    const requiredAdminCode = process.env.NEXT_PUBLIC_ADMIN_CODE || "ADMIN2024";
    if (formData.adminCode !== requiredAdminCode) {
      setError("Invalid admin code. Please contact system administrator.");
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
            role: 'admin', // Set role in metadata for trigger
          },
          emailRedirectTo: `${window.location.origin}/admin/sign-in`,
        },
      });

      if (signUpError) {
        let errorMessage = signUpError.message;
        
        if (signUpError.message.includes("User already registered")) {
          errorMessage = "This email is already registered. Please sign in instead.";
        } else if (signUpError.message.includes("Password")) {
          errorMessage = "Password is too weak. Please use a stronger password.";
        } else if (signUpError.message.includes("Invalid email")) {
          errorMessage = "Please enter a valid email address.";
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Update profile with full name and set role to 'admin'
        const updateData: any = { 
          role: 'admin', // Set as admin immediately
          full_name: formData.fullName.trim() || null,
        };

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
          setTimeout(() => {
            router.push("/admin/sign-in?message=Please check your email to confirm your admin account");
          }, 3000);
        } else if (data.session) {
          // No email confirmation required, sign in immediately
          setSuccess(true);
          setTimeout(() => {
            router.push("/admin/dashboard");
            router.refresh();
          }, 1000);
        } else {
          // Fallback
          setSuccess(true);
          setTimeout(() => {
            router.push("/admin/sign-in");
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
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/logo/logo.svg"
              alt="HYPEBEAST Logo"
              width={200}
              height={48}
              className="h-10 w-auto mx-auto filter brightness-0 invert"
              priority
            />
          </Link>
          <h2 className="mt-6 text-3xl font-normal text-white">Admin Registration</h2>
          <p className="mt-2 text-sm text-gray-400">
            Create an administrator account
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Already have an admin account?{" "}
            <Link href="/admin/sign-in" className="font-medium text-white hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Sign Up Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded">
              Admin account created successfully! Redirecting...
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                value={formData.fullName}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-white focus:z-10 sm:text-sm rounded"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
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
                className="appearance-none relative block w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-white focus:z-10 sm:text-sm rounded"
                placeholder="Enter your admin email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
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
                  className="appearance-none relative block w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-white focus:z-10 sm:text-sm rounded"
                  placeholder="Enter your password (min. 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
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
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
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
                  className="appearance-none relative block w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-white focus:z-10 sm:text-sm rounded"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
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
            </div>

            <div>
              <label htmlFor="adminCode" className="block text-sm font-medium text-gray-300 mb-2">
                Admin Code <span className="text-gray-500">(Required)</span>
              </label>
              <input
                id="adminCode"
                name="adminCode"
                type="text"
                required
                value={formData.adminCode}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-white focus:z-10 sm:text-sm rounded"
                placeholder="Enter admin registration code"
              />
              <p className="mt-1 text-xs text-gray-500">
                Contact system administrator for the admin code
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-white bg-gray-800 border-gray-700 rounded focus:ring-white"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
              I understand that I will have full administrative access
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || success}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
            >
              {loading ? "Creating admin account..." : success ? "Account Created!" : "Create Admin Account"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

