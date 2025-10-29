import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InventoryItem } from '@/models/inventory';

interface ItemDetailsModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ItemDetailsModal({
  item,
  isOpen,
  onClose,
}: ItemDetailsModalProps) {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Details</h3>
            <dl className="mt-2 space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">SKU</dt>
                <dd className="text-sm text-gray-900">{item.sku}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="text-sm text-gray-900">{item.category}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Description
                </dt>
                <dd className="text-sm text-gray-900">{item.description}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Stock Information
            </h3>
            <dl className="mt-2 space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                <dd className="text-sm text-gray-900">
                  {item.quantity} {item.unit}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Reorder Level
                </dt>
                <dd className="text-sm text-gray-900">{item.reorderLevel}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="text-sm text-gray-900">{item.location}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Pricing</h3>
            <dl className="mt-2 space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Selling Price
                </dt>
                <dd className="text-sm text-gray-900">
                  ${item.sellingPrice.toFixed(2)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Cost Price
                </dt>
                <dd className="text-sm text-gray-900">
                  ${item.costPrice.toFixed(2)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
