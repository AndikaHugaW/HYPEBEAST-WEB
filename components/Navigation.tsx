"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut, isAdmin } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/service", label: "Service" },
    { href: "/aboutus", label: "Blog" },
  ];
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-12">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo/logo.svg"
                  alt="HYPEBEAST Logo"
                  width={200}
                  height={48}
                  className="h-10 w-auto"
                  priority
                />
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-8">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group relative text-gray-900 text-sm transition-colors ${
                        isActive ? "font-bold" : "font-light"
                      }`}
                    >
                      {item.label}
                      <span
                        className={`absolute left-0 -bottom-1 h-0.5 bg-black transition-all duration-300 ${
                          isActive ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                      ></span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="hidden lg:block w-64">
                <div className="flex items-center bg-gray-100 rounded-full p-1 pl-4">
                  <input 
                    type="text" 
                    placeholder="What are you looking for?" 
                    className="bg-transparent border-none outline-none text-sm w-full text-gray-600 placeholder-gray-400"
                  />
                  <div className="flex items-center gap-3 pr-1">
                    <button className="bg-black hover:bg-gray-800 text-white p-2 rounded-full transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* User Menu (if logged in) */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors ${
                      isAdmin ? 'bg-purple-50 hover:bg-purple-100' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isAdmin 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-black text-white'
                    }`}>
                      {profile?.full_name
                        ? profile.full_name.charAt(0).toUpperCase()
                        : user.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="text-sm font-medium text-gray-900 hidden lg:block">
                      {profile?.full_name || user.email?.split("@")[0] || "User"}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-600 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
                        {isAdmin ? (
                          <>
                            <Link
                              href="/admin/dashboard"
                              className="block px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 font-medium"
                              onClick={() => setShowUserMenu(false)}
                            >
                              Admin Dashboard
                            </Link>
                            <Link
                              href="/admin/products"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setShowUserMenu(false)}
                            >
                              Manage Products
                            </Link>
                            <Link
                              href="/admin/users"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setShowUserMenu(false)}
                            >
                              Manage Users
                            </Link>
                            <div className="border-t border-gray-200 my-1" />
                            <Link
                              href="/profile"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setShowUserMenu(false)}
                            >
                              My Profile
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              href="/profile"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setShowUserMenu(false)}
                            >
                              My Profile
                            </Link>
                            <Link
                              href="/orders"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setShowUserMenu(false)}
                            >
                              My Orders
                            </Link>
                            <Link
                              href="/wishlist"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setShowUserMenu(false)}
                            >
                              Wishlist
                            </Link>
                          </>
                        )}
                        <div className="border-t border-gray-200 my-1" />
                        <button
                          onClick={async () => {
                            await signOut();
                            setShowUserMenu(false);
                            router.push("/");
                            router.refresh();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  {/* Sign In & Sign Up Buttons (if not logged in) */}
                  <Link href="/sign-in" className="group relative inline-block text-sm font-medium text-black">
                    <span className="absolute inset-0 border border-black"></span>
                    <span className="block border border-black bg-white px-6 py-2 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
                      Sign In
                    </span>
                  </Link>

                  <Link href="/sign-up" className="group relative inline-block text-sm font-medium text-white">
                    <span className="absolute inset-0 border border-black"></span>
                    <span className="block border border-black bg-black px-6 py-2 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
                      Sign Up
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

