import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { itemsService } from "../services/items.service";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useItems = (filters = {}, enabled = true) => {
  return useQuery({
    queryKey: ["items", filters],
    queryFn: () => itemsService.getItems(filters),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useItem = (id) => {
  return useQuery({
    queryKey: ["item", id],
    queryFn: () => itemsService.getItemById(id),
    enabled: !!id,
  });
};

export const useMyListings = () => {
  return useQuery({
    queryKey: ["items", "my-listings"],
    queryFn: itemsService.getMyListings,
  });
};

export const useCreateItem = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (itemData) => itemsService.createItem(itemData),
    onSuccess: () => {
      queryClient.invalidateQueries(["items"]);
      queryClient.invalidateQueries(["items", "my-listings"]);
      toast.success("Item listed successfully!");
      navigate("/home?tab=listings");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create item");
    },
  });
};

export const useUpdateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => itemsService.updateItem(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries(["items"]);
      queryClient.invalidateQueries(["item", id]);
      queryClient.invalidateQueries(["items", "my-listings"]);
      toast.success("Item updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update item");
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (id) => itemsService.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["items"]);
      queryClient.invalidateQueries(["items", "my-listings"]);
      toast.success("Listing deleted successfully");
      navigate("/home");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete item");
    },
  });
};
