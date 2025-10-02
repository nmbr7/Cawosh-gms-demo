// /lib/notify.ts

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window !== "undefined" && "Notification" in window) {
    const permission = await Notification.requestPermission();
    return permission;
  }
  return "denied";
}

export function sendNotification(title: string, options?: NotificationOptions) {
  if (typeof window !== "undefined" && Notification.permission === "granted") {
    console.log("notify lib");
    new Notification(title, options);
  }
}

// Simple app-level notify helper used in pages
export function notify(
  message: string,
  type: "success" | "error" | "info" = "info"
) {
  // Prefer console for now; integrate a toast library later
  const prefix = type.toUpperCase();

  console.log(`[${prefix}]`, message);
  if (typeof window !== "undefined" && type === "error") {
    // fallback for visibility during development

    alert(message);
  }
}
