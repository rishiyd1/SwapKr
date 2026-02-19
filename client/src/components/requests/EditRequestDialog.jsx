import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Edit, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { requestsService } from "@/services/requests.service";

const EditRequestDialog = ({ request, trigger, onRequestUpdated }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
  });

  useEffect(() => {
    if (request) {
      setFormData({
        title: request.title || "",
        description: request.description || "",
        budget: request.budget || "",
      });
    }
  }, [request, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Title is required");
      return;
    }

    setIsLoading(true);
    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        budget: formData.budget ? parseFloat(formData.budget) : null,
      };
      await requestsService.updateRequest(request.id, submitData);
      toast.success("Request updated successfully!");
      setOpen(false);
      if (onRequestUpdated) onRequestUpdated();
    } catch (error) {
      toast.error(error.message || "Failed to update request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Request
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-white/10 text-card-foreground">
        <DialogHeader>
          <DialogTitle>Edit Request</DialogTitle>
          <div className="text-sm text-muted-foreground">
            Update the details of your request.
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              name="title"
              placeholder="What are you looking for?"
              value={formData.title}
              onChange={handleChange}
              required
              className="bg-secondary/50 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Description
            </label>
            <Textarea
              name="description"
              placeholder="Describe what you need..."
              value={formData.description}
              onChange={handleChange}
              className="bg-secondary/50 border-white/10 resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Budget (Optional)
            </label>
            <Input
              name="budget"
              type="number"
              placeholder="Max price you can pay"
              value={formData.budget}
              onChange={handleChange}
              className="bg-secondary/50 border-white/10"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Request"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRequestDialog;
