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
import { PlusCircle, Loader2, Zap, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { requestsService } from "@/services/requests.service";

const CATEGORIES = ["Hardware", "Daily Use", "Academics", "Sports", "Others"];

const CreateRequestDialog = ({ trigger }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    category: "",
    isUrgent: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleToggleUrgent = (checked) => {
    setFormData((prev) => ({ ...prev, isUrgent: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.description) {
      toast.error("Title, Category, and Description are required");
      return;
    }

    if (formData.title.length < 10 || formData.title.length > 60) {
      toast.error("Title must be between 10 and 60 characters");
      return;
    }

    if (formData.description.length < 20 || formData.description.length > 300) {
      toast.error("Description must be between 20 and 300 characters");
      return;
    }

    setIsLoading(true);
    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        category: formData.category,
        type: formData.isUrgent ? "Urgent" : "Normal",
      };
      await requestsService.createRequest(submitData);
      toast.success(
        formData.isUrgent
          ? "Urgent request posted!"
          : "Request created successfully!",
      );
      setOpen(false);
      setFormData({
        title: "",
        description: "",
        budget: "",
        category: "",
        isUrgent: false,
      });
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
      <DialogContent className="sm:max-w-[425px] bg-card border-white/10 text-card-foreground p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle>Make a Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Title <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-muted-foreground">
                {formData.title.length}/60
              </span>
            </div>
            <Input
              name="title"
              placeholder="What are you looking for? (min 10 chars)"
              value={formData.title}
              onChange={handleChange}
              maxLength={60}
              required
              className="bg-secondary/50 border-white/10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Category <span className="text-red-500">*</span>
            </label>
            <Select
              onValueChange={handleCategoryChange}
              value={formData.category}
            >
              <SelectTrigger className="bg-secondary/50 border-white/10">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Description <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-muted-foreground">
                {formData.description.length}/300
              </span>
            </div>
            <Textarea
              name="description"
              placeholder="Describe what you need... (min 20 chars)"
              value={formData.description}
              onChange={handleChange}
              maxLength={300}
              required
              className="bg-secondary/50 border-white/10 resize-none h-24"
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

          {formData.isUrgent && (
            <div className="flex gap-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 text-amber-400">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <span className="font-bold">Warning:</span> Urgent requests are
                reviewed by admins. Misuse of the urgent feature may result in
                your account being deleted.
              </p>
            </div>
          )}

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
