import { useState } from "react";
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
import { PlusCircle, Loader2, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { requestsService } from "@/services/requests.service";

const CreateRequestDialog = ({ trigger }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    isUrgent: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleUrgent = (checked) => {
    setFormData((prev) => ({ ...prev, isUrgent: checked }));
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
        budget: formData.budget,
        type: formData.isUrgent ? "Urgent" : "Normal",
      };
      await requestsService.createRequest(submitData);
      toast.success(
        formData.isUrgent
          ? "Urgent request posted!"
          : "Request created successfully!",
      );
      setOpen(false);
      setFormData({ title: "", description: "", budget: "", isUrgent: false });
    } catch (error) {
      toast.error(error.message || "Failed to create request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            size="sm"
            className="hidden sm:flex bg-secondary/50 hover:bg-secondary border border-dashed border-primary/30 text-primary font-display ml-2 gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Make a Request
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-white/10 text-card-foreground">
        <DialogHeader>
          <DialogTitle>Make a Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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

          <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-secondary/30">
            <div className="space-y-0.5">
              <Label
                htmlFor="urgent-mode"
                className="text-sm font-semibold flex items-center gap-2"
              >
                <Zap
                  className={`h-4 w-4 ${formData.isUrgent ? "text-primary fill-primary" : "text-muted-foreground"}`}
                />
                Mark as Urgent
              </Label>
              <p className="text-[10px] text-muted-foreground">
                Costs 1 Token. Notifies the entire campus via email.
              </p>
            </div>
            <Switch
              id="urgent-mode"
              checked={formData.isUrgent}
              onCheckedChange={handleToggleUrgent}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Request"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRequestDialog;
