import React from "react";
import ModalWrapper from "../ModalWrapper/Wrapper";
import { formatAddress } from "../../helpers/helper";
import { formatEther } from "viem";

const TopBidModal = ({ setIsModalOpen, bids, maxBidAmount }) => {
  const closeModal = () => {
    setIsModalOpen(false);
  };
  return (
    <ModalWrapper className="max-w-[550px]" setIsModalOpen={setIsModalOpen}>
      <div className="p-[21px] pb-[42px]">
        <div className="modal-header relative text-white">
          <h2 className="lg-text font-dela-gothic-one tracking-wide">
            TOP BIDS
          </h2>
          <button
            className="absolute top-0 right-0 xl-text font-bold font-alte-haas-grotesk"
            onClick={closeModal}
          >
            X
          </button>
        </div>
        <div className="lg:pt-4 md:pt-3 pt-2 f-col gap-[0.5625rem]">
          <div className="f-col gap-[3px] sm-text uppercase font-alte-haas-grotesk ">
            {bids?.length < 1 ? (
              <span className="base-text text-red">No bids yet</span>
            ) : (
              bids
                ?.slice(0)
                ?.reverse()
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
                          ? "text-green"
                          : "text-red"
                      }
                    >
                      {formatEther(Number(item?.amount))} ETH
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default TopBidModal;
