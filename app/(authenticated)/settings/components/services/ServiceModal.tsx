import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { Service } from '@/app/models/service';
import { Switch } from '@/components/ui/switch';

interface ServiceModalProps {
  open: boolean;
  mode: 'view' | 'edit' | 'add';
  service: Service | null;
  onClose: () => void;
  onSave: (data: Omit<Service, 'serviceId'>, id?: string) => void;
}

export function ServiceModal({
  open,
  mode,
  service,
  onClose,
  onSave,
}: ServiceModalProps) {
  const [formData, setFormData] = useState<Omit<Service, 'serviceId'>>({
    name: '',
    description: '',
    duration: 60,
    currency: 'GBP',
    currencySymbol: '£',
    defaultPrice: 0,
    customPrice: 0,
    category: 'maintenance',
    isActive: true,
  });

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        duration: service.duration || 60,
        currency: service.currency || 'GBP',
        currencySymbol: service.currencySymbol || '£',
        defaultPrice: service.defaultPrice,
        customPrice: service.customPrice,
        category: service.category || 'maintenance',
        isActive: service.isActive,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        duration: 60,
        currency: 'GBP',
        currencySymbol: '£',
        defaultPrice: 0,
        customPrice: 0,
        category: 'maintenance',
        isActive: true,
      });
    }
  }, [service]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSave(formData, service?.serviceId);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add'
              ? 'Add New Service'
              : mode === 'edit'
                ? 'Edit Service'
                : 'Service Details'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={mode === 'view' || mode === 'edit'}
              required
              autoFocus={false}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              disabled={mode === 'view' || mode === 'edit'}
              autoFocus={false}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  duration: parseInt(e.target.value) || 0,
                })
              }
              disabled={mode === 'view'}
              autoFocus={false}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              value={formData.customPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  customPrice: parseFloat(e.target.value) || 0,
                })
              }
              disabled={mode === 'view'}
              autoFocus={false}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={mode === 'view' || mode === 'edit'}
              required
              autoFocus={false}
            />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
              disabled={mode === 'view'}
              id="service-active-switch"
            />
            <Label htmlFor="service-active-switch" className="text-sm">
              {formData.isActive ? 'Active' : 'Disabled'}
            </Label>
          </div>
          {mode !== 'view' && (
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {mode === 'add' ? 'Add Service' : 'Save Changes'}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
