'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Wrench,
  TrendingUp,
  Timer,
  BarChart3,
  AlertTriangle,
  DollarSign,
  CheckCircle2,
  PauseCircle,
  Clock4,
  AlertOctagon,
  PlayCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

import { JobSheetStatus, useJobSheetStore } from '@/store/jobSheet';
import { useBookingStore } from '@/store/booking';
import { useBillingStore } from '@/store/billing';

export default function DashboardPage() {
  const [drawerStatus, setDrawerStatus] = React.useState<null | string>(null);

  // --- Rewritten handleStageClick to allow IN_PROGRESS, COMPLETED too ---
  function handleStageClick(statusKey: string) {
    // Now allow clicking also IN_PROGRESS and COMPLETED
    if (
      ['HALTED', 'PAUSED', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(
        statusKey,
      )
    ) {
      setDrawerStatus(statusKey);
    }
  }

  function handleAlertCTA(actionLabel: string) {
    if (actionLabel === 'Resolve') {
      setDrawerStatus('HALTED');
    }
    // Add more CTA logic as needed
  }

  const jobSheets = useJobSheetStore((state) => state.jobSheets);
  const billings = useBillingStore((state) => state.invoices) ?? [];

  // Date helpers
  function getToday() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  function getYesterday() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getBookingDateFromJobSheet(jobSheet: any): string | undefined {
    try {
      const bookings = useBookingStore.getState().bookings;
      const booking = bookings.find((bk: any) => bk._id === jobSheet.bookingId);
      return booking?.bookingDate;
    } catch (err) {
      return undefined;
    }
  }

  const today = getToday();
  const yesterday = getYesterday();

  // jobs "for today" = booking date matches today
  const bookingsToday = jobSheets.filter((js) => {
    const bookingDate = getBookingDateFromJobSheet(js);
    return (
      typeof bookingDate === 'string' && bookingDate.slice(0, 10) === today
    );
  });

  const bookingsYesterday = jobSheets.filter((js) => {
    const bookingDate = getBookingDateFromJobSheet(js);
    return (
      typeof bookingDate === 'string' && bookingDate.slice(0, 10) === yesterday
    );
  });

  const statusKeys = [
    'PENDING',
    'IN_PROGRESS',
    'PAUSED',
    'HALTED',
    'COMPLETED',
  ] as const;
  const statusCounts: Record<string, number> = {};
  for (const key of statusKeys) statusCounts[key] = 0;
  bookingsToday.forEach((b) => {
    const status = (b.status || 'PENDING').toUpperCase();
    if (statusCounts[status] !== undefined) statusCounts[status]++;
    else statusCounts[status] = 1;
  });

  function formatDuration(seconds: number | null): string {
    if (seconds == null) return '';
    const absSeconds = Math.round(Number(seconds));
    const h = Math.floor(absSeconds / 3600);
    const m = Math.floor((absSeconds % 3600) / 60);
    const s = absSeconds % 60;
    if (h > 0) {
      return `${h}h${m.toString().padStart(2, '0')}m${s.toString().padStart(2, '0')}s`;
    }
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  }

  function getAverageTimeSeconds(jobsheets: any[], status: string) {
    const relevant = jobsheets.filter((js) => {
      if (!Array.isArray(js.timeLogs)) return false;
      switch (status) {
        case 'COMPLETED':
          return (
            js.timeLogs.some((log: any) => log.action === 'COMPLETE') &&
            js.timeLogs.some((log: any) => log.action === 'START')
          );
        case 'HALTED':
          return js.timeLogs.some((log: any) => log.action === 'HALT');
        case 'PAUSED':
          return js.timeLogs.some((log: any) => log.action === 'PAUSE');
        case 'IN_PROGRESS':
          return js.timeLogs.some((log: any) => log.action === 'START');
        case 'PENDING':
          return true;
        default:
          return false;
      }
    });

    if (relevant.length === 0) return null;

    const durations: number[] = relevant.map((js) => {
      if (!Array.isArray(js.timeLogs) || js.timeLogs.length === 0) return 0;
      const logs = [...js.timeLogs].sort(
        (a: any, b: any) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
      let totalSeconds = 0;
      if (status === 'PENDING') {
        const firstLog = logs[0];
        const startLog = logs.find((log) => log.action === 'START');
        if (firstLog && startLog && startLog.timestamp !== firstLog.timestamp) {
          const ms =
            new Date(startLog.timestamp).getTime() -
            new Date(firstLog.timestamp).getTime();
          if (ms > 0) totalSeconds += Math.round(ms / 1000);
        } else if (firstLog && !startLog) {
          const ms = Date.now() - new Date(firstLog.timestamp).getTime();
          if (ms > 0) totalSeconds += Math.round(ms / 1000);
        }
      } else if (status === 'IN_PROGRESS') {
        let i = 0;
        while (i < logs.length) {
          if (logs[i].action === 'START' || logs[i].action === 'RESUME') {
            const enterTime = new Date(logs[i].timestamp).getTime();
            let j = i + 1;
            while (
              j < logs.length &&
              !['PAUSE', 'HALT', 'COMPLETE'].includes(logs[j].action)
            ) {
              j++;
            }
            if (j < logs.length) {
              const exitTime = new Date(logs[j].timestamp).getTime();
              if (exitTime > enterTime)
                totalSeconds += Math.round((exitTime - enterTime) / 1000);
              i = j;
            } else {
              const now = Date.now();
              if (now > enterTime)
                totalSeconds += Math.round((now - enterTime) / 1000);
              break;
            }
          } else {
            i++;
          }
        }
      } else if (status === 'PAUSED') {
        let i = 0;
        while (i < logs.length) {
          if (logs[i].action === 'PAUSE') {
            const pauseTime = new Date(logs[i].timestamp).getTime();
            let j = i + 1;
            while (
              j < logs.length &&
              !['RESUME', 'HALT', 'COMPLETE'].includes(logs[j].action)
            ) {
              j++;
            }
            if (j < logs.length) {
              const resumeTime = new Date(logs[j].timestamp).getTime();
              if (resumeTime > pauseTime)
                totalSeconds += Math.round((resumeTime - pauseTime) / 1000);
              i = j;
            } else {
              const now = Date.now();
              if (now > pauseTime)
                totalSeconds += Math.round((now - pauseTime) / 1000);
              break;
            }
          } else {
            i++;
          }
        }
      } else if (status === 'HALTED') {
        const lastHalt = [...logs]
          .reverse()
          .find((log) => log.action === 'HALT');
        if (lastHalt) {
          if ((js.status?.toUpperCase?.() ?? '') === 'HALTED') {
            const haltTime = new Date(lastHalt.timestamp).getTime();
            const now = Date.now();
            if (now > haltTime)
              totalSeconds = Math.round((now - haltTime) / 1000);
          } else {
            totalSeconds = 0;
          }
        }
      } else if (status === 'COMPLETED') {
        const lastCompleteIdx = logs
          .map((log, idx) => (log.action === 'COMPLETE' ? idx : -1))
          .filter((idx) => idx !== -1)
          .pop();
        if (typeof lastCompleteIdx === 'number') {
          let inProgressStart: number | null = null;
          let i = 0;
          while (i <= lastCompleteIdx) {
            const log = logs[i];
            if (log.action === 'START' || log.action === 'RESUME') {
              if (inProgressStart === null)
                inProgressStart = new Date(log.timestamp).getTime();
            } else if (['PAUSE', 'HALT'].includes(log.action)) {
              if (inProgressStart !== null) {
                const pauseTime = new Date(log.timestamp).getTime();
                if (pauseTime > inProgressStart) {
                  totalSeconds += Math.round(
                    (pauseTime - inProgressStart) / 1000,
                  );
                }
                inProgressStart = null;
              }
            } else if (log.action === 'COMPLETE') {
              if (inProgressStart !== null) {
                const completeTime = new Date(log.timestamp).getTime();
                if (completeTime > inProgressStart) {
                  totalSeconds += Math.round(
                    (completeTime - inProgressStart) / 1000,
                  );
                }
                inProgressStart = null;
              }
            }
            i++;
          }
        }
      }
      return totalSeconds;
    });

    const validDurations = durations.filter((d) => d > 0);
    if (validDurations.length === 0) return null;
    const avg =
      validDurations.reduce((sum, d) => sum + d, 0) / validDurations.length;
    return avg;
  }

  function getTotalTimeSeconds(jobsheets: any[], status: string) {
    // unchanged
    const relevant = jobsheets.filter((js) => {
      if (!Array.isArray(js.timeLogs)) return false;
      switch (status) {
        case 'COMPLETED':
          return (
            js.timeLogs.some((log: any) => log.action === 'COMPLETE') &&
            js.timeLogs.some((log: any) => log.action === 'START')
          );
        case 'HALTED':
          return js.timeLogs.some((log: any) => log.action === 'HALT');
        case 'PAUSED':
          return js.timeLogs.some((log: any) => log.action === 'PAUSE');
        case 'IN_PROGRESS':
          return js.timeLogs.some((log: any) => log.action === 'START');
        case 'PENDING':
          return true;
        default:
          return false;
      }
    });

    if (relevant.length === 0) return null;
    const durations: number[] = relevant.map((js) => {
      if (!Array.isArray(js.timeLogs) || js.timeLogs.length === 0) return 0;
      const logs = [...js.timeLogs].sort(
        (a: any, b: any) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
      let totalSeconds = 0;
      if (status === 'PENDING') {
        const firstLog = logs[0];
        const startLog = logs.find((log) => log.action === 'START');
        if (firstLog && startLog && startLog.timestamp !== firstLog.timestamp) {
          const ms =
            new Date(startLog.timestamp).getTime() -
            new Date(firstLog.timestamp).getTime();
          if (ms > 0) totalSeconds += Math.round(ms / 1000);
        } else if (firstLog && !startLog) {
          const ms = Date.now() - new Date(firstLog.timestamp).getTime();
          if (ms > 0) totalSeconds += Math.round(ms / 1000);
        }
      } else if (status === 'IN_PROGRESS') {
        let i = 0;
        while (i < logs.length) {
          if (logs[i].action === 'START' || logs[i].action === 'RESUME') {
            const enterTime = new Date(logs[i].timestamp).getTime();
            let j = i + 1;
            while (
              j < logs.length &&
              !['PAUSE', 'HALT', 'COMPLETE'].includes(logs[j].action)
            ) {
              j++;
            }
            if (j < logs.length) {
              const exitTime = new Date(logs[j].timestamp).getTime();
              if (exitTime > enterTime)
                totalSeconds += Math.round((exitTime - enterTime) / 1000);
              i = j;
            } else {
              const now = Date.now();
              if (now > enterTime)
                totalSeconds += Math.round((now - enterTime) / 1000);
              break;
            }
          } else {
            i++;
          }
        }
      } else if (status === 'PAUSED') {
        let i = 0;
        while (i < logs.length) {
          if (logs[i].action === 'PAUSE') {
            const pauseTime = new Date(logs[i].timestamp).getTime();
            let j = i + 1;
            while (
              j < logs.length &&
              !['RESUME', 'HALT', 'COMPLETE'].includes(logs[j].action)
            ) {
              j++;
            }
            if (j < logs.length) {
              const resumeTime = new Date(logs[j].timestamp).getTime();
              if (resumeTime > pauseTime)
                totalSeconds += Math.round((resumeTime - pauseTime) / 1000);
              i = j;
            } else {
              const now = Date.now();
              if (now > pauseTime)
                totalSeconds += Math.round((now - pauseTime) / 1000);
              break;
            }
          } else {
            i++;
          }
        }
      } else if (status === 'HALTED') {
        const lastHalt = [...logs]
          .reverse()
          .find((log) => log.action === 'HALT');
        if (lastHalt) {
          if ((js.status?.toUpperCase?.() ?? '') === 'HALTED') {
            const haltTime = new Date(lastHalt.timestamp).getTime();
            const now = Date.now();
            if (now > haltTime)
              totalSeconds = Math.round((now - haltTime) / 1000);
          } else {
            totalSeconds = 0;
          }
        }
      } else if (status === 'COMPLETED') {
        const lastCompleteIdx = logs
          .map((log, idx) => (log.action === 'COMPLETE' ? idx : -1))
          .filter((idx) => idx !== -1)
          .pop();
        if (typeof lastCompleteIdx === 'number') {
          let inProgressStart: number | null = null;
          let i = 0;
          while (i <= lastCompleteIdx) {
            const log = logs[i];
            if (log.action === 'START' || log.action === 'RESUME') {
              if (inProgressStart === null)
                inProgressStart = new Date(log.timestamp).getTime();
            } else if (['PAUSE', 'HALT'].includes(log.action)) {
              if (inProgressStart !== null) {
                const pauseTime = new Date(log.timestamp).getTime();
                if (pauseTime > inProgressStart) {
                  totalSeconds += Math.round(
                    (pauseTime - inProgressStart) / 1000,
                  );
                }
                inProgressStart = null;
              }
            } else if (log.action === 'COMPLETE') {
              if (inProgressStart !== null) {
                const completeTime = new Date(log.timestamp).getTime();
                if (completeTime > inProgressStart) {
                  totalSeconds += Math.round(
                    (completeTime - inProgressStart) / 1000,
                  );
                }
                inProgressStart = null;
              }
            }
            i++;
          }
        }
      }
      return totalSeconds;
    });

    const validDurations = durations.filter((d) => d > 0);
    if (validDurations.length === 0) return null;
    const total = validDurations.reduce((sum, d) => sum + d, 0);
    return total;
  }

  // KPI helpers, unchanged from original
  function getActiveJobCount(jobs: any[]) {
    return jobs.filter(
      (js) =>
        js.status &&
        !['COMPLETED', 'CANCELLED'].includes(js.status?.toUpperCase()),
    ).length;
  }
  function getCompletedJobCount(jobs: any[]) {
    return jobs.filter((js) => js.status?.toUpperCase() === 'COMPLETED').length;
  }
  function getJobEfficiency(jobs: any[]) {
    const completed = jobs.filter(
      (js) => js.status?.toUpperCase() === 'COMPLETED',
    );
    let sumStdMin = 0;
    let sumActualMin = 0;
    for (const js of completed) {
      const stdMin = Array.isArray(js.diagnosedServices)
        ? js.diagnosedServices.reduce(
            (sum: number, s: any) => sum + (Number(s.duration) || 0),
            0,
          )
        : 0;
      sumStdMin += stdMin;
      sumActualMin += Number(js.totalWorkDuration) || 0;
    }
    if (sumActualMin === 0) return null;
    return sumStdMin / sumActualMin;
  }

  function getTechUtilisation(
    jobs: any[],
    shiftStart = '09:00',
    shiftEnd = '17:00',
  ) {
    // unchanged
    const todayStr = new Date().toISOString().slice(0, 10);

    function getShiftWindowMs(day: string) {
      const [sH, sM] = shiftStart.split(':').map(Number);
      const [eH, eM] = shiftEnd.split(':').map(Number);
      const start = new Date(`${day}T${shiftStart}:00.000Z`);
      const end = new Date(`${day}T${shiftEnd}:00.000Z`);
      return {
        startMs: start.getTime(),
        endMs: end.getTime(),
        minutes: (end.getTime() - start.getTime()) / 60000,
      };
    }
    const {
      startMs: shiftMsStart,
      endMs: shiftMsEnd,
      minutes: shiftMinutes,
    } = getShiftWindowMs(todayStr);

    function getOverlapMinutes(periodStart: number, periodEnd: number) {
      const overlapStart = Math.max(periodStart, shiftMsStart);
      const overlapEnd = Math.min(periodEnd, shiftMsEnd);
      if (overlapEnd > overlapStart) {
        return (overlapEnd - overlapStart) / 60000;
      }
      return 0;
    }

    const techInProgressMinutes: Record<string, number> = {};

    for (const js of jobs) {
      const techId = js.technicianId;
      if (!techId) continue;

      const inProgressPeriods: Array<[number, number]> = [];

      if (Array.isArray(js.timeLogs) && js.timeLogs.length > 0) {
        const logs = [...js.timeLogs].sort(
          (a: any, b: any) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );
        let openStart: number | null = null;
        for (let i = 0; i < logs.length; ++i) {
          const log = logs[i];
          const action = log.action;
          const ts = log.timestamp ? new Date(log.timestamp).getTime() : null;
          if (!ts) continue;
          if (action === 'START' || action === 'RESUME') {
            if (openStart === null) openStart = ts;
          }
          if (
            openStart !== null &&
            (['PAUSE', 'HALT', 'COMPLETE'].includes(action) ||
              i === logs.length - 1)
          ) {
            const close = ['PAUSE', 'HALT', 'COMPLETE'].includes(action)
              ? ts
              : Date.now();
            inProgressPeriods.push([openStart, close]);
            openStart = null;
          }
        }
      } else if (
        Array.isArray(js.statusHistory) &&
        js.statusHistory.length > 0
      ) {
        const statusArr = [...js.statusHistory].sort(
          (a: any, b: any) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );
        let openStart: number | null = null;
        for (let i = 0; i < statusArr.length; ++i) {
          const entry = statusArr[i];
          const status = entry.status?.toUpperCase();
          const ts = entry.timestamp
            ? new Date(entry.timestamp).getTime()
            : null;
          if (!ts) continue;

          if (status === 'IN_PROGRESS' && openStart === null) {
            openStart = ts;
          }
          if (
            openStart !== null &&
            (status !== 'IN_PROGRESS' || i === statusArr.length - 1)
          ) {
            const close = status !== 'IN_PROGRESS' ? ts : Date.now();
            inProgressPeriods.push([openStart, close]);
            openStart = null;
          }
        }
      }
      if (
        inProgressPeriods.length === 0 &&
        typeof js.totalWorkDuration === 'number' &&
        js.totalWorkDuration > 0 &&
        ['IN_PROGRESS'].includes(js.status?.toUpperCase?.()) &&
        ((js.updatedAt && js.updatedAt.slice(0, 10) === todayStr) ||
          (js.completedAt && js.completedAt.slice(0, 10) === todayStr) ||
          (js.createdAt && js.createdAt.slice(0, 10) === todayStr))
      ) {
        techInProgressMinutes[techId] =
          (techInProgressMinutes[techId] || 0) + js.totalWorkDuration;
        continue;
      }
      let techMinutes = 0;
      for (const [start, end] of inProgressPeriods) {
        if (end > shiftMsStart && start < shiftMsEnd) {
          techMinutes += getOverlapMinutes(start, end);
        }
      }
      if (techMinutes > 0) {
        techInProgressMinutes[techId] =
          (techInProgressMinutes[techId] || 0) + techMinutes;
      }
    }

    const techIds = Object.keys(techInProgressMinutes);
    if (techIds.length === 0 || shiftMinutes <= 0) return null;

    const totalWorked = Object.values(techInProgressMinutes).reduce(
      (a, b) => a + b,
      0,
    );
    const totalAvailable = shiftMinutes * techIds.length;
    if (totalAvailable === 0) return null;
    return Math.min(totalWorked / totalAvailable, 1.05);
  }

  function getHaltedJobCount(jobs: any[]) {
    return jobs.filter((js) => js.status?.toUpperCase() === 'HALTED').length;
  }

  function getRevenueFromBillings(billings: any[], day: string) {
    let sum = 0;
    for (const b of billings) {
      const billingDate =
        typeof b.date === 'string'
          ? b.date.slice(0, 10)
          : typeof b.createdAt === 'string'
            ? b.createdAt.slice(0, 10)
            : null;
      if (
        billingDate === day &&
        ['COMPLETED', 'PAID', 'SETTLED', 'DRAFT'].includes(
          String(b.status ?? '').toUpperCase(),
        )
      ) {
        sum += Number(b.amount) || 0;
      }
    }
    return sum;
  }

  const activeJobsToday = getActiveJobCount(bookingsToday);
  const completedJobsToday = getCompletedJobCount(bookingsToday);
  const efficiencyToday = getJobEfficiency(bookingsToday); // e.g. 1.09 = 109%
  const utilisationToday = getTechUtilisation(bookingsToday); // e.g. 0.86 = 86%
  const totalUtils = getTotalTimeSeconds(bookingsToday, 'IN_PROGRESS');
  const haltedJobsToday = getHaltedJobCount(bookingsToday);

  const revenueToday = getRevenueFromBillings(billings, today);

  const activeJobsYesterday = getActiveJobCount(bookingsYesterday);
  const completedJobsYesterday = getCompletedJobCount(bookingsYesterday);
  const efficiencyYesterday = getJobEfficiency(bookingsYesterday);
  const utilisationYesterday = getTechUtilisation(bookingsYesterday);
  const haltedJobsYesterday = getHaltedJobCount(bookingsYesterday);

  const revenueYesterday = getRevenueFromBillings(billings, yesterday);

  function deltaFmt(
    curr: number | null,
    prev: number | null,
    postfix: string = '',
  ) {
    if (curr == null || prev == null) return '';
    const diff = curr - prev;
    if (diff === 0) return 'no change';
    return `${diff > 0 ? '+' : ''}${diff}${postfix} vs yesterday`;
  }
  function deltaPctFmt(curr: number | null, prev: number | null) {
    if (curr == null || prev == null) return '';
    const pct = Math.round(curr * 100 - prev * 100);
    if (pct === 0) return 'no change';
    return `${pct > 0 ? '+' : ''}${pct}% vs yesterday`;
  }
  function revenueTargetLine(amount: number, target: number) {
    return `£${amount.toLocaleString()} / £${target.toLocaleString()} target`;
  }

  const kpis = [
    {
      icon: <Wrench className="w-5 h-5" />,
      label: 'Active Jobs',
      value: activeJobsToday,
      delta: deltaFmt(activeJobsToday, activeJobsYesterday),
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Jobs Completed Today',
      value: completedJobsToday,
      delta: deltaFmt(completedJobsToday, completedJobsYesterday),
    },
    {
      icon: <Timer className="w-5 h-5" />,
      label: 'Job Efficiency Today',
      value:
        efficiencyToday != null
          ? `${Math.round(efficiencyToday * 100)}%`
          : '--',
      delta: deltaPctFmt(efficiencyToday, efficiencyYesterday),
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'Tech Utilisation',
      value:
        totalUtils != null
          ? `${Math.round((totalUtils / (8 * 60 * 60)) * 100)}%`
          : '--',
      delta: deltaPctFmt(utilisationToday, utilisationYesterday),
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: 'Halted Jobs',
      value: haltedJobsToday,
      delta: deltaFmt(haltedJobsToday, haltedJobsYesterday),
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: 'Revenue Today',
      value: `£${revenueToday.toLocaleString()}`,
      delta: deltaFmt(revenueToday, revenueYesterday),
    },
  ];

  // -------------------------
  // Stages, Chart, Rest: UNCHANGED

  const avgCompletedTimeSec = getAverageTimeSeconds(bookingsToday, 'COMPLETED');
  const avgHaltedTimeSec = getAverageTimeSeconds(bookingsToday, 'HALTED');
  const avgPausedTimeSec = getAverageTimeSeconds(bookingsToday, 'PAUSED');
  const avgInProgressTimeSec = getAverageTimeSeconds(
    bookingsToday,
    'IN_PROGRESS',
  );
  const avgPendingTimeSec = getAverageTimeSeconds(bookingsToday, 'PENDING');

  const stages = [
    {
      key: 'PENDING',
      label: 'PENDING',
      icon: <Clock4 className="w-4 h-4 text-gray-500" />,
      count: statusCounts['PENDING'] ?? 0,
      delta: null,
      meta:
        avgPendingTimeSec != null
          ? `Avg time: ${formatDuration(avgPendingTimeSec)}`
          : '',
      border: 'border-gray-400',
      textColor: 'text-gray-800',
      metaColor: 'text-gray-500',
    },
    {
      key: 'IN_PROGRESS',
      label: 'IN PROGRESS',
      icon: <PlayCircle className="w-4 h-4 text-blue-500" />,
      count: statusCounts['IN_PROGRESS'] ?? 0,
      delta: null,
      meta:
        avgInProgressTimeSec != null
          ? `Avg time: ${formatDuration(avgInProgressTimeSec)}`
          : '',
      border: 'border-blue-400',
      textColor: 'text-blue-900',
      metaColor: 'text-blue-500',
    },
    {
      key: 'PAUSED',
      label: 'PAUSED',
      icon: <PauseCircle className="w-4 h-4 text-yellow-500" />,
      count: statusCounts['PAUSED'] ?? 0,
      delta: null,
      meta:
        avgPausedTimeSec != null
          ? `Avg time: ${formatDuration(avgPausedTimeSec)}`
          : '',
      border: 'border-yellow-400',
      textColor: 'text-yellow-900',
      metaColor: 'text-yellow-600',
    },
    {
      key: 'HALTED',
      label: 'HALTED',
      icon: <AlertOctagon className="w-4 h-4 text-red-500" />,
      count: statusCounts['HALTED'] ?? 0,
      delta: null,
      meta:
        avgHaltedTimeSec != null
          ? `Avg time: ${formatDuration(avgHaltedTimeSec)}`
          : '',
      border: 'border-red-400',
      textColor: 'text-red-900',
      metaColor: 'text-red-600',
    },
    {
      key: 'COMPLETED',
      label: 'COMPLETED',
      icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
      count: statusCounts['COMPLETED'] ?? 0,
      delta: null,
      meta: '',
      border: 'border-green-400',
      textColor: 'text-green-900',
      metaColor: 'text-green-600',
    },
  ];

  const chartData = [
    { hour: '9', started: 5, completed: 2 },
    { hour: '10', started: 4, completed: 3 },
    { hour: '11', started: 6, completed: 4 },
    { hour: '12', started: 3, completed: 5 },
    { hour: '13', started: 2, completed: 4 },
    { hour: '14', started: 4, completed: 6 },
  ];

  const totalStarted = chartData.reduce((s, r) => s + r.started, 0);
  const totalCompleted = chartData.reduce((s, r) => s + r.completed, 0);
  const backlogBuilding = totalStarted > totalCompleted;

  const technicians = [
    {
      name: 'Alex',
      jobs: 9,
      efficiency: 1.18,
      stdHours: 6.4,
      util: 0.91,
      badge: '🔥 On fire',
    },
    {
      name: 'Samir',
      jobs: 7,
      efficiency: 1.05,
      stdHours: 5.1,
      util: 0.84,
      badge: 'Steady',
    },
    {
      name: 'Maria',
      jobs: 5,
      efficiency: 0.88,
      stdHours: 4.0,
      util: 0.73,
      badge: '⏱ Needs backup',
    },
  ];

  function utilisationClass(util: number) {
    if (util >= 0.85) return 'text-green-600';
    if (util >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  }
  function efficiencyClass(eff: number) {
    if (eff >= 1.1) return 'text-green-600';
    if (eff >= 0.9) return 'text-yellow-600';
    return 'text-red-600';
  }

  const alerts = [
    {
      tone: 'critical' as const,
      title: '3 halted jobs > 1 hour',
      detail: 'Estimated £420 blocked | 2 waiting parts, 1 waiting approval',
      actionLabel: 'Resolve',
    },
    {
      tone: 'warning' as const,
      title: '2 jobs running 2× normal time',
      detail: 'Check technician load / update quote before handover',
      actionLabel: 'Investigate',
    },
    {
      tone: 'info' as const,
      title: '2 pending customer approvals > 3h',
      detail: '£460 work waiting for go-ahead',
      actionLabel: 'Send Reminder',
    },
  ];

  const toneStyle = {
    critical:
      'border-red-500 bg-red-50 text-red-900 [&_button]:text-red-900 [&_button]:border-red-400',
    warning:
      'border-yellow-400 bg-yellow-50 text-yellow-900 [&_button]:text-yellow-900 [&_button]:border-yellow-400',
    info: 'border-blue-400 bg-blue-50 text-blue-900 [&_button]:text-blue-900 [&_button]:border-blue-400',
  } as const;

  return (
    <>
      {/* MAIN DASHBOARD LAYER ---------------------------------------- */}
      <div
        className="p-3 bg-gray-50 min-h-screen text-gray-900"
        data-testid="dashboard-root"
      >
        {/* KPI Tiles */}
        <section
          className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-8"
          data-testid="kpi-strip"
        >
          {kpis.map((kpi, idx) => (
            <Card
              key={idx}
              className="shadow-sm border border-gray-200 rounded-xl bg-white max-h-[110px] flex flex-col justify-center hover:shadow-md hover:border-blue-200 transition duration-150"
              tabIndex={0}
              aria-label={`${kpi.label}: ${kpi.value}${kpi.delta ? ` (${kpi.delta})` : ''}`}
            >
              <CardContent className="p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-400">
                    {kpi.icon}
                  </span>
                  {kpi.delta && (
                    <span
                      className={
                        `text-[11px] px-2 rounded-md ` +
                        (kpi.delta.startsWith('+')
                          ? 'text-green-600 bg-green-50 font-medium'
                          : kpi.delta.startsWith('-')
                            ? 'text-red-600 bg-red-50 font-medium'
                            : 'text-gray-400 bg-gray-100')
                      }
                    >
                      {kpi.delta}
                    </span>
                  )}
                </div>
                <div className="text-2xl md:text-xl text-gray-900 leading-tight truncate">
                  {kpi.value}
                </div>
                <div
                  className="text-[11px] text-gray-500 font-medium uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis"
                  title={kpi.label}
                >
                  {kpi.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Job Stage Cards */}
        <section className="mb-8" data-testid="stage-cards">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {stages.map((stage, i) => (
              <motion.div
                key={stage.key}
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  onClick={() => handleStageClick(stage.key)}
                  className={`
                    ${['HALTED', 'PAUSED', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(stage.key) ? 'cursor-pointer' : 'cursor-default'}
                    rounded-xl shadow-sm bg-white
                    border border-gray-200 border-l-2 ${stage.border}
                    hover:shadow-md hover:border-blue-200 hover:scale-[1.02] transition min-h-[120px] max-h-[120px]
                  `}
                  data-testid={`stage-${stage.key}`}
                  tabIndex={0}
                  aria-label={`${stage.label}: ${stage.count}${stage.meta ? ` (${stage.meta})` : ''}`}
                >
                  <CardContent className="pl-4 pr-4 flex flex-col gap-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-1">
                        {stage.icon}
                        <span
                          className={`text-[11px] font-semibold ${stage.textColor}`}
                        >
                          {stage.label}
                        </span>
                      </div>
                      {stage.delta && (
                        <span className="text-[10px] text-gray-400 font-medium">
                          {stage.delta}
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 leading-tight">
                      {stage.count}
                    </div>
                    <div
                      className={`text-[11px] ${stage.metaColor} font-medium`}
                    >
                      {stage.meta}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ... (rest of main dashboard unchanged) ... */}

        {/* Jobs Started vs Completed (Today) + Technician Leaderboard */}
        <section className="mb-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card
            className="border border-gray-200 shadow-sm rounded-xl bg-white min-h-[340px]"
            data-testid="throughput-card"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h2 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-500" /> Jobs Started
                  vs Completed (Today)
                </h2>
                {backlogBuilding && (
                  <span className="text-[10px] font-medium text-yellow-600 bg-yellow-50 border border-yellow-200 rounded px-2 py-1 leading-none">
                    Backlog rising
                  </span>
                )}
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 11, fill: '#6B7280' }}
                      tickLine={false}
                      axisLine={{ stroke: '#E5E7EB' }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: '#6B7280' }}
                      tickLine={false}
                      axisLine={{ stroke: '#E5E7EB' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        border: '1px solid #E5E7EB',
                        fontSize: '0.75rem',
                        color: '#111827',
                      }}
                      labelStyle={{ fontWeight: 600, color: '#6B7280' }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '0.7rem', color: '#6B7280' }}
                      iconType="circle"
                    />
                    <Bar
                      dataKey="started"
                      name="Started"
                      fill="#9CA3AF"
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={true}
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      name="Completed"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 4 }}
                      isAnimationActive={true}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[11px] text-gray-500 mt-2">
                If Started &gt; Completed for long = backlog building for
                tomorrow.
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 shadow-sm rounded-xl bg-white ">
            <CardContent className="p-4">
              <h2 className="font-semibold text-sm text-gray-800 mb-3 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-gray-500" /> Technician
                Leaderboard
              </h2>
              <div className="flex flex-wrap gap-3 text-sm">
                {technicians.map((t, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition flex-1 min-w-[180px] max-w-[260px]"
                  >
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-gray-900">{t.name}</p>
                      <span className="text-[10px] text-gray-500">
                        {t.badge}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-center">
                        <p className="text-gray-900 font-semibold leading-none">
                          {t.stdHours.toFixed(1)}h
                        </p>
                        <p className="text-[10px] text-gray-500 leading-tight">
                          Std Hours
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-center">
                        <p
                          className={`font-semibold leading-none ${efficiencyClass(t.efficiency)}`}
                        >
                          {Math.round(t.efficiency * 100)}%
                        </p>
                        <p className="text-[10px] text-gray-500 leading-tight">
                          Efficiency
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-center">
                        <p
                          className={`font-semibold leading-none ${utilisationClass(t.util)}`}
                        >
                          {Math.round(t.util * 100)}%
                        </p>
                        <p className="text-[10px] text-gray-500 leading-tight">
                          Utilisation
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Alerts / Command Center */}
        <section className="mb-10">
          <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
            <div>
              <h2 className="font-semibold text-sm text-gray-800 mb-1 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-gray-500" /> Alerts &
                Actions
              </h2>
              <p className="text-[11px] text-gray-500">
                Total blocked value today: £740 | Delay time: 2h 18m
              </p>
            </div>
            <div className="text-[11px] text-gray-400 font-medium italic">
              Most halts caused by parts delay. Order earlier next week.
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {alerts.map((a, idx) => (
              <Card
                key={idx}
                className={`border-l-3 rounded-xl shadow-sm hover:shadow-md transition bg-white min-h-[110px] ${
                  a.tone === 'critical'
                    ? 'border-red-500'
                    : a.tone === 'warning'
                      ? 'border-yellow-400'
                      : 'border-blue-400'
                }`}
              >
                <CardContent
                  className={`p-4 flex flex-col justify-between h-full ${
                    a.tone === 'critical'
                      ? toneStyle.critical
                      : a.tone === 'warning'
                        ? toneStyle.warning
                        : toneStyle.info
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{a.title}</p>
                    <p className="text-xs mt-1 leading-snug">{a.detail}</p>
                  </div>
                  <div className="mt-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border"
                      onClick={() => handleAlertCTA(a.actionLabel)}
                    >
                      {a.actionLabel}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {/* DRAWER OVERLAY LAYER ---------------------------------------- */}
      {drawerStatus && (
        <aside
          className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl border-l border-gray-200 flex flex-col z-50"
          data-testid="status-drawer"
        >
          <div className="p-4 flex items-start justify-between border-b border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {/* Show user-friendly label for the status */}
                {(() => {
                  switch ((drawerStatus || '').toUpperCase()) {
                    case 'IN_PROGRESS':
                      return 'In Progress Jobs';
                    case 'COMPLETED':
                      return 'Completed Jobs';
                    case 'PENDING':
                      return 'Pending Jobs';
                    case 'PAUSED':
                      return 'Paused Jobs';
                    case 'HALTED':
                      return 'Halted Jobs';
                    default:
                      return `${drawerStatus} Jobs`;
                  }
                })()}
              </p>
              <p className="text-[11px] text-gray-500">
                {/* Show today's date for context */}
                For&nbsp;
                <span className="font-semibold">{today}</span>
              </p>
            </div>
            <button
              className="text-xs text-gray-400 hover:text-gray-600"
              onClick={() => setDrawerStatus(null)}
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 text-sm text-gray-700">
            <div className="space-y-3">
              {/* Only show jobs for today, matching booking date and status */}
              {Array.isArray(bookingsToday) &&
                bookingsToday
                  .filter((js) => {
                    // Status filter
                    const status = (js.status || 'PENDING').toUpperCase();
                    return status === (drawerStatus || '').toUpperCase();
                  })
                  .map((js) => {
                    // Get date for the job (bookingDate)
                    const bookingDate =
                      getBookingDateFromJobSheet(js)?.slice(0, 10) || '';
                    // Prepare details for display
                    const jobNumber = js.id || 'Job';
                    const vehicle = '';
                    const value = null;
                    const techName = '';

                    // Calculate time in status
                    let statusTimeStr = '';
                    const now = Date.now();
                    if (Array.isArray(js.timeLogs)) {
                      const logs = js.timeLogs
                        .slice()
                        .sort(
                          (a, b) =>
                            new Date(a.timestamp).getTime() -
                            new Date(b.timestamp).getTime(),
                        );
                      // Find the best-matching log for status start
                      let startLog = null;
                      for (let i = logs.length - 1; i >= 0; --i) {
                        if (
                          (drawerStatus === 'HALTED' &&
                            logs[i].action === 'HALT') ||
                          (drawerStatus === 'PAUSED' &&
                            logs[i].action === 'PAUSE') ||
                          (drawerStatus === 'IN_PROGRESS' &&
                            (logs[i].action === 'START' ||
                              logs[i].action === 'RESUME')) ||
                          (drawerStatus === 'PENDING' &&
                            logs[i].action !== 'START' &&
                            logs[i].action !== 'RESUME' &&
                            logs[i].action !== 'PAUSE' &&
                            logs[i].action !== 'HALT' &&
                            logs[i].action !== 'COMPLETE') ||
                          (drawerStatus === 'COMPLETED' &&
                            logs[i].action === 'COMPLETE')
                        ) {
                          startLog = logs[i];
                          break;
                        }
                      }
                      if (startLog && startLog.timestamp) {
                        const sec =
                          Math.round(
                            (now - new Date(startLog.timestamp).getTime()) /
                              1000,
                          ) || 0;
                        if (sec >= 3600) {
                          statusTimeStr = `${Math.floor(sec / 3600)}h${Math.floor(
                            (sec % 3600) / 60,
                          )}m`;
                        } else if (sec >= 60) {
                          statusTimeStr = `${Math.floor(sec / 60)}m`;
                        } else {
                          statusTimeStr = `${sec}s`;
                        }
                      }
                    }
                    const reason = '';

                    // CTAs for each status
                    let ctas: React.ReactNode = null;
                    if (drawerStatus === 'HALTED') {
                      ctas = (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] py-1 px-2"
                          >
                            Mark Issue Resolved
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] py-1 px-2"
                          >
                            Resume Job
                          </Button>
                        </>
                      );
                    } else if (drawerStatus === 'PAUSED') {
                      ctas = (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] py-1 px-2"
                          >
                            Resume Job
                          </Button>
                        </>
                      );
                    } else if (drawerStatus === 'PENDING') {
                      ctas = (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] py-1 px-2"
                          >
                            Start Job
                          </Button>
                        </>
                      );
                    } else if (drawerStatus === 'IN_PROGRESS') {
                      ctas = (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] py-1 px-2"
                          >
                            Pause
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] py-1 px-2"
                          >
                            Complete
                          </Button>
                        </>
                      );
                    } else if (drawerStatus === 'COMPLETED') {
                      ctas = null; // no CTAs
                    }
                    // Compose job card
                    return (
                      <div
                        key={js.id || Math.random()}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between text-[12px]">
                          <div className="text-gray-900 font-medium">
                            Job {jobNumber ? `#${jobNumber}` : ''}{' '}
                            {vehicle ? `· ${vehicle}` : ''}
                          </div>
                          {value != null ? (
                            <div className="text-red-600 font-semibold">
                              £{Number(value).toLocaleString()}
                              {(drawerStatus === 'HALTED' ||
                                drawerStatus === 'PAUSED') &&
                                ' stuck'}
                            </div>
                          ) : null}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-1">
                          <span>
                            {reason ? reason + ' · ' : ''}
                            {drawerStatus === 'HALTED'
                              ? `Halted ${statusTimeStr}`
                              : drawerStatus === 'PAUSED'
                                ? `Paused ${statusTimeStr}`
                                : drawerStatus === 'IN_PROGRESS'
                                  ? `In progress ${statusTimeStr}`
                                  : drawerStatus === 'PENDING'
                                    ? `Pending ${statusTimeStr}`
                                    : drawerStatus === 'COMPLETED'
                                      ? `Completed on ${bookingDate}`
                                      : ''}
                          </span>
                          {techName ? ` · Tech: ${techName}` : ''}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          Date: {bookingDate}
                        </div>
                        <div className="flex gap-2 mt-3 flex-wrap">{ctas}</div>
                      </div>
                    );
                  })}

              {/* No jobs for this status */}
              {Array.isArray(bookingsToday) &&
                bookingsToday.filter(
                  (js) =>
                    (js.status || 'PENDING').toUpperCase() ===
                    (drawerStatus || '').toUpperCase(),
                ).length === 0 && (
                  <div className="text-gray-400 text-center py-8 italic text-xs">
                    No jobs found for status: {drawerStatus} ({today})
                  </div>
                )}
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
