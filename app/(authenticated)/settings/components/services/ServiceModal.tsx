import React, { useState, useEffect } from "react";
import { Service } from "./ServiceList";
import { X, Pencil, Trash2, Plus, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface ServiceModalProps {
  open: boolean;
  mode: "view" | "edit" | "add";
  service?: Service | null;
  onClose: () => void;
  onSave: (service: Omit<Service, "id">, id?: string) => void;
  onDelete?: (id: string) => void;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  open,
  mode,
  service,
  onClose,
  onSave,
  onDelete,
}) => {
  const isAdd = mode === "add";
  const isEdit = mode === "edit";
  const isView = mode === "view";

  const [editMode, setEditMode] = useState(isAdd || isEdit);
  const [form, setForm] = useState<Omit<Service, "id">>({
    name: "",
    description: "",
    duration: 60,
    price: 0,
    currency: "GBP",
    category: "maintenance",
    isActive: true,
  });

  useEffect(() => {
    if (service) {
      setForm({
        name: service.name,
        description: service.description,
        duration: service.duration,
        currency: service.currency,
        price: service.price,
        category: service.category,
        isActive: service.isActive,
      });
    } else {
      setForm({
        name: "",
        description: "",
        duration: 60,
        price: 0,
        currency: "GBP",
        category: "maintenance",
        isActive: true,
      });
    }
    setEditMode(isAdd || isEdit);
  }, [service, isAdd, isEdit]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 relative animate-fade-in">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          {isAdd ? (
            <Plus className="w-5 h-5" />
          ) : isEdit || editMode ? (
            <Pencil className="w-5 h-5" />
          ) : null}
          {isAdd
            ? "Add Service"
            : isEdit || editMode
            ? "Edit Service"
            : "Service Details"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(form, service?.id);
            onClose();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={!editMode}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              disabled={!editMode}
              required
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label>Duration (min)</Label>
              <Input
                type="number"
                value={form.duration}
                onChange={(e) =>
                  setForm({ ...form, duration: parseInt(e.target.value) || 0 })
                }
                disabled={!editMode}
                required
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: parseFloat(e.target.value) || 0 })
                }
                disabled={!editMode}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              disabled={!editMode}
              required
            />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Switch
              checked={form.isActive}
              onCheckedChange={(checked) =>
                setForm({ ...form, isActive: checked })
              }
              disabled={!editMode}
              id="service-active-switch"
            />
            <Label htmlFor="service-active-switch" className="text-sm">
              {form.isActive ? "Active" : "Disabled"}
            </Label>
          </div>
          <div className="flex gap-2 mt-6 justify-end">
            {isView && !editMode && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditMode(true)}
                >
                  <Pencil className="w-4 h-4 mr-1" /> Edit
                </Button>
                {service && onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      onDelete(service.id);
                      onClose();
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                )}
              </>
            )}
            {(editMode || isAdd) && (
              <>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-1" /> Save
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
