import { cn } from "@/lib/utils";

interface TableLoaderProps {
  rows?: number;
  className?: string;
}

export function TableLoader({ rows = 3, className }: TableLoaderProps) {
  return (
    <div
      className={cn("bg-white rounded-lg shadow overflow-hidden", className)}
    >
      <div className="animate-pulse">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 mb-2" />
        ))}
      </div>
    </div>
  );
}
