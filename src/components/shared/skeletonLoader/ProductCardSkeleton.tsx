import { Card } from "@/components/ui/card";
import { Skeleton } from "../../ui/skeleton";

const ProductCardSkeleton = () => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 pb-12">
    {[1, 2, 3, 4].map((index) => (
      <Card key={index} className="overflow-hidden animate-pulse">
        <div className="bg-secondary flex items-center justify-center h-64 2xl:h-60">
          <Skeleton className="h-full w-full object-cover" />
        </div>
        <div className="p-6 space-y-4">
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="flex justify-between items-center gap-3 text-sm">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex justify-between items-center gap-3 text-sm pt-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="flex gap-2 pt-4">
            <Skeleton className="h-10 w-1/2 rounded" />
            <Skeleton className="h-10 w-1/2 rounded" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);

export default ProductCardSkeleton;
