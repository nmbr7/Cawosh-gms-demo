'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useInventory } from '@/store/inventory';
import type { InventoryItem } from '@/types/inventory';
import { useEffect, useState } from 'react';

export function InventoryMovementsModal({
  item,
  open,
  onClose,
}: {
  item: InventoryItem;
  open: boolean;
  onClose: () => void;
}) {
  const { getMovementsByItem } = useInventory();
  const [q, setQ] = useState('');
  const [type, setType] = useState<'ALL' | 'INCREASE' | 'DECREASE' | 'SET'>(
    'ALL',
  );
  const [referenceType, setReferenceType] = useState<
    'ALL' | 'JOB_SHEET' | 'BOOKING' | 'MANUAL' | 'SYSTEM'
  >('ALL');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);

  // View-only modal (no adjust controls here)

  const { data, total, totalPages } = getMovementsByItem(item.id, {
    q,
    type,
    referenceType,
    from,
    to,
    page,
    limit,
  });

  useEffect(() => {
    setPage(1);
  }, [q, type, referenceType, from, to, limit]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>All Transactions — {item.name}</DialogTitle>
        </DialogHeader>

        {/* View only - transactions below */}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 bg-white rounded p-3 border">
          <Input
            placeholder="Search reason/notes"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="INCREASE">Increase</SelectItem>
              <SelectItem value="DECREASE">Decrease</SelectItem>
              <SelectItem value="SET">Set</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={referenceType}
            onValueChange={(v) => setReferenceType(v as typeof referenceType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Ref" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Refs</SelectItem>
              <SelectItem value="JOB_SHEET">Job Sheet</SelectItem>
              <SelectItem value="BOOKING">Booking</SelectItem>
              <SelectItem value="MANUAL">Manual</SelectItem>
              <SelectItem value="SYSTEM">System</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto bg-white rounded border">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                  Date
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                  Type
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                  Qty
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                  Resulting
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                  Ref
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                  Reason/Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-sm text-gray-500"
                  >
                    No transactions found
                  </td>
                </tr>
              ) : (
                data.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="px-3 py-2 text-sm">
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-sm">{m.type}</td>
                    <td className="px-3 py-2 text-sm">{m.quantity}</td>
                    <td className="px-3 py-2 text-sm">{m.resultingQuantity}</td>
                    <td className="px-3 py-2 text-sm">
                      {m.referenceType === 'JOB_SHEET' && m.jobSheetId
                        ? `Job #${m.jobSheetId}`
                        : m.referenceType === 'BOOKING' && m.bookingId
                          ? `Booking #${m.bookingId}`
                          : m.referenceType || '—'}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      <div className="text-gray-900">{m.reason || '—'}</div>
                      {m.notes && (
                        <div className="text-xs text-gray-500">{m.notes}</div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Total: {total}</div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Prev
            </Button>
            <div className="text-sm">
              {page} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
