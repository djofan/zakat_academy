import { SkeletonTable } from "@/components/shared/skeleton-table";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <SkeletonTable cols={5} rows={5} />
      </div>
    </div>
  );
}
