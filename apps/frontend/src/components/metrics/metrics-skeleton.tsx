import { Card } from "@/components/ui/card";

export function MetricsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-card border border-border">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-muted rounded-full" />
          <div className="h-8 w-64 bg-muted rounded-2xl" />
        </div>
        <div className="h-10 w-36 bg-muted rounded-full" />
      </div>

      {/* 4 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-3xl border-2 border-border/60 bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="size-11 rounded-2xl bg-muted" />
              <div className="h-5 w-16 bg-muted rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-9 w-28 bg-muted rounded-xl" />
              <div className="h-3 w-40 bg-muted rounded-full" />
            </div>
          </Card>
        ))}
      </div>

      {/* 2 Detailed Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-3xl border-2 border-border/60 bg-card p-8 space-y-6">
          <div className="h-6 w-48 bg-muted rounded-xl" />
          <div className="h-4 w-full bg-muted rounded-full" />
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="h-28 bg-muted rounded-2xl" />
            <div className="h-28 bg-muted rounded-2xl" />
            <div className="h-28 bg-muted rounded-2xl" />
          </div>
        </Card>

        <Card className="rounded-3xl border-2 border-border/60 bg-card p-8 space-y-6">
          <div className="h-6 w-48 bg-muted rounded-xl" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-muted rounded-2xl" />
            <div className="h-32 bg-muted rounded-2xl" />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default MetricsSkeleton;
