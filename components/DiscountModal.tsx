"use client";

import { useState, useEffect } from "react";

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

type DiscountModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectDiscount: (discount: Discount) => void;
  selectedDiscount?: Discount | null;
  subtotal: number;
};

export default function DiscountModal({
  isOpen,
  onClose,
  onSelectDiscount,
  selectedDiscount,
  subtotal,
}: DiscountModalProps) {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchDiscounts();
    }
  }, [isOpen]);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/discounts");
      if (response.ok) {
        const result = await response.json();
        setDiscounts(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching discounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = (discount: Discount, total: number): number => {
    if (discount.minPurchase && total < discount.minPurchase) {
      return 0;
    }

    let discountAmount = 0;
    if (discount.type === "percentage") {
      discountAmount = (total * discount.value) / 100;
      if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
        discountAmount = discount.maxDiscount;
      }
    } else {
      discountAmount = discount.value;
    }

    return discountAmount;
  };

  const isDiscountValid = (discount: Discount): boolean => {
    if (discount.minPurchase && subtotal < discount.minPurchase) {
      return false;
    }
    return true;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Center */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <h2 className="text-xl font-normal text-gray-900">Select Discount</h2>
            <button
              onClick={onClose}
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

          {/* Content */}
          <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : discounts.length === 0 ? (
            <div className="text-center py-12 px-6">
              <p className="text-gray-600">No available discounts at the moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {discounts.map((discount) => {
                const discountAmount = calculateDiscount(discount, subtotal);
                const isValid = isDiscountValid(discount);
                const isSelected = selectedDiscount?.id === discount.id;

                return (
                  <div
                    key={discount.id}
                    className={`border rounded-lg p-4 transition-all ${
                      isSelected
                        ? "border-black bg-gray-50"
                        : isValid
                        ? "border-gray-200 hover:border-gray-300 cursor-pointer"
                        : "border-gray-200 opacity-50"
                    }`}
                    onClick={() => {
                      if (isValid) {
                        onSelectDiscount(discount);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-medium text-gray-900">
                            {discount.code}
                          </span>
                          {isSelected && (
                            <span className="text-xs font-medium text-black bg-gray-200 px-2 py-0.5 rounded">
                              Applied
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{discount.name}</p>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900">
                            {discount.type === "percentage"
                              ? `Save ${discount.value}%`
                              : `Save $${discount.value}`}
                            {discountAmount > 0 && (
                              <span className="text-gray-600 ml-2">
                                (${discountAmount.toFixed(2)} off)
                              </span>
                            )}
                          </p>
                          {discount.minPurchase && (
                            <p className="text-xs text-gray-500">
                              Min. purchase: ${discount.minPurchase}
                              {!isValid && (
                                <span className="text-red-500 ml-1">
                                  - Need ${(discount.minPurchase - subtotal).toFixed(2)} more
                                </span>
                              )}
                            </p>
                          )}
                          {discount.usageLimit && (
                            <p className="text-xs text-gray-500">
                              {discount.usageLimit - discount.usedCount} uses remaining
                            </p>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <svg
                          className="w-6 h-6 text-black flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  );
}

