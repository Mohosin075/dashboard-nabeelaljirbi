import { Skeleton } from "@/components/ui/skeleton";

const ShowDetailsSkeleton = () => (
  <section>
    <div className="bg-app-bg py-5">
      <div className="app-container">
        <Skeleton className="h-6 w-40 mb-4" />
      </div>
    </div>
    <div className="pt-8 app-container">
      <div className="bg-white p-5 rounded-xl">
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="h-80 w-full md:w-1/2 rounded-xl" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-2" />
          </div>
        </div>
        <div className="mt-8">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-2" />
        </div>
      </div>
    </div>
    <div className="pb-12 pt-12 bg-app-bg">
      <div className="app-container">
        <Skeleton className="h-8 w-40 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
      </div>
    </div>
  </section>
);

export default ShowDetailsSkeleton;
