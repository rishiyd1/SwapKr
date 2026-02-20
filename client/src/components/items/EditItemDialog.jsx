import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Edit } from "lucide-react";
import { toast } from "sonner";
import { itemsService } from "@/services/items.service";

const CATEGORIES = ["Hardware", "Daily Use", "Academics", "Sports", "Others"];

const EditItemDialog = ({ item, trigger, onItemUpdated }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "Used",
    pickupLocation: "",
  });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || "",
        description: item.description || "",
        price: item.price || "",
        category: item.category || "",
        condition: item.condition || "Used",
        pickupLocation: item.pickupLocation || "",
      });
    }
  }, [item, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.category) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsLoading(true);
    try {
      // For updates, we send JSON, not FormData, unless we're handling image updates (which we might skip for now to simplify)
      const submitData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        condition: formData.condition,
        pickupLocation: formData.pickupLocation,
      };

      await itemsService.updateItem(item.id, submitData);
      toast.success("Item updated successfully!");
      setOpen(false);
      if (onItemUpdated) onItemUpdated();
    } catch (error) {
      toast.error(error.message || "Failed to update item");
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
            Edit Item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border-white/10 text-card-foreground">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              name="title"
              placeholder="Item name"
              value={formData.title}
              onChange={handleChange}
              required
              className="bg-secondary/50 border-white/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <Input
                name="price"
                type="number"
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Condition
            </label>
            <Select
              value={formData.condition}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, condition: val }))
              }
            >
              <SelectTrigger className="bg-secondary/50 border-white/10">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Used">Used</SelectItem>
                <SelectItem value="Refurbished">Refurbished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Pickup Location
            </label>
            <Input
              name="pickupLocation"
              placeholder="e.g. Hostel A, Block B"
              value={formData.pickupLocation}
              onChange={handleChange}
              className="bg-secondary/50 border-white/10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Description
            </label>
            <Textarea
              name="description"
              placeholder="Describe your item..."
              value={formData.description}
              onChange={handleChange}
              className="bg-secondary/50 border-white/10 resize-none"
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
                "Update Item"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;
