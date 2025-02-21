import React, { useEffect, useState } from "react";
import ModalWrapper from "../../ModalWrapper/Wrapper";
import useAuction from "../../../context/AuctionContext";
import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";
import { toast } from "react-toastify";
import Spinner from "../../loader";
import ConnectWallet from "../../connectWalletComp/connectWallet";
import CommonBtn from "../../Button/CommonBtn";
import MiniNFTCard from "../../mini-card/MiniNFTCard";
import axios from "axios";

const EndAuctionModal = ({ setModal }) => {
  const {
    endAuction,
    setIsRefetchUpcomingAuctions,
    getLiveAuctions,
    getTokenURI,

    setIsEndRefetch,
  } = useAuction();
  const [isAuctionLoading, setIsAuctionLoading] = useState(true);
  const [auctions, setAuctions] = useState([]);

  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    tokenId: "",
  });

  useEffect(() => {
    const fetchLiveAuctions = async () => {
      setIsAuctionLoading(true);
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

        setAuctions(auctionData.filter(Boolean));
      } catch (error) {
        console.error("Error fetching live auctions:", error);
      } finally {
        setIsAuctionLoading(false);
      }
    };

    fetchLiveAuctions();
  }, []);

  const handleEndAuction = async () => {
    if (!data.tokenId) {
      setError("Token ID is required");
      return;
    }
    setLoading(true);
    const trx = await endAuction(data.tokenId);
    if (!trx.status) {
      toast.error("Something went wrong");
      setLoading(false);
      return;
    } else {
      toast.success("Auction ended successfully");
      setLoading(false);
      setIsRefetchUpcomingAuctions((prev) => !prev);
      setIsEndRefetch((prev) => !prev);
      setModal(false);
    }
  };

  const onChangeHandler = (e) => {
    setData({ ...data, tokenId: e.target.value });
    setError(null);
  };

  const closeModal = () => {
    setModal(false);
  };
  return (
    <ModalWrapper className="max-w-[53.5625rem]" setIsModalOpen={setModal}>
      <div className="p-[21px] pb-[42px]">
        <div className="modal-header relative text-white">
          <p className="lg-text text-center text-white font-alte-haas-grotesk">
            End Auction
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
            {/* <label className="text-white font-alte-haas-grotesk">
              Token ID
            </label>
            <input
              type="number"
              value={data.tokenId}
              onChange={onChangeHandler}
              className="w-full mx-auto h-[50px] rounded-full bg-[#3c3c3c] lg-text font-bold text-center text-white font-alte-haas-grotesk no-outline px-3"
              placeholder="Enter token ID"
            /> */}
            <div className="relative">
              <label className="form-label-text mb-2 block">Select NFT</label>
              <div className="overflow-x-auto bg-transparent">
                <div className="flex gap-4 pb-4">
                  {isAuctionLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <div className="flex flex-col gap-3 items-center min-w-[200px] p-2 rounded-lg bg-[#2c2c2c] animate-pulse">
                        <div className="w-full h-[180px] bg-gray-700 rounded-md"></div>
                        <p className="w-3/4 h-4 bg-gray-600 rounded-md"></p>
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
            {error && <p className="text-red text-sm">{error}</p>}
          </div>

          <ConnectWallet
            component={
              <CommonBtn
                className="wallet-connect-btn"
                text="End Auction"
                handleClick={handleEndAuction}
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

export default EndAuctionModal;
