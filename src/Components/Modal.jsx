import React, { useEffect, useState } from "react";
import ModalWrapper from "./ModalWrapper/Wrapper";
import useAuction from "../context/AuctionContext";
import { useParams } from "react-router-dom";
import ConnectWallet from "./connectWalletComp/connectWallet";
import Spinner from "./loader";
import CommonBtn from "./Button/CommonBtn";
import { isNotEmptyString } from "../helpers/helper";
import { toast } from "react-toastify";
import { formatEther } from "viem";

const Modal = ({ closeModal, setIsModalOpen, setIsRefetch, auction }) => {
  const { id } = useParams();

  const [bidAmount, setBidAmount] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { placeBid, setIsBidPlaced, audioPlayedRef, isTrueRef } = useAuction();

  const handlePlaceBid = async () => {
    if (!isNotEmptyString(bidAmount)) {
      setError("Please enter a amount");
      return;
    }
    setLoading(true);
    const trx = await placeBid(id, bidAmount);

    if (trx?.status === false) {
      toast.error("Bid failed");
      setLoading(false);
      return;
    } else {
      toast.success("Bid placed successfully");
      setLoading(false);
      setIsModalOpen(false);
      // audioPlayedRef.current = false;
      // isTrueRef.current = true;
      setIsRefetch((prev) => !prev);
      setIsBidPlaced((prev) => !prev);
    }
  };
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const onChangeHandler = (e) => {
    setBidAmount(e.target.value);
    setError(null);
  };

  return (
    <ModalWrapper
      className="max-w-[53.5625rem]"
      setIsModalOpen={setIsModalOpen}
    >
      <div className="p-[21px] pb-[42px]">
        <div className="modal-header relative text-white">
          <p class="lg-text text-center text-white font-alte-haas-grotesk">
            Enter Bid Amount
          </p>
          <button
            className="absolute top-0 right-0 xl-text font-bold font-alte-haas-grotesk"
            onClick={closeModal}
          >
            X
          </button>
        </div>
        <div className="modal-body">
          <p className="xl-text font-extralight text-center text-white font-alte-haas-grotesk ">
            <span>Place a Bid of</span>
            <span className="text-[#45dd37]">
              {" "}
              {auction?.bids?.length > 0
                ? formatEther((Number(auction?.bids?.reduce((max, bid) => Number(bid.amount) > Number(max.amount) ? bid : max, auction?.bids[0])?.amount) + 
                   Number(auction?.minimumBidIncrement)))
                : formatEther(auction?.basePrice?.toString() || 0)}{" "}
              eth
            </span>
            <span> or Higher</span>
          </p>
          <input
            className="lg:w-[398px] md:w-[300px] sm:w-[250px] w-[200px] mx-auto md:h-[34px] h-[28px] rounded-[35px] bg-[#3c3c3c] lg-text font-bold text-center text-white font-alte-haas-grotesk no-outline px-3"
            placeholder="3.0"
            onChange={onChangeHandler}
            value={bidAmount}
            type="number"
          />
          {error && <p className="text-red text-center">{error}</p>}
        </div>
        <div className="pt-[23px] ">
          <ConnectWallet
            component={
              <CommonBtn
                className="place-bid-btn"
                text="Place Bid"
                handleClick={handlePlaceBid}
                loading={loading}
              />
            }
            walletButtonClassName="place-bid-btn"
          />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default Modal;
