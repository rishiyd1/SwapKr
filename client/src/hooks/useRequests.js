import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requestsService } from "../services/requests.service";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useRequests = ({ category } = {}, enabled = true) => {
  return useQuery({
    queryKey: ["requests", category],
    queryFn: () => requestsService.getRequests({ category }),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useRequest = (id) => {
  return useQuery({
    queryKey: ["request", id],
    queryFn: () => requestsService.getRequestById(id),
    enabled: !!id,
  });
};

export const useMyRequests = () => {
  return useQuery({
    queryKey: ["requests", "my-requests"],
    queryFn: requestsService.getMyRequests,
  });
};

export const useCreateRequest = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (requestData) => requestsService.createRequest(requestData),
    onSuccess: () => {
      queryClient.invalidateQueries(["requests"]);
      queryClient.invalidateQueries(["requests", "my-requests"]);
      toast.success("Request created successfully!");
      navigate("/home?tab=requests");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create request");
    },
  });
};

export const useUpdateRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => requestsService.updateRequest(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries(["requests"]);
      queryClient.invalidateQueries(["request", id]);
      queryClient.invalidateQueries(["requests", "my-requests"]);
      toast.success("Request updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update request");
    },
  });
};

export const useDeleteRequest = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (id) => requestsService.deleteRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["requests"]);
      queryClient.invalidateQueries(["requests", "my-requests"]);
      toast.success("Request deleted successfully");
      navigate("/home?tab=requests");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete request");
    },
  });
};
