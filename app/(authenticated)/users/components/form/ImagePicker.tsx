import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ImagePickerProps {
  imageUrl?: string | null;
  onImageChange: (file: File | null) => void;
  disabled?: boolean;
}

export function ImagePicker({
  imageUrl,
  onImageChange,
  disabled = false,
}: ImagePickerProps) {
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

  return (
    <div className="space-y-2">
      <Label>Profile Image</Label>
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
          {previewUrl && (
            <div className="relative w-32 h-32">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-cover rounded-full"
              />
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
            onClick={() => document.getElementById("image")?.click()}
            disabled={disabled}
          >
            {previewUrl ? "Change Image" : "Upload Image"}
          </Button>
        </div>
      </div>
    </div>
  );
}
