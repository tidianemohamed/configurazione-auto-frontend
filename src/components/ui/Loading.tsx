export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}

export function SkeletonLoader({ className = '' }: { className?: string }) {
  return (
    <div
      className={`
        bg-gray-200 rounded-lg animate-pulse
        ${className}
      `}
    />
  );
}

interface SkeletonCardProps {
  lines?: number;
}

export function SkeletonCard({ lines = 3 }: SkeletonCardProps) {
  return (
    <div className="space-y-4 p-6 bg-white rounded-xl border border-gray-200">
      <SkeletonLoader className="h-6 w-1/3" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <SkeletonLoader key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}
