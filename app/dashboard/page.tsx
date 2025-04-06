"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { sendNotification, requestNotificationPermission } from "@/lib/notify";

export default function DashboardPage() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    requestNotificationPermission().then(setPermission);
  }, []);

  const handleNotify = () => {
    console.log("notify");
    sendNotification("🔔 New Task Assigned!", {
      body: "You have a new task in your dashboard.",
      icon: "/favicon.ico",
    });
  };
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-600 mt-2">
        Welcome to the Cawosh backoffice dashboard.
      </p>

      <Button onClick={handleNotify} disabled={permission !== "granted"}>
        Emit OS Notification
      </Button>
    </div>
  );
}
