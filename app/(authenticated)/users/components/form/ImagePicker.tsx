import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";

interface ImagePickerProps {
  imageUrl?: string;
  onImageChange: (file: File | null) => void;
  disabled?: boolean;
}

export function ImagePicker({ imageUrl, onImageChange, disabled = false }: ImagePickerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageUrl || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageChange(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageChange(null);
  };

  return (
    <div className="space-y-2">
      <Label>Profile Image</Label>
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <ImagePlus className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
        <div>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('image')?.click()}
          >
            {previewUrl ? "Change Image" : "Upload Image"}
          </Button>
        </div>
      </div>
    </div>
  );
} 