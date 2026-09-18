import { Card } from "@/components/ui/card";

export function SubscriptionSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search Bar Skeleton */}
      <div className="h-11 w-full max-w-md rounded-xl bg-muted/60 animate-pulse" />

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <Card key={idx} className="p-6 space-y-4 border border-border/80">
            <div className="flex items-center justify-between">
              <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
              <div className="size-5 rounded-full bg-muted animate-pulse" />
            </div>

            <div className="space-y-2">
              <div className="h-6 w-28 rounded-md bg-muted animate-pulse" />
              <div className="h-8 w-36 rounded-md bg-muted animate-pulse" />
            </div>

            <div className="space-y-2 py-4 border-y border-border/60">
              <div className="h-4 w-40 rounded bg-muted animate-pulse" />
              <div className="h-4 w-32 rounded bg-muted animate-pulse" />
              <div className="h-4 w-48 rounded bg-muted animate-pulse" />
            </div>

            <div className="space-y-2 pt-2">
              <div className="h-3 w-24 rounded bg-muted animate-pulse" />
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
            </div>

            <div className="h-4 w-32 mx-auto rounded bg-muted animate-pulse mt-4" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export default SubscriptionSkeleton;
