import React, { useEffect, useState } from "react";
import ModalWrapper from "../../ModalWrapper/Wrapper";
import useAuction from "../../../context/AuctionContext";

import { toast } from "react-toastify";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import Spinner from "../../loader";
import ConnectWallet from "../../connectWalletComp/connectWallet";
import CommonBtn from "../../Button/CommonBtn";
import { isNotEmptyString } from "../../../helpers/helper";
import axios from "axios";
import MiniNFTCard from "../../mini-card/MiniNFTCard";
const CreateAuctionModal = ({ setModal }) => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [auctions, setAuctions] = useState([]);
  const [isAuctionLoading, setIsAuctionLoading] = useState(true);

  const {
    createAuction,
    setIsRefetchUpcomingAuctions,
    getUpcomingAuctions,
    getTokenURI,
  } = useAuction();
  const [error, setError] = useState({});
  const [data, setData] = useState({
    tokenId: "",
    startTime: "",
    days: "",
    hours: "",
    minutes: "",
    endTime: "",
    basePrice: "",
    interval: "",
  });

  useEffect(() => {
    const fetchUpcomingAndEndedAuctions = async () => {
      setIsAuctionLoading(true);
      try {
        // Fetch both upcoming and ended auctions in parallel
        const [upcomingRes] = await Promise.all([getUpcomingAuctions()]);

        // Process upcoming auctions
        // const upcomingIds = upcomingRes
        //   .filter((item) => Number(item.tokenId) >= 1)
        //   .map((item) => Number(item.tokenId));

        if (upcomingRes.length > 0) {
          // const uris = await getTokenURI(upcomingIds);
          const upcomingData = await Promise.all(
            upcomingRes.map(async (item) => {
              try {
                const { data } = await axios.get(
                  item?.tokenURI.replace("ipfs/", "https://ipfs.io/ipfs/")
                );
                return { ...data, ...item };
              } catch (error) {
                console.error("Error fetching URI:", item?.tokenURI, error);
                return null;
              }
            })
          );
          setAuctions(upcomingData.filter(Boolean));
        }

        // Process ended auctions
      } catch (error) {
        console.error("Error fetching auctions:", error);
      } finally {
        setIsAuctionLoading(false);
      }
    };
    fetchUpcomingAndEndedAuctions();
  }, []);

  const handleCreateAuction = async () => {
    const newError = {};
    if (!isNotEmptyString(data.tokenId)) {
      newError.tokenId = "Token ID is required";
    }
    if (
      !isNotEmptyString(data.days) &&
      !isNotEmptyString(data.hours) &&
      !isNotEmptyString(data.minutes)
    ) {
      newError.endTime = "Duration is required";
    }
    // if (!isNotEmptyString(data.endTime)) {
    //   newError.endTime = "End time is required";
    // } else if (
    //   new Date(data.endTime) < new Date(data.startTime) ||
    //   new Date(data.endTime) < new Date()
    // ) {
    //   newError.endTime = "End time must be greater than start time";
    // }
    if (!data.basePrice) {
      newError.basePrice = "Base price is required";
    }
    if (!data.interval) {
      newError.interval = "Interval is required";
    }
    if (Object.keys(newError).length > 0) {
      setError(newError);
      return;
    }
    setLoading(true);

    const startTimeStamp = Math.floor(
      new Date(data.startTime).getTime() / 1000
    );
    // const endTimeStamp = Math.floor(new Date(data.endTime).getTime() / 1000);

    // console.log("startTimeStamp", startTimeStamp);
    // console.log("endTimeStamp", endTimeStamp);
    // console.log("data.basePrice", data.basePrice);
    // console.log("data.tokenId", data.tokenId);
    // console.log("data.interval", data.interval);

    const trx = await createAuction(
      data.tokenId,
      data.endTime,
      data.basePrice,
      data.interval,
      data.nftUri
    );
    console.log("trx", trx);
    if (trx?.status === false) {
      toast.error("Something went wrong");
      setLoading(false);
      setModal(false);
      return;
    } else {
      toast.success("Auction created successfully");
      setLoading(false);
      setModal(false);
      setIsRefetchUpcomingAuctions((prev) => !prev);
    }
    setLoading(false);
  };
  const onChangeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    setError({ ...error, [e.target.name]: "" });
  };

  const closeModal = () => {
    setModal(false);
  };

  console.log("auctions", auctions);

  return (
    <ModalWrapper className="max-w-[53.5625rem]" setIsModalOpen={setModal}>
      <div className="p-[21px] pb-[42px]">
        <div className="modal-header relative text-white">
          <p className="lg-text text-center text-white font-alte-haas-grotesk">
            Create New Auction
          </p>
          <button
            className="absolute top-0 right-0 xl-text font-bold font-alte-haas-grotesk"
            onClick={closeModal}
          >
            X
          </button>
        </div>
        <div className="modal-body flex flex-col gap-4 mt-6 w-full">
          <div className="flex flex-col gap-2">
            {/* <label className="form-label-text">Token ID</label>
            <input
              type="number"
              name="tokenId"
              value={data.tokenId}
              onChange={onChangeHandler}
              className="w-full mx-auto h-[50px] rounded-full bg-[#3c3c3c] lg-text font-bold text-center text-white font-alte-haas-grotesk no-outline px-3"
              placeholder="Enter token ID"
            /> */}

            <div className="relative">
              <label className="form-label-text mb-2 block">Select NFT</label>
              <div className="overflow-x-auto">
                <div className="flex gap-4 pb-4">
                  {isAuctionLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <div className="flex flex-col gap-3 items-center min-w-[200px] p-2 rounded-lg bg-[#2c2c2c] animate-pulse">
                        <div className="w-full h-[180px] bg-gray-700 rounded-md"></div>{" "}
                        {/* Image Skeleton */}
                        <p className="w-3/4 h-4 bg-gray-600 rounded-md"></p>{" "}
                        {/* Text Skeleton */}
                      </div>
                    ))
                  ) : auctions?.length === 0 ? (
                    <div className="text-center text-2xl font-bold  text-white font-dela-gothic-one  w-full  py-10 flex justify-center items-center">
                      No auctions found
                    </div>
                  ) : (
                    auctions?.map((auction, index) => (
                      <MiniNFTCard
                        key={index}
                        auction={auction}
                        index={index}
                        data={data}
                        setData={setData}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
            {error.tokenId && (
              <p className="text-red text-sm">{error.tokenId}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="form-label-text">Base Price (ETH)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              name="basePrice"
              value={data.basePrice}
              onChange={onChangeHandler}
              className="w-full mx-auto h-[50px] rounded-full bg-[#3c3c3c] lg-text font-bold text-center text-white font-alte-haas-grotesk no-outline px-3"
              placeholder="0.00"
            />
            {error.basePrice && (
              <p className="text-red text-sm">{error.basePrice}</p>
            )}
               </div>

               <div className="flex flex-col gap-2">
            <label className="form-label-text">NFT uri</label>
            <input
              type="text"
              name="nftUri"
              value={data.nftUri}
              onChange={onChangeHandler}
              className="w-full mx-auto h-[50px] rounded-full bg-[#3c3c3c] lg-text font-bold text-center text-white font-alte-haas-grotesk no-outline px-3"
              placeholder="Enter NFT uri"
            />
            {error.nftUri && <p className="text-red text-sm">{error.nftUri}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="form-label-text">Increment Interval (ETH)</label>
            <input
              type="number"
              name="interval"
              value={data.interval}
              onChange={onChangeHandler}
              className="w-full mx-auto h-[50px] rounded-full bg-[#3c3c3c] lg-text font-bold text-center text-white font-alte-haas-grotesk no-outline px-3"
              placeholder="Enter interval"
            />
            {error.tokenId && (
              <p className="text-red text-sm">{error?.interval}</p>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            {/* <div className="flex flex-col gap-2 w-full md:w-1/2">
              <label className="text-white font-alte-haas-grotesk">
                Start Time
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={data.startTime}
                onChange={onChangeHandler}
                className="w-full mx-auto h-[50px] rounded-full bg-[#3c3c3c] lg-text font-bold text-center text-white font-alte-haas-grotesk no-outline px-3"
              />
              {error.startTime && (
                <p className="text-red text-sm">{error.startTime}</p>
              )}
            </div> */}

            <div className="flex flex-col gap-2 w-full">
              <label className="form-label-text">Duration</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    name="days"
                    placeholder="Days"
                    value={data.days || ""}
                    onChange={(e) => {
                      const days = parseInt(e.target.value) || 0;
                      const hours = parseInt(data.hours) || 0;
                      const minutes = parseInt(data.minutes) || 0;
                      const totalSeconds =
                        days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60;
                      setData({
                        ...data,
                        days: e.target.value,
                        endTime: totalSeconds.toString(),
                      });
                    }}
                    className="w-full mx-auto h-[50px] rounded-full bg-[#3c3c3c] lg-text font-bold text-center text-white font-alte-haas-grotesk no-outline px-3"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="23"
                    name="hours"
                    placeholder="Hours"
                    value={data.hours || ""}
                    onChange={(e) => {
                      const days = parseInt(data.days) || 0;
                      const hours = parseInt(e.target.value) || 0;
                      const minutes = parseInt(data.minutes) || 0;
                      const totalSeconds =
                        days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60;
                      setData({
                        ...data,
                        hours: e.target.value,
                        endTime: totalSeconds.toString(),
                      });
                    }}
                    className="w-full mx-auto h-[50px] rounded-full bg-[#3c3c3c] lg-text font-bold text-center text-white font-alte-haas-grotesk no-outline px-3"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    name="minutes"
                    placeholder="Minutes"
                    value={data.minutes || ""}
                    onChange={(e) => {
                      const days = parseInt(data.days) || 0;
                      const hours = parseInt(data.hours) || 0;
                      const minutes = parseInt(e.target.value) || 0;
                      const totalSeconds =
                        days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60;
                      setData({
                        ...data,
                        minutes: e.target.value,
                        endTime: totalSeconds.toString(),
                      });
                    }}
                    className="w-full mx-auto h-[50px] rounded-full bg-[#3c3c3c] lg-text font-bold text-center text-white font-alte-haas-grotesk no-outline px-3"
                  />
                </div>
              </div>
              {error.endTime && (
                <p className="text-red text-sm">{error.endTime}</p>
              )}
            </div>
          </div>
          <ConnectWallet
            component={
              <CommonBtn
                className="wallet-connect-btn"
                text="Create"
                handleClick={handleCreateAuction}
                loading={loading}
              />
            }
            walletButtonClassName="wallet-connect-btn"
          />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default CreateAuctionModal;
