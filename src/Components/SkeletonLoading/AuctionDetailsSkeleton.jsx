const AuctionDetailsSkeleton = () => {
  return (
    <div className="py-[150px]">
      <div className="page-container">
        <div className="element z-[-1] absolute top-0 left-0 w-full h-full"></div>
        <div className="container">
          <div className="grid md:grid-cols-2 grid-cols-1 xl:gap-[117px] lg:gap-[80px] gap-[40px]">
            {/* Image Skeleton */}
            <div className="w-full flex lg:justify-end justify-center">
              <div
                className="rounded-[5px] bg-[#323232] max-w-[30.25rem] w-full lg:h-[30.25rem] md:h-[25rem] h-[20rem] lg:p-10 md:p-7 p-4 animate-pulse"
                style={{
                  boxShadow: "0px 4px 11.399999618530273px 0 rgba(0,0,0,0.69)",
                }}
              >
                <div className="w-full h-full bg-gray-700 rounded"></div>
              </div>
            </div>

            {/* Text Content Skeleton */}
            <div className="flex flex-col text-white md:pt-1 pt-0 lg:pr-[18px] pr-0 md:px-0 px-3">
              {/* Title Skeleton */}
              <div className="w-3/4 h-10 bg-gray-700 rounded mb-4 animate-pulse"></div>

              {/* Token ID & Description Skeleton */}
              <div className="f-col sm-text bold font-alte-haas-grotesk gap-4 pt-[21px]">
                <div className="w-1/2 h-5 bg-gray-700 rounded mb-2 animate-pulse"></div>
                <div className="w-full h-4 bg-gray-700 rounded animate-pulse"></div>
                <div className="w-2/3 h-4 bg-gray-700 rounded mt-1 animate-pulse"></div>
              </div>

              {/* Top Bids Skeleton */}
              <div className="pt-9 f-col gap-[0.5625rem]">
                <div className="w-1/3 h-6 bg-gray-700 rounded animate-pulse"></div>
                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex justify-between">
                    <div className="w-1/3 h-4 bg-gray-600 rounded animate-pulse"></div>
                    <div className="w-1/4 h-4 bg-gray-600 rounded animate-pulse"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="w-1/3 h-4 bg-gray-600 rounded animate-pulse"></div>
                    <div className="w-1/4 h-4 bg-gray-600 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Current Price & Timer Skeleton */}
              <div className="f-col pt-[26px]">
                <div className="flex md:flex-row flex-col items-start gap-14">
                  <div className="f-col items-start gap-1">
                    <div className="w-1/3 h-5 bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-1/4 h-6 bg-gray-600 rounded animate-pulse"></div>
                  </div>
                  
                </div>
              </div>

              {/* Buttons Skeleton */}
              <div className="pt-[35px] max-w-[472px] w-full flex justify-between items-center">
                <div className="w-1/3 h-10 bg-gray-700 rounded animate-pulse"></div>
                <div className="w-1/3 h-10 bg-gray-600 rounded animate-pulse"></div>
              </div>

              {/* Error Message Skeleton */}
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetailsSkeleton;
