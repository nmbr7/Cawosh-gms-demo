import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { InventoryItem } from '@/types/inventory';
import { useInventory } from '@/store/inventory';
import { Button } from '@/components/ui/button';
import { useEffect, useMemo, useState } from 'react';
import { InventoryMovementsModal } from '@/app/components/inventory/InventoryMovementsModal';
import { Input } from '@/components/ui/input';

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
  const { getRecentMovementsByItem, adjustStock, updateItem } = useInventory();
  const [showMovements, setShowMovements] = useState(false);
  const [mode, setMode] = useState<'ADD' | 'NO_STOCK'>('ADD');
  const [qty, setQty] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrice, setEditedPrice] = useState<string>('');
  const [editedCost, setEditedCost] = useState<string>('');

  useEffect(() => {
    if (item) {
      setEditedPrice(String(item.price ?? ''));
      setEditedCost(String(item.cost ?? ''));
      setIsEditing(false);
    }
  }, [item]);

  // Currency formatter for GBP
  const gbp = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  });
  const recent = useMemo(
    () => (item ? getRecentMovementsByItem(item.id, 5) : []),
    [item, getRecentMovementsByItem],
  );

  if (!item) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{item.name}</DialogTitle>
            <DialogDescription>
              View and manage inventory item details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex justify-end">
              {!isEditing ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!item) return;
                      const newPrice = parseFloat(editedPrice || '0');
                      const newCost = parseFloat(editedCost || '0');
                      updateItem({ ...item, price: newPrice, cost: newCost });
                      setIsEditing(false);
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Details</h3>
              <dl className="mt-2 grid grid-cols-2 gap-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">SKU</dt>
                  <dd className="text-gray-900">{item.sku}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Category</dt>
                  <dd className="text-gray-900">{item.category}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Supplier</dt>
                  <dd className="text-gray-900">{item.supplier ?? '-'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Location</dt>
                  <dd className="text-gray-900">{item.location ?? '-'}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Stock</h3>
              <dl className="mt-2 grid grid-cols-2 gap-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Quantity</dt>
                  <dd className="text-gray-900">
                    {item.quantity} {item.unit}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Reorder Level</dt>
                  <dd className="text-gray-900">{item.reorderLevel}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Status</dt>
                  <dd className="text-gray-900">{item.status}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Pricing</h3>
              <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Price</dt>
                  <dd className="text-gray-900 mt-1">
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editedPrice}
                        onChange={(e) => setEditedPrice(e.target.value)}
                        className="h-10 px-3"
                      />
                    ) : (
                      gbp.format(item.price)
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Cost</dt>
                  <dd className="text-gray-900 mt-1">
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editedCost}
                        onChange={(e) => setEditedCost(e.target.value)}
                        className="h-10 px-3"
                      />
                    ) : (
                      gbp.format(item.cost)
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <div className="mb-4 rounded border p-3 bg-white">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    Adjust Stock
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={mode === 'ADD' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMode('ADD')}
                    >
                      Add Mode
                    </Button>
                    <Button
                      variant={mode === 'NO_STOCK' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMode('NO_STOCK')}
                    >
                      No‑Stock Mode
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                  <div className="md:col-span-2 min-w-[160px]">
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      min={'0'}
                      disabled={mode === 'NO_STOCK'}
                      className="h-10 px-3"
                    />
                  </div>
                  <div className="md:col-span-3 min-w-[220px]">
                    <Input
                      placeholder="Reason/Notes"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="h-10 px-3"
                    />
                  </div>
                  <div className="flex gap-2 md:col-span-1 justify-end flex-wrap">
                    <Button
                      size="sm"
                      disabled={mode !== 'ADD' || !qty || Number(qty) <= 0}
                      onClick={() => {
                        if (!item || !qty) return;
                        adjustStock({
                          itemId: item.id,
                          mode: 'INCREASE',
                          quantity: Number(qty),
                          reason: reason || 'Manual increase',
                          reference: undefined,
                          performedBy: 'manual',
                          notes: reason || undefined,
                        });
                        setQty('');
                        setReason('');
                      }}
                      className="h-10"
                    >
                      Add Stock
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={mode !== 'NO_STOCK'}
                      onClick={() => {
                        if (!item) return;
                        adjustStock({
                          itemId: item.id,
                          mode: 'SET',
                          quantity: 0,
                          reason: 'No stock',
                          reference: undefined,
                          performedBy: 'manual',
                          notes: 'Marked as no stock',
                        });
                      }}
                      className="h-10"
                    >
                      Mark No‑Stock
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">
                  Recent Transactions
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMovements(true)}
                >
                  View all
                </Button>
              </div>
              <div className="mt-3 space-y-2">
                {recent.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No transactions yet
                  </div>
                ) : (
                  recent.map((m) => (
                    <div
                      key={m.id}
                      className="text-sm flex items-center justify-between bg-gray-50 rounded-md px-3 py-2"
                    >
                      <span>
                        {m.type} {m.quantity} •{' '}
                        {new Date(m.createdAt).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {m.referenceType === 'JOB_SHEET' && m.jobSheetId
                          ? `Job #${m.jobSheetId}`
                          : m.referenceType === 'BOOKING' && m.bookingId
                            ? `Booking #${m.bookingId}`
                            : m.referenceType || 'MANUAL'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <InventoryMovementsModal
        item={item}
        open={showMovements}
        onClose={() => setShowMovements(false)}
      />
    </>
  );
}
