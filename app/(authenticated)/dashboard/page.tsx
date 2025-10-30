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

// Replace these with actual store imports and selectors if available
// import { useGarageStore } from "@/store/garage";
// import { useDashboardStore } from "@/store/dashboard";

export default function DashboardPage() {
  // Example integration with stores (pseudo-code):
  // const { jobs, bookings, billings, kpis } = useDashboardStore();
  // const { techLeaderboard, jobStages, alerts, chartData } = useGarageStore();

  const [drawerStatus, setDrawerStatus] = React.useState<null | string>(null);

  function handleStageClick(statusKey: string) {
    if (['HALTED', 'PAUSED', 'PENDING'].includes(statusKey)) {
      setDrawerStatus(statusKey);
    }
  }

  function handleAlertCTA(actionLabel: string) {
    if (actionLabel === 'Resolve') {
      setDrawerStatus('HALTED');
    }
    // Add more CTA logic as needed
  }

  // --- Mock data, to be replaced with store data integration ---
  const kpis = [
    {
      icon: <Wrench className="w-5 h-5" />,
      label: 'Active Jobs',
      value: 8,
      delta: '+2 vs yesterday',
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Jobs Completed Today',
      value: 26,
      delta: '-4 vs yesterday',
    },
    {
      icon: <Timer className="w-5 h-5" />,
      label: 'Job Efficiency Today',
      value: '104%',
      delta: '-3% vs yesterday',
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'Tech Utilisation',
      value: '86%',
      delta: '+5%',
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: 'Halted Jobs',
      value: 3,
      delta: '+1',
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: 'Revenue Today',
      value: '£1,480',
      delta: '£1,480 / £2,000 target',
    },
  ];

  const stages = [
    {
      key: 'PENDING',
      label: 'PENDING',
      icon: <Clock4 className="w-4 h-4 text-gray-500" />,
      count: 4,
      delta: '-1',
      meta: 'avg wait: 12m',
      border: 'border-gray-400',
      textColor: 'text-gray-800',
      metaColor: 'text-gray-500',
    },
    {
      key: 'IN_PROGRESS',
      label: 'IN PROGRESS',
      icon: <PlayCircle className="w-4 h-4 text-blue-500" />,
      count: 8,
      delta: '+3',
      meta: 'avg duration: 46m',
      border: 'border-blue-400',
      textColor: 'text-blue-900',
      metaColor: 'text-blue-500',
    },
    {
      key: 'PAUSED',
      label: 'PAUSED',
      icon: <PauseCircle className="w-4 h-4 text-yellow-500" />,
      count: 2,
      delta: null,
      meta: '30m avg pause',
      border: 'border-yellow-400',
      textColor: 'text-yellow-900',
      metaColor: 'text-yellow-600',
    },
    {
      key: 'HALTED',
      label: 'HALTED',
      icon: <AlertOctagon className="w-4 h-4 text-red-500" />,
      count: 3,
      delta: '+1',
      meta: 'avg halt: 52m',
      border: 'border-red-400',
      textColor: 'text-red-900',
      metaColor: 'text-red-600',
    },
    {
      key: 'COMPLETED',
      label: 'COMPLETED',
      icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
      count: 11,
      delta: '+2',
      meta: 'avg time: 41m',
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
        {/* KPI Tiles -------------------------------------------------- */}
        <section
          className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-8"
          data-testid="kpi-strip"
        >
          {kpis.map((kpi, idx) => (
            <Card
              key={idx}
              className="shadow-sm border border-gray-200 rounded-xl bg-white"
            >
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div className="text-gray-400">{kpi.icon}</div>
                  <div className="text-[10px] text-gray-400 font-medium">
                    {kpi.delta}
                  </div>
                </div>
                <div className="text-xl font-semibold text-gray-900 leading-tight">
                  {kpi.value}
                </div>
                <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">
                  {kpi.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Job Stage Cards (Kanban snapshot of workflow health) ------- */}
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
                    ${['HALTED', 'PAUSED', 'PENDING'].includes(stage.key) ? 'cursor-pointer' : 'cursor-default'}
                    rounded-xl shadow-sm bg-white
                    border border-gray-200 border-l-4 ${stage.border}
                    hover:shadow-md hover:scale-[1.02] transition
                  `}
                  data-testid={`stage-${stage.key}`}
                >
                  <CardContent className="p-4 flex flex-col gap-2">
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

        {/* Jobs Started vs Completed (Today) + Technician Leaderboard -- */}
        <section className="mb-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Jobs Started vs Completed (Today) */}
          <Card
            className="border border-gray-200 shadow-sm rounded-xl bg-white"
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

          {/* Technician Leaderboard */}
          <Card className="border border-gray-200 shadow-sm rounded-xl bg-white">
            <CardContent className="p-4">
              <h2 className="font-semibold text-sm text-gray-800 mb-3 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-gray-500" /> Technician
                Leaderboard
              </h2>
              {/* Wrap the technician leaderboard cards */}
              <div className="flex flex-wrap gap-3 text-sm">
                {technicians.map((t, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition flex-1 min-w-[200px] max-w-xs"
                  >
                    {/* Header row: tech name + badge */}
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-gray-900">{t.name}</p>
                      <span className="text-[10px] text-gray-500">
                        {t.badge}
                      </span>
                    </div>
                    {/* Stat row: sub-cards */}
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-center">
                        <p className="text-gray-900 font-semibold leading-none">
                          {t.stdHours.toFixed(1)}h
                        </p>
                        <p className="text-[10px] text-gray-500 leading-tight">
                          std hours
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-center">
                        <p
                          className={`font-semibold leading-none ${efficiencyClass(t.efficiency)}`}
                        >
                          {Math.round(t.efficiency * 100)}%
                        </p>
                        <p className="text-[10px] text-gray-500 leading-tight">
                          efficiency
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-center">
                        <p
                          className={`font-semibold leading-none ${utilisationClass(t.util)}`}
                        >
                          {Math.round(t.util * 100)}%
                        </p>
                        <p className="text-[10px] text-gray-500 leading-tight">
                          utilisation
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Alerts / Command Center ------------------------------------ */}
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
                className={`border-l-4 rounded-xl shadow-sm hover:shadow-md transition bg-white ${
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
                {drawerStatus} Jobs
              </p>
              <p className="text-[11px] text-gray-500">
                Live view of jobs that need attention
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
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between text-[12px]">
                  <div className="text-gray-900 font-medium">
                    Job #A123 · Ford Fiesta
                  </div>
                  <div className="text-red-600 font-semibold">£180 stuck</div>
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  Waiting parts · Halted 47m · Tech: Alex
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] py-1 px-2"
                  >
                    Mark Parts Arrived
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] py-1 px-2"
                  >
                    Resume Job
                  </Button>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between text-[12px]">
                  <div className="text-gray-900 font-medium">
                    Job #B447 · BMW 3 Series
                  </div>
                  <div className="text-red-600 font-semibold">£240 stuck</div>
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  Waiting customer approval · Halted 1h12m · Tech: Samir
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] py-1 px-2"
                  >
                    Send Approval Reminder
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 italic mt-4">
              (Demo placeholder) In prod: fetch /api/jobs?status={drawerStatus}{' '}
              and map here
            </p>
          </div>
        </aside>
      )}
    </>
  );
}
