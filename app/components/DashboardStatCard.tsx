// components/DashboardStatCard.tsx
import React from "react";
import { cn } from "@/lib/utils"; // If you use a classnames utility
import Image from "next/image";

interface DashboardStatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  iconSvg?: string; // New prop for SVG path
  periodLabel?: string;
  active?: boolean;
  className?: string;
}

export const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  label,
  value,
  icon,
  iconSvg,
  periodLabel,
  active = false,
  className,
}) => (
  <div
    className={cn(
      "flex items-center gap-4 rounded-xl px-8 py-3 shadow-sm transition-colors",
      active ? "bg-[#E6E86A] text-black" : "bg-white text-[#0B0D19]",
      className
    )}
    style={{ minWidth: 220 }}
  >
    <div className="flex items-center justify-center">
      {iconSvg ? (
        <Image
          src={iconSvg}
          alt="icon"
          width={48}
          height={48}
          //   className="opacity-40"
        />
      ) : (
        icon
      )}
    </div>
    <div className="flex-1">
      {periodLabel && (
        <div className="text-xs text-gray-500 mb-1">{periodLabel}</div>
      )}
      <div className="text-base font-medium">{label}</div>
    </div>
    <div className="text-4xl font-medium">{value}</div>
  </div>
);
