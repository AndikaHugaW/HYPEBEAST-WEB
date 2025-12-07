"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  date: string;
  created_at?: string;
};

type OrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  shippingPostalCode: string;
  paymentMethod: string;
  paymentStatus: string;
  discountAmount: number;
  discountCode: string | null;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    productImage: string;
    brand: string;
    quantity: number;
    price: number;
    size: string | null;
  }>;
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
  };
};

export default function AdminOrders() {
  const { user, profile, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]); // Store all orders for count badges
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  // Debug: Log state changes
  useEffect(() => {
    console.log('[Frontend] Orders state changed:', {
      count: orders.length,
      orders: orders.map(o => ({ id: o.id, status: o.status, orderNumber: o.orderNumber }))
    });
  }, [orders]);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);

  const fetchOrders = async (isPolling = false, statusFilter?: string) => {
    const currentFilter = statusFilter !== undefined ? statusFilter : filterStatus;
    
    if (!isPolling) {
      setLoadingOrders(true);
    }
    
    try {
      // Fetch filtered orders for display
      const url = currentFilter === 'all' 
        ? '/api/admin/orders'
        : `/api/admin/orders?status=${encodeURIComponent(currentFilter.toLowerCase())}`;
      
      const response = await fetch(`${url}?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const result = await response.json();
      
      // Comprehensive logging
      console.log(`[Frontend] ========== Fetch Result ==========`);
      console.log(`[Frontend] Filter: "${currentFilter}"`);
      console.log(`[Frontend] Response status: ${response.status}`);
      console.log(`[Frontend] Has result: ${!!result}`);
      console.log(`[Frontend] Has result.data: ${!!result.data}`);
      console.log(`[Frontend] result.data type: ${typeof result.data}`);
      console.log(`[Frontend] result.data isArray: ${Array.isArray(result.data)}`);
      console.log(`[Frontend] result.data length: ${result.data?.length || 0}`);
      console.log(`[Frontend] Full result:`, JSON.stringify(result, null, 2));
      
      if (result.error) {
        console.error('[Frontend] ❌ API returned error:', result.error);
        throw new Error(result.error.message);
      }

      // Ensure we have valid data array - try multiple fallbacks
      let ordersData: Order[] = [];
      
      if (Array.isArray(result.data)) {
        ordersData = result.data;
        console.log(`[Frontend] ✅ Using result.data (${ordersData.length} items)`);
      } else if (Array.isArray(result)) {
        ordersData = result;
        console.log(`[Frontend] ✅ Using result directly (${ordersData.length} items)`);
      } else if (result && typeof result === 'object' && 'data' in result) {
        // Try to extract data from nested structure
        const nestedData = (result as any).data;
        if (Array.isArray(nestedData)) {
          ordersData = nestedData;
          console.log(`[Frontend] ✅ Using nested result.data (${ordersData.length} items)`);
        }
      } else {
        console.warn(`[Frontend] ⚠️ Could not parse result data. Result:`, result);
        ordersData = [];
      }
      
      console.log(`[Frontend] Final ordersData length: ${ordersData.length}`);
      if (ordersData.length > 0) {
        console.log(`[Frontend] First order sample:`, JSON.stringify(ordersData[0], null, 2));
      }
      console.log(`[Frontend] ===================================`);

      // Always update orders when filter changes or not polling
      if (!isPolling) {
        console.log(`[Frontend] ========== Setting State ==========`);
        console.log(`[Frontend] Current orders state length: ${orders.length}`);
        console.log(`[Frontend] New orders data length: ${ordersData.length}`);
        console.log(`[Frontend] Will update state with ${ordersData.length} items`);
        
        if (ordersData.length > 0) {
          console.log(`[Frontend] ✅ Setting orders state with data`);
          console.log(`[Frontend] First order to set:`, ordersData[0]);
        } else {
          console.warn(`[Frontend] ⚠️ Setting orders state with EMPTY array!`);
          console.warn(`[Frontend] This might be why cards don't appear.`);
        }
        console.log(`[Frontend] ===================================`);
        
        // Force state update with a fresh array reference
        // Create a new array to ensure React detects the change
        let newOrdersArray = ordersData.length > 0 ? [...ordersData] : [];
        
        // FALLBACK: If no data from API but we have allOrders, filter from there
        if (newOrdersArray.length === 0 && allOrders.length > 0 && currentFilter !== 'all') {
          console.warn(`[Frontend] ⚠️ No data from API, filtering from allOrders as fallback`);
          const normalizedFilter = currentFilter.toLowerCase().trim();
          newOrdersArray = allOrders.filter(order => {
            const orderStatus = (order.status || '').toLowerCase().trim();
            return orderStatus === normalizedFilter;
          });
          console.log(`[Frontend] Fallback: Found ${newOrdersArray.length} orders from allOrders`);
        }
        
        console.log(`[Frontend] Created new array with ${newOrdersArray.length} items`);
        
        // CRITICAL: Set state directly without any delay
        setOrders(newOrdersArray);
        
        // Double-check: Verify the data we're setting
        console.log(`[Frontend] ✅ State set with ${newOrdersArray.length} orders`);
        if (newOrdersArray.length > 0) {
          console.log(`[Frontend] Orders being set:`, newOrdersArray.map(o => ({
            id: o.id,
            status: o.status,
            orderNumber: o.orderNumber
          })));
        } else {
          console.error(`[Frontend] ❌ CRITICAL: Setting EMPTY array! This is why cards don't appear.`);
          console.error(`[Frontend] Check API response and data parsing above.`);
        }
        
        // Also fetch all orders for count badges (only when not polling)
        try {
          const allResponse = await fetch(`/api/admin/orders?_t=${Date.now()}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
            },
          });
          
          if (allResponse.ok) {
            const allResult = await allResponse.json();
            const allOrdersData = Array.isArray(allResult.data) ? allResult.data : (Array.isArray(allResult) ? allResult : []);
            setAllOrders(allOrdersData);
          }
        } catch (err) {
          console.error("Error fetching all orders for count:", err);
        }
      } else {
        // Polling: Only update if data actually changed AND matches current filter
        const pollingOrdersData = Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
        
        console.log(`[Frontend] Polling: Received ${pollingOrdersData.length} orders for filter "${currentFilter}"`);
        
        // CRITICAL: Only update if we have data AND it matches the current filter
        // Don't override with empty array if we're filtering
        if (pollingOrdersData.length > 0 || currentFilter === 'all') {
          const currentOrdersStr = JSON.stringify(orders.map(o => ({
            id: o.id,
            status: o.status,
            price: o.price,
          })).sort((a, b) => a.id.localeCompare(b.id)));
          
          const newOrdersStr = JSON.stringify(pollingOrdersData.map((o: any) => ({
            id: o.id,
            status: o.status,
            price: o.price,
          })).sort((a: any, b: any) => a.id.localeCompare(b.id)));
          
          if (currentOrdersStr !== newOrdersStr) {
            console.log(`[Frontend] Polling: Updating orders state with ${pollingOrdersData.length} items`);
            setOrders(pollingOrdersData);
          } else {
            console.log(`[Frontend] Polling: No changes detected, keeping current state`);
          }
        } else {
          console.log(`[Frontend] Polling: Skipping update - empty data for filter "${currentFilter}" (might be correct if no orders match)`);
          // Don't update state if polling returns empty for a filter - keep current state
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (!isPolling) {
        setOrders([]);
      }
    } finally {
      if (!isPolling) {
        setLoadingOrders(false);
      }
    }
  };

  // Use ref to prevent multiple simultaneous fetches
  const fetchingRef = useRef(false);
  
  useEffect(() => {
    console.log(`[Frontend] ========== useEffect Triggered ==========`);
    console.log(`[Frontend] Loading: ${loading}`);
    console.log(`[Frontend] User: ${!!user}`);
    console.log(`[Frontend] Profile role: ${profile?.role}`);
    console.log(`[Frontend] Filter status: "${filterStatus}"`);
    console.log(`[Frontend] Currently fetching: ${fetchingRef.current}`);
    
    if (!loading && user && profile?.role === 'admin' && !fetchingRef.current) {
      console.log('[Frontend] ✅ Conditions met, fetching orders...');
      fetchingRef.current = true;
      
      // Use async function to ensure proper await
      (async () => {
        try {
          await fetchOrders(false, filterStatus);
          // After fetch, verify state was updated
          setTimeout(() => {
            console.log(`[Frontend] State after fetch: ${orders.length} orders`);
            fetchingRef.current = false;
          }, 100);
        } catch (err) {
          console.error('[Frontend] ❌ Error in fetchOrders:', err);
          fetchingRef.current = false;
        }
      })();
    } else {
      if (fetchingRef.current) {
        console.log('[Frontend] ⚠️ Already fetching, skipping...');
      } else {
        console.log('[Frontend] ⚠️ Conditions not met, skipping fetch');
      }
    }
    console.log(`[Frontend] =========================================`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile, loading, filterStatus]);

  // Polling for real-time updates (every 5 seconds)
  useEffect(() => {
    if (!loading && user && profile?.role === 'admin' && !loadingOrders) {
      console.log(`[Frontend] Setting up polling with filter: "${filterStatus}"`);
      const interval = setInterval(() => {
        console.log(`[Frontend] Polling triggered with filter: "${filterStatus}"`);
        fetchOrders(true, filterStatus);
      }, 5000);

      return () => {
        console.log(`[Frontend] Clearing polling interval`);
        clearInterval(interval);
      };
    }
  }, [user, profile, loading, filterStatus, loadingOrders]);

  const fetchOrderDetail = async (orderId: string) => {
    setLoadingOrderDetail(true);
    try {
      const { createAdminClient } = await import('@/lib/supabase');
      const supabase = createAdminClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        alert('Session expired. Please refresh the page.');
        return;
      }

      const response = await fetch(`/api/admin/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error.message);
      }

      setSelectedOrder(result.data);
      setShowOrderModal(true);
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      alert(error.message || 'Failed to load order details');
    } finally {
      setLoadingOrderDetail(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    setUpdatingOrderId(orderId);
    try {
      const { createAdminClient } = await import('@/lib/supabase');
      const supabase = createAdminClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        alert('Session expired. Please refresh the page.');
        setUpdatingOrderId(null);
        return;
      }

      const updateResponse = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        throw new Error(error.error?.message || 'Failed to update order status');
      }

      // Normalize status to lowercase
      const normalizedNewStatus = newStatus.toLowerCase().trim();
      
      // Update selected order if modal is open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: normalizedNewStatus });
      }

      // Also update the order in the current orders list immediately for better UX
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: normalizedNewStatus } : order
        )
      );
      
      // Update allOrders for count badges
      setAllOrders(prevAllOrders => 
        prevAllOrders.map(order => 
          order.id === orderId ? { ...order, status: normalizedNewStatus } : order
        )
      );

      // Refresh orders list with current filter (this will also refresh allOrders)
      // Use setTimeout to ensure state updates are processed first
      setTimeout(async () => {
        await fetchOrders(false, filterStatus);
      }, 100);
    } catch (error: any) {
      console.error('Error updating order status:', error);
      alert(error.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "processing":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "completed":
        return "bg-green-50 text-green-700 border border-green-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  if (loading || loadingOrders) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || (profile && profile.role !== 'admin')) {
    return null;
  }

  // Calculate counts for each status using allOrders (case-insensitive)
  const getStatusCount = (status: string) => {
    if (status === "all") {
      return allOrders.length;
    }
    const normalizedStatus = status.toLowerCase();
    return allOrders.filter(o => o.status?.toLowerCase() === normalizedStatus).length;
  };

  // Debug logging for render
  console.log(`[Frontend] ========== RENDER ==========`);
  console.log(`[Frontend] Filter status: "${filterStatus}"`);
  console.log(`[Frontend] Loading orders: ${loadingOrders}`);
  console.log(`[Frontend] Orders in state: ${orders.length}`);
  console.log(`[Frontend] All orders count: ${allOrders.length}`);
  console.log(`[Frontend] Orders is array: ${Array.isArray(orders)}`);
  if (orders.length > 0) {
    console.log(`[Frontend] ✅ Will render ${orders.length} order cards`);
    console.log(`[Frontend] First order:`, orders[0]);
  } else {
    console.warn(`[Frontend] ⚠️ NO ORDERS TO RENDER! This is why cards don't appear.`);
    console.warn(`[Frontend] Check if data was fetched and set correctly.`);
  }
  console.log(`[Frontend] ===========================`);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-normal text-gray-900 mb-1">Orders Management</h1>
            <p className="text-sm text-gray-600 font-normal">Manage and track all customer orders</p>
          </div>

          {/* Filter Buttons */}
          <div className="mb-6 flex items-center gap-3">
            {["all", "pending", "processing", "completed", "cancelled"].map((status) => {
              const count = getStatusCount(status);
              
              return (
                <button
                  key={status}
                  onClick={() => {
                    // Just update filter status - useEffect will handle the fetch
                    setFilterStatus(status);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-normal transition-all ${
                    filterStatus === status
                      ? "bg-black text-white shadow-sm"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {count > 0 && (
                    <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                      filterStatus === status ? "bg-white/20" : "bg-gray-100"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Orders Cards Grid */}
          {loadingOrders ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : !Array.isArray(orders) || orders.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-gray-600 font-normal">No orders found</p>
              <p className="text-gray-400 text-xs mt-2">
                Filter: {filterStatus} | Orders in state: {Array.isArray(orders) ? orders.length : 'not an array'} | All orders: {allOrders.length}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {orders.map((order, index) => {
                // Debug: log first order being rendered
                if (index === 0) {
                  console.log('[Frontend] Rendering first order:', order);
                }
                return (
                  <div
                    key={order.id}
                    onClick={() => fetchOrderDetail(order.id)}
                    className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all cursor-pointer group"
                  >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={order.productImage || "/placeholder-product.jpg"}
                              alt={order.productName}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 mb-1">{order.orderNumber}</div>
                            <div className="text-sm text-gray-600">{order.productName}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500 mb-1">Customer</div>
                          <div className="font-medium text-gray-900">{order.customerName}</div>
                          <div className="text-gray-600 text-xs">{order.customerEmail}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Quantity</div>
                          <div className="font-medium text-gray-900">{order.quantity}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Total</div>
                          <div className="font-medium text-gray-900">{formatPrice(order.price)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Date</div>
                          <div className="font-medium text-gray-900">{order.date}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 ml-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-normal capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value, e)}
                        onClick={(e) => e.stopPropagation()}
                        disabled={updatingOrderId === order.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-normal border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent ${
                          updatingOrderId === order.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {updatingOrderId === order.id && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={() => {
              setShowOrderModal(false);
              setSelectedOrder(null);
            }}
          />

          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowOrderModal(false);
                setSelectedOrder(null);
              }
            }}
          >
            <div
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-xl font-normal text-gray-900">Order Details</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedOrder.orderNumber}</p>
                </div>
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1 px-6 py-4">
                {loadingOrderDetail ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Name:</span>
                            <span className="ml-2 font-medium text-gray-900">{selectedOrder.customerName}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Email:</span>
                            <span className="ml-2 font-medium text-gray-900">{selectedOrder.customerEmail}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Shipping Address</h3>
                        <div className="text-sm text-gray-900">
                          <div>{selectedOrder.shippingAddress}</div>
                          <div>{selectedOrder.shippingCity}, {selectedOrder.shippingPostalCode}</div>
                          <div>{selectedOrder.shippingCountry}</div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-4">Order Items ({selectedOrder.items.length})</h3>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="relative w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={item.productImage || "/placeholder-product.jpg"}
                                alt={item.productName}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 mb-1">{item.productName}</div>
                              {item.brand && (
                                <div className="text-xs text-gray-600 mb-1">{item.brand}</div>
                              )}
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>Qty: {item.quantity}</span>
                                {item.size && <span>Size: {item.size}</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</div>
                              <div className="text-xs text-gray-600">{formatPrice(item.price)} each</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-4">Order Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal</span>
                          <span>{formatPrice(selectedOrder.totals.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Shipping</span>
                          <span>{selectedOrder.totals.shipping > 0 ? formatPrice(selectedOrder.totals.shipping) : 'Free'}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Tax</span>
                          <span>{formatPrice(selectedOrder.totals.tax)}</span>
                        </div>
                        {selectedOrder.discountAmount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount {selectedOrder.discountCode && `(${selectedOrder.discountCode})`}</span>
                            <span>-{formatPrice(selectedOrder.discountAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-base font-medium text-gray-900 pt-2 border-t border-gray-200">
                          <span>Total</span>
                          <span>{formatPrice(selectedOrder.totals.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="ml-2 font-medium text-gray-900 capitalize">{selectedOrder.paymentMethod || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Payment Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-normal ${
                          selectedOrder.paymentStatus === 'paid' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        }`}>
                          {selectedOrder.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Status:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                    disabled={updatingOrderId === selectedOrder.id}
                    className={`px-3 py-1.5 rounded-lg text-sm font-normal border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent ${
                      updatingOrderId === selectedOrder.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {updatingOrderId === selectedOrder.id && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 bg-black text-white rounded-lg text-sm font-normal hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
