"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Receipt } from "lucide-react";
import { DashboardStatCard } from "@/app/components/DashboardStatCard";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className=" text-gray-500 font-medium pl-1">Today</div>
      <div className="flex w-full gap-6 bg-[#F5F5F5]">
        <DashboardStatCard
          label="On-going"
          value={10}
          iconSvg="/icons/dollar.svg"
          active
          className="flex-1"
        />
        <DashboardStatCard
          label="Up-coming"
          value={20}
          iconSvg="/icons/dollar.svg"
          className="flex-1"
        />
        <DashboardStatCard
          label="Completed"
          value={15}
          iconSvg="/icons/dollar.svg"
          className="flex-1"
        />
      </div>
      <div className=" text-gray-500 font-medium pl-1">This month</div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-gray-500">+20.1% from last month</p>
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">Bookings</CardTitle>
            <div className="rounded-full border border-gray-200 bg-white w-10 h-10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">235</div>
            <p className="text-xs text-gray-500">+180.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">Job Sheets</CardTitle>
            <div className="rounded-full border border-gray-200 bg-white w-10 h-10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-gray-500">+19% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">Billings</CardTitle>
            <div className="rounded-full border border-gray-200 bg-white w-10 h-10 flex items-center justify-center">
              <Receipt className="h-4 w-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,234</div>
            <p className="text-xs text-gray-500">+20.1% from last month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
