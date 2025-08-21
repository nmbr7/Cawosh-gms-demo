"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStatCard } from "@/app/components/DashboardStatCard";

import {
  Calendar,
  Note,
  Files,
  ChartLineUp,
  CheckCircle,
  // ArrowClockwise,
  Timer,
  ArrowsClockwise,
  // ArrowClockwise,
} from "phosphor-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6 bg-[#F5F5F5]">
      <div className=" text-gray-500 font-medium pl-1 ">Today</div>
      <div className="flex sm:flex-row flex-col w-full sm:w-[90%] gap-6 bg-[#F5F5F5]">
        <DashboardStatCard
          label="On-going"
          value={10}
          // iconSvg="/icons/dollar.svg"
          icon={<ArrowsClockwise size={28} />}
          active
          className="flex-1"
        />
        <DashboardStatCard
          label="Up-coming"
          value={20}
          icon={<Timer size={28} />}
          // iconSvg="/icons/dollar.svg"
          className="flex-1"
        />
        <DashboardStatCard
          label="Completed"
          value={15}
          icon={<CheckCircle size={28} />}
          // iconSvg="/icons/dollar.svg"
          className="flex-1"
        />
      </div>
      <div className=" text-gray-500 font-medium pl-1">This month</div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">Bookings</CardTitle>
            <div className="rounded-full border border-gray-200 bg-white w-10 h-10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <div className="text-3xl font-bold">235</div>
              <div className="flex gap-1 items-center">
                <ChartLineUp size={16} className="text-green-500" />
                <span className="text-xs text-green-500">+180.1%</span>
                <span className="text-xs text-gray-500">from last month</span>
              </div>
              {/* <p className="text-xs text-gray-500">+180.1% from last month</p> */}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">Job Sheets</CardTitle>
            <div className="rounded-full border border-gray-200 bg-white w-10 h-10 flex items-center justify-center">
              <Note className="h-5 w-5 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <div className="text-3xl font-bold">12</div>
              <div className="flex gap-1 items-center">
                <ChartLineUp size={16} className="text-green-500" />
                <span className="text-xs text-green-500">+19%</span>
                <span className="text-xs text-gray-500">from last month</span>
              </div>
              {/* <p className="text-xs text-gray-500">+19% from last month</p> */}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">Billings</CardTitle>
            <div className="rounded-full border border-gray-200 bg-white w-10 h-10 flex items-center justify-center">
              <Files className="h-5 w-5 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <div className="text-3xl font-bold">£12,234</div>
              <div className="flex gap-1 items-center">
                <ChartLineUp size={16} className="text-green-500" />
                <span className="text-xs text-green-500">+20.1%</span>
                <span className="text-xs text-gray-500">from last month</span>
              </div>
              {/* <p className="text-xs text-gray-500">+20.1% from last month</p> */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
