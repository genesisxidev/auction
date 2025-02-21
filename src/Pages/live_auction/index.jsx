import React, { useEffect, useState } from "react";
import Card from "../../Components/card";
import useAuction from "../../context/AuctionContext";
import useScrolltoTop from "../../hook/useScrolltoTop";
import axios from "axios";
import Spinner from "../../Components/loader";
import { useLocation } from "react-router-dom";
import AuctionCardSkeleton from "../../Components/SkeletonLoading/AuctionCardSkeletonLoading";
import { useBidPlacedListener } from "../../hook/useBidPlacedListener";
function LiveAuction({ isLive }) {
  const {
    getLiveAuctions,

    getTokenURI,

    getEndedAuctions,
    isEndRefetch,
    isRefetchLiveAuction,
  } = useAuction();
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [EndedAuctions, setEndedAuctions] = useState(false);
  const [isEndedAuctionsLoading, setIsEndedAuctionsLoading] = useState(true);
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  useScrolltoTop();

  useEffect(() => {
    const fetchLiveAuctions = async () => {
      setLoading(true);
      try {
        const res = await getLiveAuctions();

        const liveAuctionIds = res
          .filter(
            (item) =>
              Number(item.tokenId) >= 1 &&
              Number(item.startTime) < Math.floor(Date.now() / 1000)
          )
          .map((item) => Number(item.tokenId));

        if (liveAuctionIds.length === 0) return;

        const uris = await getTokenURI(liveAuctionIds);

        const auctionData = await Promise.all(
          uris.map(async (uri, index) => {
            try {
              const { data } = await axios.get(uri.replace(/\.json$/, ""));
              return { ...data, tokenId: liveAuctionIds[index] };
            } catch (error) {
              console.error("Error fetching URI:", uri, error);
              return null;
            }
          })
        );

        setLiveAuctions(auctionData.filter(Boolean));
      } catch (error) {
        console.error("Error fetching live auctions:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUpcomingAndEndedAuctions = async () => {
      setLoading(true);
      try {
        // Fetch both upcoming and ended auctions in parallel
        const [endedRes] = await Promise.all([getEndedAuctions()]);

        // Process upcoming auctions

        // Process ended auctions
        const endedData = await Promise.all(
          endedRes?.map(async (item) => {
            try {
              const { data } = await axios.get(
                item?.tokenURI.replace("ipfs/", "https://ipfs.io/ipfs/")
              );
              return { ...data, ...item };
            } catch (error) {
              console.error("Error fetching ended auction URI:", error);
              return null;
            }
          })
        );
        setEndedAuctions(endedData.filter(Boolean));
        setIsEndedAuctionsLoading(false);
      } catch (error) {
        console.error("Error fetching auctions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isLive) {
      fetchLiveAuctions();
    } else {
      fetchUpcomingAndEndedAuctions();
    }
  }, [isLive, isEndRefetch, isRefetchLiveAuction]);

  useBidPlacedListener("AuctionCreated", true);

  return (
    <>
      <div className="py-[150px]">
        <div className="relative">
          <div className="element z-[-1] absolute top-0 left-0 w-full h-full"></div>
          <div className="container">
            <div className="px-4 grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 lg:gap-10 md:gap-8 gap-5">
              {loading ? (
                Array(9)
                  .fill()
                  .map((_, index) => <AuctionCardSkeleton key={index} />)
              ) : isLive ? (
                liveAuctions?.length === 0 ? (
                  <div className="text-center text-2xl font-bold col-span-full text-white font-dela-gothic-one lg:h-[500px] md:h-[400px] h-[300px] flex justify-center items-center">
                    No live auctions found
                  </div>
                ) : (
                  liveAuctions.map((item, index) => (
                    <Card key={index} item={item} isLive={isLive} />
                  ))
                )
              ) : liveAuctions?.length === 0 && EndedAuctions?.length === 0 ? (
                <div className="text-center text-2xl font-bold col-span-full text-white font-dela-gothic-one lg:h-[500px] md:h-[400px] h-[300px] flex justify-center items-center">
                  No auctions found
                </div>
              ) : (
                // [...liveAuctions, ...EndedAuctions].map((item, index) => (
                //   <Card key={index} item={item} isLive={isLive} />
                // ))
                [...EndedAuctions].map((item, index) => (
                  <Card key={index} item={item} isLive={isLive} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LiveAuction;
