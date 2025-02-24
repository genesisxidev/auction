import React, { useState } from 'react';

const MiniNFTCard = ({ auction, index, data, setData }) => {
  const [isLoading, setIsLoading] = useState(true);
  const ipfsUrl = auction?.image?.replace('ipfs://', 'https://ipfs.io/ipfs/');
  const handleImageLoad = () => {
    setIsLoading(false);
  };
  return (
    <div
      key={index}
      onClick={() => setData({ ...data, tokenId: auction.tokenId })}
      className={`flex flex-col gap-3 items-center cursor-pointer lg:min-w-[200px] md:min-w-[150px] min-w-[120px] p-2 rounded-lg ${
        data.tokenId === auction.tokenId
          ? 'border-2 border-light-blue'
          : 'bg-[#2c2c2c]'
      } transition-colors`}
    >
      {/* <picture className="block relative">
        {isLoading && ( // Show loading effect while loading
          <div className="skeleton-loader w-full xl:h-[150px] lg:h-[140px] md:h-[130px] h-[120px] absolute top-0 left-0"></div> // Skeleton loader
        )}

        <source srcSet={ipfsUrl} type="image/webp" />
        <source srcSet={ipfsUrl} type="image/png" />
        <img
          loading="lazy"
          src={ipfsUrl}
          data-src={ipfsUrl}
          alt="user-img"
          className="w-full xl:h-[180px] md:h-[150px] h-[120px]  object-cover object-top"
          onLoad={handleImageLoad} // Added onLoad event
        />
      </picture> */}
      <div className="flex items-center justify-center w-full xl:h-[150px] lg:h-[140px] md:h-[130px] h-[120px] bg-[#2c2c2c] text-white font-bold text-xl">
        Token ID: #{Number(auction.tokenId)}
      </div>
    </div>
  );
};

export default MiniNFTCard;
