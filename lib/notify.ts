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
