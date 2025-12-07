"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createAdminClient } from "@/lib/supabase";

type Discount = {
  id: string;
  code: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  status: "active" | "inactive" | "expired";
};

export default function AdminDiscount() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    minPurchase: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    status: "active" as "active" | "inactive" | "expired",
  });

  const getAuthToken = useCallback(async (): Promise<string | null> => {
    try {
      const supabase = createAdminClient();
      let { data: { session }, error } = await supabase.auth.getSession();
      
      if ((!session || (session.expires_at && session.expires_at * 1000 < Date.now())) && user) {
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('Error refreshing session:', refreshError);
          return null;
        }
        
        if (refreshedSession) {
          session = refreshedSession;
        }
      }
      
      if (session?.access_token) {
        if (session.expires_at && session.expires_at * 1000 < Date.now()) {
          return null;
        }
        return session.access_token;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }, [user]);

  const fetchDiscounts = useCallback(async () => {
    try {
      if (!user) {
        return;
      }

      const token = await getAuthToken();
      
      if (!token) {
        console.warn('No token available for fetching discounts');
        return;
      }

      const response = await fetch("/api/admin/discounts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const result = await response.json();
        setDiscounts(result.data || []);
      } else if (response.status === 401) {
        router.push("/sign-in?redirect=/admin/discount");
      } else {
        const result = await response.json();
        console.error("Failed to fetch discounts:", result.error);
        if (result.error?.code === 'TABLE_NOT_FOUND') {
          alert("Error: Discounts table does not exist. Please run the database migration.");
        }
      }
    } catch (error) {
      console.error("Error fetching discounts:", error);
    }
  }, [user, router, getAuthToken]);

  useEffect(() => {
    if (!loading && user && profile?.role === 'admin') {
      fetchDiscounts();
    }
  }, [user, profile, loading, fetchDiscounts]);

  useEffect(() => {
    if (editingDiscount && showModal) {
      const formatDateForInput = (dateString: string) => {
        try {
          const date = new Date(dateString);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        } catch (error) {
          return dateString.split('T')[0];
        }
      };

      setFormData({
        code: editingDiscount.code,
        name: editingDiscount.name,
        type: editingDiscount.type,
        value: editingDiscount.value.toString(),
        minPurchase: editingDiscount.minPurchase?.toString() || "",
        maxDiscount: editingDiscount.maxDiscount?.toString() || "",
        startDate: formatDateForInput(editingDiscount.startDate),
        endDate: formatDateForInput(editingDiscount.endDate),
        usageLimit: editingDiscount.usageLimit?.toString() || "",
        status: editingDiscount.status,
      });
    } else if (showModal && !editingDiscount) {
      setFormData({
        code: "",
        name: "",
        type: "percentage",
        value: "",
        minPurchase: "",
        maxDiscount: "",
        startDate: "",
        endDate: "",
        usageLimit: "",
        status: "active",
      });
    }
  }, [editingDiscount, showModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!user) {
        router.push("/sign-in?redirect=/admin/discount");
        setIsSubmitting(false);
        return;
      }

      const token = await getAuthToken();
      
      if (!token) {
        setIsSubmitting(false);
        setError("Session expired. Please refresh the page and sign in again.");
        return;
      }

      if (!formData.code || !formData.name || !formData.value || !formData.startDate || !formData.endDate) {
        setError("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        type: formData.type,
        value: parseFloat(formData.value),
        minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : undefined,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        status: formData.status,
      };

      let response;
      if (editingDiscount) {
        response = await fetch(`/api/admin/discounts/${editingDiscount.id}`, {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch("/api/admin/discounts", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();

      if (response.ok) {
        setShowModal(false);
        setEditingDiscount(null);
        setError(null);
        fetchDiscounts();
      } else {
        if (response.status === 401) {
          setIsSubmitting(false);
          setError("Session expired. Please refresh the page and try again.");
          setTimeout(() => {
            router.push("/sign-in?redirect=/admin/discount");
          }, 3000);
          return;
        }
        
        if (response.status === 403) {
          setIsSubmitting(false);
          setError("You don't have admin permissions. Please contact an administrator.");
          return;
        }
        
        let errorMessage = result.error?.message || "Failed to save discount";
        if (result.error?.code === 'TABLE_NOT_FOUND') {
          errorMessage = "Discounts table does not exist. Please run the database migration.";
        } else if (result.error?.code === 'DUPLICATE_CODE') {
          errorMessage = result.error?.message || "Discount code already exists. Please use a different code.";
        } else if (result.error?.code === 'FORBIDDEN') {
          errorMessage = "You don't have admin permissions. Please contact an administrator.";
        } else if (result.error?.code === 'MISSING_FIELDS') {
          errorMessage = "Please fill in all required fields correctly.";
        }
        
        setIsSubmitting(false);
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Error saving discount:", err);
      setError((err as Error).message || "Failed to save discount");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700 border border-green-200";
      case "inactive":
        return "bg-gray-50 text-gray-700 border border-gray-200";
      case "expired":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || (profile && profile.role !== 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-normal text-gray-900 mb-2">Discount Management</h1>
              <p className="text-gray-900 font-normal">Create and manage discount codes</p>
            </div>
            <button
              onClick={() => {
                setEditingDiscount(null);
                setShowModal(true);
              }}
              className="px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-normal"
            >
              + Create Discount
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {discounts.map((discount) => (
              <div
                key={discount.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-normal text-gray-900">{discount.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-normal capitalize ${getStatusColor(discount.status)}`}>
                      {discount.status}
                    </span>
                  </div>
                  
                  <div className="bg-black text-white p-4 rounded-lg mb-4">
                    <div className="text-xs text-white/70 mb-1 font-normal">Code</div>
                    <div className="text-2xl font-normal text-white tracking-wide">{discount.code}</div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <span className="text-sm text-gray-600 font-normal">Discount</span>
                      <span className="text-lg font-normal text-gray-900">
                        {discount.type === "percentage" ? `${discount.value}%` : `$${discount.value}`}
                      </span>
                    </div>
                    
                    {discount.minPurchase && (
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <span className="text-sm text-gray-600 font-normal">Min. Purchase</span>
                        <span className="text-sm font-normal text-gray-900">${discount.minPurchase}</span>
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                      <span className="text-sm text-gray-600 font-normal">Valid Period</span>
                      <div className="text-sm font-normal text-gray-900 text-right">
                        <div>{new Date(discount.startDate).toLocaleDateString()}</div>
                        <div className="text-gray-500">to</div>
                        <div>{new Date(discount.endDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                    
                    {discount.usageLimit && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 font-normal">Usage</span>
                          <span className="text-sm font-normal text-gray-900">
                            {discount.usedCount} / {discount.usageLimit}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((discount.usedCount / discount.usageLimit) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setEditingDiscount(discount);
                        setShowModal(true);
                      }}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-normal text-gray-900 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Are you sure you want to delete discount "${discount.code}"?`)) {
                          try {
                            if (!user) {
                              router.push("/sign-in?redirect=/admin/discount");
                              return;
                            }

                            const token = await getAuthToken();
                            
                            if (!token) {
                              alert("Session expired. Please refresh the page and try again.");
                              return;
                            }

                            const response = await fetch(`/api/admin/discounts/${discount.id}`, {
                              method: "DELETE",
                              headers: {
                                'Authorization': `Bearer ${token}`,
                              },
                            });

                            if (response.ok) {
                              fetchDiscounts();
                            } else if (response.status === 401) {
                              router.push("/sign-in?redirect=/admin/discount");
                            } else {
                              const result = await response.json();
                              alert(result.error?.message || "Failed to delete discount");
                            }
                          } catch (error) {
                            console.error("Error deleting discount:", error);
                            alert("Failed to delete discount");
                          }
                        }
                      }}
                      className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-normal hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={() => {
              setShowModal(false);
              setEditingDiscount(null);
              setError(null);
            }}
          />

          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowModal(false);
                setEditingDiscount(null);
                setError(null);
              }
            }}
          >
            <div
              className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <h2 className="text-xl font-normal text-gray-900">
                  {editingDiscount ? "Edit Discount" : "Create Discount"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingDiscount(null);
                    setError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Discount Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-500"
                      placeholder="SUMMER20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Discount Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-500"
                      placeholder="Summer Sale"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Discount Type *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="type"
                          value="percentage"
                          checked={formData.type === "percentage"}
                          onChange={(e) => setFormData({ ...formData, type: "percentage" })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-900">Percentage</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="type"
                          value="fixed"
                          checked={formData.type === "fixed"}
                          onChange={(e) => setFormData({ ...formData, type: "fixed" })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-900">Fixed Amount</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Discount Value * {formData.type === "percentage" ? "(%)" : "($)"}
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step={formData.type === "percentage" ? "1" : "0.01"}
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-500"
                      placeholder={formData.type === "percentage" ? "20" : "50"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Minimum Purchase ($) <span className="text-gray-700 text-xs">(optional)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.minPurchase}
                      onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-500"
                      placeholder="100"
                    />
                  </div>

                  {formData.type === "percentage" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Maximum Discount ($) <span className="text-gray-700 text-xs">(optional)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.maxDiscount}
                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-500"
                        placeholder="50"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Usage Limit <span className="text-gray-700 text-xs">(optional)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-500"
                      placeholder="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Status *
                    </label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" | "expired" })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingDiscount(null);
                      setError(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg font-normal hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Saving..." : editingDiscount ? "Update Discount" : "Create Discount"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

