import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
import { PlusCircle, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { itemsService } from "@/services/items.service";

const CATEGORIES = ["Equipments", "Daily Use", "Academics", "Sports", "Others"];

const CreateItemDialog = ({ trigger }) => {
  const [open, setOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "Used",
  });

  useEffect(() => {
    if (searchParams.get("open") === "sell") {
      setOpen(true);
      // Clean up the URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("open");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      // Revoke the URL to avoid memory leaks
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.category) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("category", formData.category);
      data.append("condition", formData.condition);

      files.forEach((file) => {
        data.append("images", file);
      });

      await itemsService.createItem(data);
      toast.success("Item listed successfully!");
      setOpen(false);
      // Reset form
      setFormData({
        title: "",
        description: "",
        price: "",
        category: "",
        condition: "Used",
      });
      setFiles([]);
      setPreviews([]);
    } catch (error) {
      toast.error(error.message || "Failed to list item");
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
            className="hidden sm:flex bg-accent hover:bg-accent/90 text-accent-foreground font-display ml-2 gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Sell Item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border-white/10 text-card-foreground">
        <DialogHeader>
          <DialogTitle>Sell an Item</DialogTitle>
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

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Images</label>
            <div className="grid grid-cols-4 gap-2">
              {previews.map((src, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-md overflow-hidden border border-white/10 group"
                >
                  <img
                    src={src}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center aspect-square rounded-md border border-dashed border-white/20 hover:bg-secondary/50 cursor-pointer transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                <span className="text-[10px] text-muted-foreground">Add</span>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Listing...
                </>
              ) : (
                "List Item"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateItemDialog;
