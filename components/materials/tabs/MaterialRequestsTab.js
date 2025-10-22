"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Plus,
  CheckCircle,
  Ban,
  Clock,
  Search,
  Filter,
  Loader,
  AlertCircle,
  Truck,
  Pencil,
  X,
} from "lucide-react";
import CreateMaterialRequestModal from "../modals/CreateMaterialRequestModal";
import { useMasterMaterials } from "@/hooks/useMasterMaterials";
import DeliveryConfirmationModal from "../modals/DeliveryConfirmationModal";
import toast from "react-hot-toast";
import { useManpower } from "@/contexts/ManpowerContext";

const MaterialRequestsTab = () => {
  const {
    masterMaterials,
    materialStock,
    loading: materialsLoading,
  } = useMasterMaterials();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });
  const [loadingStates, setLoadingStates] = useState({});

  // Use the manpower context with full user data from Supabase
  const { manpower, loading: userLoading, error: userError } = useManpower();

  // Debug log to see what's happening
  useEffect(() => {
    console.log("🔄 MaterialRequestsTab - masterMaterials:", {
      data: masterMaterials,
      length: masterMaterials?.length,
      loading: materialsLoading,
    });

    console.log("👤 MaterialRequestsTab - manpower context:", {
      manpower,
      userLoading,
      userError,
    });
  }, [masterMaterials, materialsLoading, manpower, userLoading, userError]);

  useEffect(() => {
    // Only fetch requests when masterMaterials are available and not loading
    if (!materialsLoading && masterMaterials && masterMaterials.length > 0) {
      console.log("📦 Fetching requests because masterMaterials are available");
      fetchRequests();
    }
  }, [filters, masterMaterials, materialsLoading]);

  const fetchRequests = async () => {
    console.log("🔄 Starting to fetch requests...");
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.status !== "all")
        queryParams.append("status", filters.status);
      if (filters.search) queryParams.append("search", filters.search);

      const res = await fetch(
        `/api/materials/material-requests?${queryParams}`
      );
      const data = await res.json();

      if (data.success) {
        console.log("✅ Requests fetched successfully:", data.data?.length);
        setRequests(data.data || []);
      } else {
        console.error("❌ Failed to fetch requests:", data.error);
      }
    } catch (error) {
      console.error("❌ Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchRequests();
  };

  const handleConfirmDelivery = async (requestId, deliveryData) => {
    try {
      // Use manpower data for delivery confirmation
      const deliveryWithUser = {
        ...deliveryData,
        delivered_by: manpower?.email || "Unknown User",
        delivered_by_id: manpower?.id || null,
        delivered_by_name:
          manpower?.first_name && manpower?.last_name
            ? `${manpower.first_name} ${manpower.last_name}`
            : manpower?.first_name || manpower?.email || "Unknown User",
      };

      const response = await fetch(
        `/api/materials/material-requests/${requestId}/deliver`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(deliveryWithUser),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Update local state
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId
              ? {
                  ...req,
                  status: "delivered",
                  ...deliveryData,
                  delivered_by: deliveryWithUser.delivered_by,
                  delivered_by_name: deliveryWithUser.delivered_by_name,
                  delivered_at: new Date().toISOString(),
                }
              : req
          )
        );
        toast.success("Delivery confirmed and stock updated!");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error confirming delivery:", error);
      // Show specific error message for stock issues
      if (error.message.includes("Insufficient stock")) {
        toast.error("Cannot deliver: Insufficient stock available");
      } else {
        toast.error("Failed to confirm delivery");
      }
      throw error;
    }
  };

  const handleDeliverClick = (request) => {
    setSelectedRequest(request);
    setShowDeliveryModal(true);
  };

  const handleApprove = async (requestId) => {
    setLoadingStates((prev) => ({ ...prev, [requestId]: { approve: true } }));

    try {
      // Use manpower data for approval
      const approvalData = {
        approved_by: manpower?.email || "Unknown User",
        status: "approved",
      };

      const response = await fetch(
        `/api/materials/material-requests/${requestId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(approvalData),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Update local state
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId
              ? {
                  ...result.data,
                  approved_by: approvalData.approved_by,
                }
              : req
          )
        );

        // Show appropriate message based on stock availability
        if (result.stock_info?.sufficient) {
          toast.success("Request approved - Ready for delivery!");
        } else {
          toast.success(
            "Request approved - Note: Insufficient stock for delivery",
            {
              icon: "⚠️",
            }
          );
        }
      } else {
        console.error("Failed to approve request:", result.error);
        toast.error(`Failed to approve: ${result.error}`);
      }
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve request");
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [requestId]: { approve: false },
      }));
    }
  };

  const handleReject = async (requestId) => {
    const rejectionReason = prompt("Please enter rejection reason:");
    if (!rejectionReason) return;

    setLoadingStates((prev) => ({ ...prev, [requestId]: { reject: true } }));

    try {
      // Use manpower data for rejection
      const rejectionData = {
        rejected_by: manpower?.email || "Unknown User",
        rejected_by_id: manpower?.id || null,
        rejected_by_name:
          manpower?.first_name && manpower?.last_name
            ? `${manpower.first_name} ${manpower.last_name}`
            : manpower?.first_name || manpower?.email || "Unknown User",
        rejection_reason: rejectionReason,
      };

      const response = await fetch(
        `/api/materials/material-requests/${requestId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(rejectionData),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Update local state
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId
              ? {
                  ...result.data,
                  rejected_by: rejectionData.rejected_by,
                  rejected_by_name: rejectionData.rejected_by_name,
                  rejection_reason: rejectionData.rejection_reason,
                }
              : req
          )
        );
        toast.success("Request rejected successfully");
      } else {
        console.error("Failed to reject request:", result.error);
        toast.error(`Failed to reject: ${result.error}`);
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [requestId]: { reject: false } }));
    }
  };
  const deleteRequest = async (requestId) => {
    confirm("Are You sure You want to cancel this request?");
    setCancelling(true);
    try {
      const response = await fetch(
        `/api/materials/material-requests/${requestId}/delete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ canceled_by: manpower.email }),
        }
      );

      const result = await response.json();

      if (result.success) {
        await fetchRequests();
        toast.success("Request deleted successfully");
      } else {
        console.error("Failed to delete request:", result.error);
        toast.error(`Failed to delete: ${result.error}`);
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    } finally {
      setCancelling(false);
    }
  };
  // Show loading state while user data is being fetched
  if (userLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-16">
        <Loader className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <span className="text-gray-600 dark:text-gray-400">
          Loading user information...
        </span>
      </div>
    );
  }

  // Show error state if user data failed to load
  if (userError && !manpower) {
    return (
      <div className="text-center py-16 px-6">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          User Data Error
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{userError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Show loading state while masterMaterials are being fetched
  if (materialsLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-16">
        <Loader className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <span className="text-gray-600 dark:text-gray-400">
          Loading materials data...
        </span>
      </div>
    );
  }

  // Show error state if masterMaterials failed to load
  if (!masterMaterials) {
    return (
      <div className="text-center py-16 px-6">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Failed to Load Materials
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          There was an error loading the materials data.
        </p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show empty state if no masterMaterials
  if (masterMaterials.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Materials Available
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          There are no materials in the system to request.
        </p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      approved:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      delivered:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      canceled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      fulfilled:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: Ban,
      delivered: Truck,
      canceled: X,
      fulfilled: CheckCircle,
    };
    return icons[status] || Clock;
  };

  const isLoading = (requestId, action) => {
    return loadingStates[requestId]?.[action] || false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Material Requests
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Request materials from inventory and manage approvals
            {manpower && (
              <span className="text-sm text-blue-600 ml-2">
                (Logged in as: {manpower.first_name} {manpower.last_name} -{" "}
                {manpower.role})
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Request
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search requests..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, status: e.target.value }))
          }
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="canceled">canceled</option>
          <option value="fulfilled">Fulfilled</option>
        </select>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr className="text-xs">
                <th className="text-left py-3 px-4">Material</th>
                <th className="text-left py-3 px-4">Requested By</th>
                <th className="text-center py-3 px-4">Quantity</th>
                <th className="text-center py-3 px-4">Status</th>
                <th className="text-center py-3 px-4">Date</th>
                <th className="text-center py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center">
                    <Loader className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                  </td>
                </tr>
              ) : (
                requests.map((request) => {
                  const StatusIcon = getStatusIcon(request.status);
                  return (
                    <motion.tr
                      key={request.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white capitalize">
                              {request.master_materials?.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {request.master_materials?.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 capitalize">
                        {request.requested_by_name || request.requested_by}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {request.requested_quantity}
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                            {request.master_materials?.unit}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            request.status
                          )}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {request.status.charAt(0).toUpperCase() +
                            request.status.slice(1)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                        {new Date(request.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {request.status === "pending" && (
                          <div className="flex items-center justify-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleApprove(request.id)}
                              disabled={isLoading(request.id, "approve")}
                              className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
                              title="Approve Request"
                            >
                              {isLoading(request.id, "approve") ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleReject(request.id)}
                              disabled={isLoading(request.id, "reject")}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                              title="Reject Request"
                            >
                              {isLoading(request.id, "reject") ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEdit(request.id)}
                              disabled={isLoading(request.id, "edit")}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                              title="Edit Request"
                            >
                              {isLoading(request.id, "edit") ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <Pencil className="w-4 h-4" />
                              )}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => deleteRequest(request.id)}
                              disabled={isLoading(request.id, "delete")}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                              title="Cancel Request"
                            >
                              {cancelling ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </motion.button>
                          </div>
                        )}
                        {request.status === "approved" && (
                          <div className="flex flex-col items-center gap-1">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDeliverClick(request)}
                              className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                              title="Confirm Delivery"
                            >
                              <Truck className="w-4 h-4" />
                            </motion.button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>

          {!loading && requests.length === 0 && (
            <div className="text-center py-16 px-6">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No material requests
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filters.status !== "all" || filters.search
                  ? "No requests match your filters"
                  : "Create your first material request to get started"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Request Modal */}
      <CreateMaterialRequestModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        masterMaterials={masterMaterials}
        materialStock={materialStock}
        currentUser={manpower} // Pass manpower data to modal
        onRequestCreated={() => {
          setShowCreateModal(false);
          fetchRequests();
        }}
      />

      {/* Delivery Confirmation Modal */}
      <DeliveryConfirmationModal
        isOpen={showDeliveryModal}
        onClose={() => {
          setShowDeliveryModal(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        currentUser={manpower} // Pass manpower data to modal
        onConfirmDelivery={handleConfirmDelivery}
      />
    </div>
  );
};

export default MaterialRequestsTab;
