import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../../Layout/Layout";
import Modal from "../../Components/Modal";
import auctionImage from "../../assets/27-new-1.png";
import useScrolltoTop from "../../hook/useScrolltoTop";
import { useParams } from "react-router-dom";
import useAuction, { contractAddress } from "../../context/AuctionContext";
import { formatEther } from "viem";
import axios from "axios";
import AuctionDetailsSkeleton from "../../Components/SkeletonLoading/AuctionDetailsSkeleton";
import { formatAddress } from "../../helpers/helper";
import Timer from "../../Components/Timer/Timer";
import { watchContractEvent } from "@wagmi/core";
import { config } from "../../config/config";
import abi from "../../../blockend/artifacts/contracts/NFTAuctionV4.sol/NFTAuctionV4.json";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import notificationSound from "../../assets/audio/auction_noise.mp3";
import ConnectWallet from "../../Components/connectWalletComp/connectWallet";
import Spinner from "../../Components/loader";
import TopBidModal from "../../Components/TopBidModal/TopBidModal";
import copy from "../../assets/copy.png";
import { useBidPlacedListener } from "../../hook/useBidPlacedListener";

// import { abi } from "./abi";
// import { config } from "./config";

const AuctionDetail = () => {
  useScrolltoTop();

  const { id } = useParams();
  const {
    getAuctionFromTokenId,
    audioPlayedRef,
    isTrueRef,
    isAdmin,
    cancelAuction,
  } = useAuction();
  const [isRefetch, setIsRefetch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelLoading, setIsCancelLoading] = useState(false);
  const [isImgLoading, setIsImgLoading] = useState(true);
  const [auction, setAuction] = useState(null);
  const [showAllBids, setShowAllBids] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useBidPlacedListener("BidPlaced", false, id);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const auction = await getAuctionFromTokenId(id);

        // const tokenURI = await getTokenURI([id]);
        // console.log("tokenURI", tokenURI);

        const data = await axios.get(
          auction?.tokenURI?.replace("ipfs/", "https://ipfs.io/ipfs/")
        );

        setAuction({ ...data?.data, ...auction });
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAuction();
  }, [id, isRefetch]);

  const handleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleImageLoad = () => {
    setIsImgLoading(false); // Set loading to false when image loads
  };

  const maxBidAmount = useMemo(() => {
    return auction?.bids?.reduce((max, current) => {
      return current.amount > max.amount ? current : max;
    }, auction?.bids[0])?.amount;
  }, [auction]);

  const handleCancelAuction = async () => {
    setIsCancelLoading(true);
    const trx = await cancelAuction(id);

    if (trx?.status === false) {
      toast.error("Auction cancel failed");
      setIsCancelLoading(false);
      return;
    } else {
      toast.success("Auction cancelled successfully");
      setIsCancelLoading(false);
      setIsRefetch((prev) => !prev);
    }
  };
  const copyToClipboard = (text) => {
    if (text) {
      navigator.clipboard
        .writeText(text)
        .then(() => {})
        .catch((err) => {
          console.error("Failed to copy address: ", err);
        });
    }
  };
  // console.log("auction", auction);

  return (
    <>
      {isLoading ? (
        <AuctionDetailsSkeleton />
      ) : (
        <div className="py-[150px]">
          <div className="page-container  ">
            <div className="element z-[-1] absolute top-0 left-0 w-full h-full"></div>
            <div className="container">
              <div className="grid md:grid-cols-2 grid-cols-1 xl:gap-[117px] lg:gap-[80px] gap-[40px]">
                <div className="w-full flex lg:justify-end justify-center">
                  <div
                    className="rounded-[5px] bg-[#323232] max-w-[30.25rem] w-full lg:h-[30.25rem] md:h-[25rem] h-[20rem] lg:p-10 md:p-7 p-4"
                    style={{
                      boxShadow:
                        "0px 4px 11.399999618530273px 0 rgba(0,0,0,0.69)",
                    }}
                  >
                    <picture className="relative block w-full h-full">
                      {isImgLoading && ( // Show loading effect while loading
                        <div className="skeleton-loader w-full h-full absolute top-0 left-0"></div> // Skeleton loader
                      )}
                      <source
                        srcSet={auction?.image?.replace(
                          "ipfs://",
                          "https://ipfs.io/ipfs/"
                        )}
                        type="image/webp"
                      />
                      <source
                        srcSet={auction?.image?.replace(
                          "ipfs://",
                          "https://ipfs.io/ipfs/"
                        )}
                        type="image/png"
                      />
                      <img
                        loading="lazy"
                        src={auction?.image?.replace(
                          "ipfs://",
                          "https://ipfs.io/ipfs/"
                        )}
                        data-src={auction?.image?.replace(
                          "ipfs://",
                          "https://ipfs.io/ipfs/"
                        )}
                        alt="user-img"
                        onLoad={handleImageLoad}
                        className="w-full h-full object-cover  "
                      />
                    </picture>
                    {/* <img src={auctionImage} alt="user-img" className=" " /> */}
                  </div>
                </div>

                <div className="flex flex-col text-white md:pt-1 pt-0 lg:pr-[18px] pr-0 md:px-0 px-3 ">
                  <div>
                    <h1 className="lg:text-[3.25rem] md:text-[2.5rem] text-[2rem] md:text-start text-center leading-none uppercase font-dela-gothic-one">
                      {auction?.name?.split("#")[0]}
                    </h1>
                  </div>

                  <div className="f-col sm-text bold font-alte-haas-grotesk lg:gap-4 md:gap-3 gap-2 lg:pt-[21px] md:pt-[18px] pt-[15px]">
                    <p className="uppercase  ">
                      TOKEN ID #{auction?.name?.split("#")[1]}
                    </p>
                    <p>{auction?.description}</p>
                  </div>

                  <div className="lg:pt-9 md:pt-8 pt-7 flex md:flex-row flex-col md:justify-between items-start  gap-[0.5625rem]">
                    <div className="f-col gap-[0.5625rem]">
                      <h2 className="lg-text font-dela-gothic-one tracking-wide">
                        TOP BIDS
                      </h2>
                      <div className="f-col gap-[3px] sm-text uppercase font-alte-haas-grotesk ">
                        {/* <div className="center-items gap-12">
                        <span className="text-white">0x129234873249823</span>
                        <span className="text-green">2.4 ETH</span>
                      </div>
                      <div className="center-items gap-12">
                        <span className="text-white">0x129234873249823</span>
                        <span className="text-red">1.8 ETH</span>
                      </div> */}
                        {auction?.bids?.length < 1 ? (
                          <span className="base-text text-red">
                            No bids yet
                          </span>
                        ) : (
                          <>
                            {auction?.bids
                              ?.sort(
                                (a, b) => Number(b.amount) - Number(a.amount)
                              )
                              ?.slice(0, 5)
                              ?.map((item, index) => (
                                <div
                                  className="center-items lg:gap-12 md:gap-10 gap-8"
                                  key={index}
                                >
                                  <span className="text-white">
                                    {formatAddress(item?.bidder)}
                                  </span>
                                  <span
                                    className={
                                      item?.amount === maxBidAmount
                                        ? "text-green font-dela-gothic-one"
                                        : "text-red"
                                    }
                                  >
                                    {formatEther(Number(item?.amount))} ETH
                                  </span>
                                </div>
                              ))}
                            {auction?.bids?.length > 5 && (
                              <button
                                onClick={() => setShowAllBids(true)}
                                className="mt-2 text-green hover:text-green/80 transition-colors"
                              >
                                Show All Bids
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    {(auction?.status === 2 || auction?.status === 3) && (
                      <div>
                        <div className="f-col gap-[0.5625rem]">
                          <h2 className="lg-text font-dela-gothic-one tracking-wide capitalize">
                            End PRICE
                          </h2>
                          <p className="base-text bold text-white leading-tight font-alte-haas-grotesk">
                            {formatEther(auction?.highestBid || 0n)} ETH
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {(auction?.status === 2 || auction?.status === 3) && (
                    <div className="lg:pt-9 md:pt-8 pt-7 flex md:flex-row flex-col md:justify-between md:items-center  gap-[0.5625rem]">
                      <div className="f-col gap-[0.5625rem]">
                        <h2 className="lg-text font-dela-gothic-one tracking-wide capitalize">
                          highest bidder
                        </h2>
                        <div className="base-text text-white leading-tight font-alte-haas-grotesk  tracking-widest flex items-center">
                          <p>{formatAddress(auction?.highestBidder)}</p>
                          <button
                            onClick={() =>
                              copyToClipboard(auction?.highestBidder)
                            }
                            className="ml-2 text-blue-500 hover:opacity-75 focus:outline-none"
                            aria-label="Copy Address"
                          >
                            <img
                              src={copy}
                              alt="copy"
                              className="lg:w-5 lg:h-5 w-4 h-4"
                            />
                          </button>
                        </div>
                      </div>
                      <div className="f-col gap-[0.5625rem]">
                        <h2 className="lg-text font-dela-gothic-one tracking-wide capitalize">
                          previous bider
                        </h2>

                        <div className="base-text  text-white leading-tight font-alte-haas-grotesk tracking-widest flex items-center">
                          <p> {formatAddress(auction?.previousBidder)}</p>
                          <button
                            onClick={() =>
                              copyToClipboard(auction?.previousBidder)
                            }
                            className="ml-2 text-blue-500 hover:opacity-75 focus:outline-none"
                            aria-label="Copy Address"
                          >
                            <img
                              src={copy}
                              alt="copy"
                              className="lg:w-5 lg:h-5 w-4 h-4"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="f-col lg:pt-[26px] md:pt-[24px] pt-[20px]">
                    <div className="flex md:flex-row flex-col  items-start lg:gap-14 md:gap-10 gap-5">
                      <div className="f-col  items-start gap-1 ">
                        <h3 className="text-white lg-text font-dela-gothic-one text-nowrap uppercase">
                          Base Price
                        </h3>
                        <p className="base-text bold text-white leading-tight font-alte-haas-grotesk">
                          {formatEther(auction?.basePrice || 0n)} ETH
                        </p>
                      </div>
                      {Number(auction?.startTime) > 0 &&
                        Number(auction?.status) === 1 && (
                          <div className="w-full">
                            <div className="text-white lg-text font-dela-gothic-one text-center">
                              <Timer
                                timmer={Number(
                                  Number(auction?.startTime) +
                                    Number(auction?.duration)
                                )}
                              />
                            </div>
                          </div>
                        )}

                      {Number(auction?.status) === 4 && (
                        <div className="text-red text-center lg-text font-dela-gothic-one uppercase">
                          cancelled
                        </div>
                      )}

                      {Number(auction?.status) === 2 && (
                        <div className="text-red text-center lg-text font-dela-gothic-one uppercase">
                          sold
                        </div>
                      )}
                      {Number(auction?.status) === 3 && (
                        <div className="text-green text-center lg-text font-dela-gothic-one uppercase">
                          completed
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="lg:pt-[35px] md:pt-[30px] pt-[25px] max-w-[472px] w-full flex justify-between items-center">
                    {(Number(auction?.status) === 1 ||
                      Number(auction?.status) === 0) && (
                      <ConnectWallet
                        component={
                          <button
                            className="btn uppercase bg-dark-green hover:bg-green/80"
                            onClick={handleModal}
                          >
                            PLACE BID
                          </button>
                        }
                        walletButtonClassName="btn bg-dark-green hover:bg-green/80 uppercase"
                      />
                    )}

                    {Number(auction?.status) !== 4 && isAdmin && (
                      <button
                        className="md:max-w-[200px] md:w-full flex items-center justify-center text-black lg-text bold lg:rounded-[5px] md:rounded-[4px] rounded-[3px] font-alte-haas-grotesk  outline-none border-none bg-[#E7D514] hover:bg-[#E7D514]/[0.80] transition-colors duration-200 capitalize px-4 py-2 h-full"
                        onClick={handleCancelAuction}
                      >
                        {isCancelLoading ? <Spinner /> : "cancel auction"}
                      </button>
                    )}
                  </div>
                  {/* <div className="pt-[22px]">
                    <p class="lg-text text-left text-[#f60a0a]">
                      **Place error messages here
                    </p>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isModalOpen && (
        <Modal
          closeModal={handleModal}
          setIsModalOpen={setIsModalOpen}
          setIsRefetch={setIsRefetch}
          auction={auction}
        />
      )}
      {showAllBids && (
        <TopBidModal
          setIsModalOpen={setShowAllBids}
          bids={auction?.bids}
          maxBidAmount={maxBidAmount}
        />
      )}
    </>
  );
};

export default AuctionDetail;
