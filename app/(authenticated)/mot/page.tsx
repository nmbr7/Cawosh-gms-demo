'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/app/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
// import { Badge } from "@/components/ui/badge";
import { HelpCircle, BellRing } from 'lucide-react';

// MOT Test History Record Type
type MotRecord = {
  TestDate: string;
  ExpiryDate: string;
  TestResult: 'PASSED' | 'FAILED' | string;
  Odometer: string;
  TestNumber: string;
  AdvisoryNotice?: string[];
};

type Vehicle = {
  reg: string;
  motHistory: MotRecord[];
  lastNotifiedAt?: string;
};

function parseISO(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function daysTo(dateStr: string): number {
  const target = parseISO(dateStr);
  if (!target) return -9999;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatRelativeToNow(dateStr: string): string {
  const d = parseISO(dateStr);
  if (!d) return '';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return 'today';
  if (diffDays === -1) return 'yesterday';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  return `in ${diffDays} days`;
}

function getMotStatus(record: {
  ExpiryDate: string;
  TestResult: string;
  TestDate: string;
}): 'Valid' | 'Expiring Soon' | 'Expired' {
  const days = daysTo(record.ExpiryDate);
  const testDate = parseISO(record.TestDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const passed = String(record.TestResult).toUpperCase() === 'PASSED';
  const testNotInFuture = (testDate?.getTime() ?? Infinity) <= today.getTime();

  if (days < 0) return 'Expired';
  if (!passed || !testNotInFuture) return 'Expired';
  if (days <= 30) return 'Expiring Soon';
  return 'Valid';
}

function latestMotOf(vehicle: Vehicle): MotRecord | null {
  const sorted = [...vehicle.motHistory].sort((a, b) => {
    const bTime = parseISO(b.TestDate)?.getTime() ?? 0;
    const aTime = parseISO(a.TestDate)?.getTime() ?? 0;
    return bTime - aTime;
  });
  return sorted[0] || null;
}

// function getStatusStyle(status: string): React.CSSProperties {
//   if (status === "Expired") return { color: "#b91c1c", fontWeight: "bold" };
//   if (status === "Expiring Soon")
//     return { color: "#b45309", fontWeight: "bold" };
//   return { color: "#15803d", fontWeight: "bold" };
// }
// function getTestResultStyle(result: string): React.CSSProperties {
//   if (String(result).toUpperCase() === "FAILED")
//     return { color: "#b91c1c", fontWeight: "bold" };
//   if (String(result).toUpperCase() === "PASSED")
//     return { color: "#15803d", fontWeight: "bold" };
//   return {};
// }

export default function MotVehiclesOverview() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Modal & advisory states
  const [selectedVehicleReg, setSelectedVehicleReg] = useState<string | null>(
    null,
  );
  const [advisoryModal, setAdvisoryModal] = useState<{
    open: boolean;
    notices: string[];
    title: string;
  } | null>(null);

  // Fetch all vehicles using the new mot/all API WITHOUT supplying the reg list
  useEffect(() => {
    let cancelled = false;
    async function fetchVehicles() {
      setLoading(true);
      setFetchError(null);
      try {
        const url = 'http://localhost:8090/api/auth/mot/all';
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // No body, do not send the regs anymore
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch vehicle MOTs`);
        }
        const data = await res.json();
        // data expected to be Vehicle[]
        if (!cancelled) {
          setVehicles(data as Vehicle[]);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setFetchError((e as Error)?.message || 'Failed to load vehicle MOTs');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchVehicles();
    return () => {
      cancelled = true;
    };
  }, []);

  const vehicleSummaries = useMemo(() => {
    return vehicles.map((vehicle) => {
      const sortedHistory = [...vehicle.motHistory].sort((a, b) => {
        const dA = parseISO(a.TestDate)?.getTime() || 0;
        const dB = parseISO(b.TestDate)?.getTime() || 0;
        return dB - dA;
      });
      return {
        reg: vehicle.reg,
        latestMot: sortedHistory[0] || null,
        lastNotifiedAt: vehicle.lastNotifiedAt,
      };
    });
  }, [vehicles]);

  const selectedVehicleData = useMemo(() => {
    return vehicles.find((v) => v.reg === selectedVehicleReg) || null;
  }, [vehicles, selectedVehicleReg]);

  function openAdvisoryModal(title: string, notices: string[]) {
    setAdvisoryModal({ open: true, notices, title });
  }

  // --- UI ---
  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Vehicles MOT Status
        </h1>
        <Popover>
          <PopoverTrigger className="inline-flex items-center text-gray-600 hover:text-gray-800 focus:outline-none">
            <HelpCircle className="w-5 h-5" />
          </PopoverTrigger>
          <PopoverContent className="bg-white w-96">
            <p>Help text here</p>
          </PopoverContent>
        </Popover>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registration
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Latest MOT Test Date
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                MOT Result
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiry Date
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {loading && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-600"
                >
                  Loading vehicles...
                </TableCell>
              </TableRow>
            )}
            {fetchError && !loading && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="px-6 py-12 text-center text-red-600"
                >
                  Error: {fetchError}
                </TableCell>
              </TableRow>
            )}
            {!loading && !fetchError && vehicleSummaries.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-600"
                >
                  No vehicles found.
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              !fetchError &&
              vehicleSummaries.map(({ reg, latestMot, lastNotifiedAt }) => {
                const expiryStatus = latestMot ? getMotStatus(latestMot) : '';
                const rowAccentClass =
                  expiryStatus === 'Expiring Soon'
                    ? "relative after:content-[''] after:absolute after:top-0 after:right-0 after:h-full after:w-1 after:bg-amber-400"
                    : expiryStatus === 'Expired'
                      ? "relative after:content-[''] after:absolute after:top-0 after:right-0 after:h-full after:w-1 after:bg-red-400"
                      : expiryStatus === 'Valid'
                        ? "relative after:content-[''] after:absolute after:top-0 after:right-0 after:h-full after:w-1 after:bg-green-500"
                        : '';
                const resultStyle =
                  latestMot?.TestResult?.toUpperCase() === 'FAILED'
                    ? 'text-red-700 font-semibold'
                    : latestMot?.TestResult?.toUpperCase() === 'PASSED'
                      ? 'text-green-700 font-semibold'
                      : '';
                const statusStyle =
                  expiryStatus === 'Expired'
                    ? 'text-red-700 font-semibold'
                    : expiryStatus === 'Expiring Soon'
                      ? 'text-amber-700 font-semibold'
                      : 'text-green-700 font-semibold';
                const needsNotice =
                  expiryStatus === 'Expiring Soon' ||
                  expiryStatus === 'Expired';
                const noticeIconClass =
                  expiryStatus === 'Expiring Soon'
                    ? 'text-amber-600'
                    : 'text-red-600';
                return (
                  <TableRow
                    key={reg}
                    className={`hover:bg-gray-50 cursor-pointer border-b-gray-200 ${rowAccentClass}`}
                    onClick={() => latestMot && setSelectedVehicleReg(reg)}
                    title={latestMot ? 'Click for details' : ''}
                  >
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {reg}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {latestMot ? latestMot.TestDate : '-'}
                    </TableCell>
                    <TableCell
                      className={`px-6 py-4 whitespace-nowrap text-sm ${resultStyle}`}
                    >
                      {latestMot ? latestMot.TestResult : '-'}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {latestMot ? latestMot.ExpiryDate : '-'}
                    </TableCell>
                    <TableCell
                      className={`px-6 py-4 whitespace-nowrap text-sm ${statusStyle}`}
                    >
                      <span className="inline-flex items-center gap-2">
                        {expiryStatus}
                        {needsNotice && lastNotifiedAt ? (
                          <BellRing
                            className={`h-4 w-4 ${noticeIconClass}`}
                            aria-label="Notification sent"
                          />
                        ) : null}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {/* MODAL POPUP WITH FULL MOT TABLE */}
      {selectedVehicleReg && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/20"
          onClick={() => setSelectedVehicleReg(null)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="relative bg-white rounded-lg shadow-2xl w-[min(1200px,96vw)] max-h-[90vh] overflow-y-auto p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedVehicleReg(null)}
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
              aria-label="Close"
            >
              ×
            </button>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedVehicleReg}{' '}
                  <span className="text-gray-500 font-normal">
                    • MOT History
                  </span>
                </h3>
                <p className="text-sm text-gray-500">
                  Most recent first. Click Advisory to view full details.
                </p>
              </div>
              {(() => {
                if (!selectedVehicleData) return null;
                const latest = latestMotOf(selectedVehicleData);
                const status = latest ? getMotStatus(latest) : null;
                const lastNotifiedAt = selectedVehicleData.lastNotifiedAt;
                const shouldShow = !!(
                  latest &&
                  (status === 'Expiring Soon' || status === 'Expired') &&
                  lastNotifiedAt
                );
                if (!shouldShow) return null;
                return (
                  <div
                    className="shrink-0 text-xs text-gray-600 flex items-center gap-2 bg-gray-50 rounded px-2 py-1"
                    title={lastNotifiedAt}
                  >
                    <BellRing
                      className="h-4 w-4 text-amber-600"
                      aria-hidden="true"
                    />
                    <span>
                      Notified the owner{' '}
                      {formatRelativeToNow(lastNotifiedAt as string)}
                    </span>
                  </div>
                );
              })()}
            </div>
            <div className="overflow-x-auto">
              {!selectedVehicleData && (
                <div className="text-center text-gray-500 py-12">
                  Loading MOT history...
                </div>
              )}
              {selectedVehicleData && (
                <Table className="min-w-full divide-y divide-gray-200">
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Test Result
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Test Date
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expiry Date
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Odometer (mi)
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Test Number
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Advisory Notice
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white divide-y divide-gray-200">
                    {selectedVehicleData.motHistory.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="px-6 py-12 text-center text-gray-600"
                        >
                          No MOT records found.
                        </TableCell>
                      </TableRow>
                    )}
                    {[...selectedVehicleData.motHistory]
                      .sort(
                        (a, b) =>
                          (parseISO(b.TestDate)?.getTime() || 0) -
                          (parseISO(a.TestDate)?.getTime() || 0),
                      )
                      .map((rec, idx) => {
                        const expiryStatus = getMotStatus(rec);
                        const isExpiringSoon = expiryStatus === 'Expiring Soon';
                        const isExpired = expiryStatus === 'Expired';
                        const rowAccentClass = isExpiringSoon
                          ? "relative after:content-[''] after:absolute after:top-0 after:right-0 after:h-full after:w-1 after:bg-amber-400"
                          : isExpired
                            ? "relative after:content-[''] after:absolute after:top-0 after:right-0 after:h-full after:w-1 after:bg-red-400"
                            : "relative after:content-[''] after:absolute after:top-0 after:right-0 after:h-full after:w-1 after:bg-green-500";
                        const resultStyle =
                          rec.TestResult?.toUpperCase() === 'FAILED'
                            ? 'text-red-700 font-semibold'
                            : rec.TestResult?.toUpperCase() === 'PASSED'
                              ? 'text-green-700 font-semibold'
                              : '';
                        const statusStyle = isExpired
                          ? 'text-red-700 font-semibold'
                          : isExpiringSoon
                            ? 'text-amber-700 font-semibold'
                            : 'text-green-700 font-semibold';
                        return (
                          <TableRow
                            key={rec.TestNumber + '-' + idx}
                            className={`${rowAccentClass}`}
                          >
                            <TableCell
                              className={`px-4 py-3 whitespace-nowrap ${resultStyle}`}
                            >
                              {rec.TestResult}
                            </TableCell>
                            <TableCell className="px-4 py-3 whitespace-nowrap">
                              {rec.TestDate}
                            </TableCell>
                            <TableCell className="px-4 py-3 whitespace-nowrap">
                              {rec.ExpiryDate}
                            </TableCell>
                            <TableCell className="px-4 py-3 whitespace-nowrap">
                              {rec.Odometer
                                ? Number(rec.Odometer).toLocaleString()
                                : '-'}
                            </TableCell>
                            <TableCell className="px-4 py-3 whitespace-nowrap">
                              {rec.TestNumber}
                            </TableCell>
                            <TableCell
                              className={`px-4 py-3 whitespace-nowrap ${statusStyle}`}
                            >
                              <span className="inline-flex items-center gap-2">
                                {expiryStatus}
                              </span>
                            </TableCell>
                            <TableCell className="px-4 py-3 align-top">
                              {rec.AdvisoryNotice &&
                              rec.AdvisoryNotice.length > 0 ? (
                                <button
                                  className="text-blue-700 underline"
                                  onClick={() =>
                                    openAdvisoryModal(
                                      `Advisories • ${rec.TestDate}`,
                                      rec.AdvisoryNotice || [],
                                    )
                                  }
                                >
                                  View ({rec.AdvisoryNotice.length})
                                </button>
                              ) : (
                                <span className="text-gray-500">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Secondary advisory modal */}
      {advisoryModal?.open && (
        <div
          className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/30"
          onClick={() => setAdvisoryModal(null)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="relative bg-white rounded-lg shadow-2xl w-[min(800px,94vw)] max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setAdvisoryModal(null)}
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
              aria-label="Close"
            >
              ×
            </button>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              {advisoryModal.title}
            </h4>
            <ul className="list-disc pl-5 space-y-2">
              {advisoryModal.notices.map((note, i) => (
                <li key={i} className="text-sm text-amber-700">
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
