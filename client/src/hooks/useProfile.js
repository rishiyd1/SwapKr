import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await authService.getProfile();
      return response.user;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData) => authService.updateProfile(userData),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data.user);
      queryClient.invalidateQueries(["profile"]);
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (password) => authService.deleteAccount(password),
    onSuccess: () => {
      queryClient.clear();
      toast.success("Account deleted successfully. We will miss you!");
      navigate("/landing");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete account");
    },
  });
};
