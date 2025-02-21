const AuctionCardSkeleton = () => {
  return (
    <div className="w-full bg-[#323232] rounded-lg shadow-lg overflow-hidden cursor-pointer font-alte-haas-grotesk animate-pulse">
      <div className="relative mt-0">
        {/* Image Skeleton */}
        <div className="skeleton-loader w-full xl:h-[370px] lg:h-[330px] md:h-[300px] h-[280px] bg-gray-700"></div>

        {/* Status Badge Skeleton */}
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
          <div className="bg-gray-600 lg:h-5 lg:w-5 h-3 w-3 rounded-full"></div>
          <div className="w-14 h-4 bg-gray-600 rounded"></div>
        </div>
      </div>

      <div className="p-4">
        {/* Title Skeleton */}
        <div className="w-3/4 h-6 bg-gray-600 mb-2 rounded"></div>

        {/* Token ID Skeleton */}
        <div className="w-1/2 h-4 bg-gray-600 rounded"></div>
      </div>
    </div>
  );
};

export default AuctionCardSkeleton;
