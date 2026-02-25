import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";

// ─── Admin email check ────────────────────────────────────────────────
const ADMIN_EMAILS = [
  "kushagars.ic.23@nitj.ac.in",
  "rishi.ic.23@nitj.ac.in",
  "vedanshm.ee.23@nitj.ac.in",
  "ashishg.ic.23@nitj.ac.in",
];

export const isAdminEmail = (email) =>
  ADMIN_EMAILS.includes(email?.toLowerCase());

// ─── Queries ──────────────────────────────────────────────────────────
export const usePendingItems = () =>
  useQuery({
    queryKey: ["admin", "pendingItems"],
    queryFn: adminService.getPendingItems,
  });

export const usePendingRequests = () =>
  useQuery({
    queryKey: ["admin", "pendingRequests"],
    queryFn: adminService.getPendingRequests,
  });

export const useUrgentRequests = () =>
  useQuery({
    queryKey: ["admin", "urgentRequests"],
    queryFn: adminService.getUrgentRequests,
  });

// ─── Mutations ────────────────────────────────────────────────────────
export const useApproveItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.approveItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pendingItems"] });
      toast.success("Item approved successfully");
    },
    onError: (error) => toast.error(error.message),
  });
};

export const useDeleteItemAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pendingItems"] });
      toast.success("Item deleted successfully");
    },
    onError: (error) => toast.error(error.message),
  });
};

export const useApproveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.approveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pendingRequests"] });
      toast.success("Request approved successfully");
    },
    onError: (error) => toast.error(error.message),
  });
};

export const useDeleteRequestAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.deleteRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pendingRequests"] });
      toast.success("Request deleted successfully");
    },
    onError: (error) => toast.error(error.message),
  });
};

export const useDeleteUserAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "urgentRequests"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "allUsers"] });
      toast.success("User account deleted successfully");
    },
    onError: (error) => toast.error(error.message),
  });
};

export const useAllUsers = () =>
  useQuery({
    queryKey: ["admin", "allUsers"],
    queryFn: adminService.getAllUsers,
  });

export const useApproveUrgentRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.approveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "urgentRequests"] });
      toast.success("Urgent request approved & broadcasted!");
    },
    onError: (error) => toast.error(error.message),
  });
};

export const useDeleteUrgentRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.deleteRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "urgentRequests"] });
      toast.success("Urgent request deleted successfully");
    },
    onError: (error) => toast.error(error.message),
  });
};
