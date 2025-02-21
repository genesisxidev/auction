import React, { useState } from "react";

import CreateAuctionModal from "../../Components/admin/createAuction";
import EndAuctionModal from "../../Components/admin/endAuction";
import useAuction from "../../context/AuctionContext";
import { useAccount } from "wagmi";
import { toast } from "react-toastify";
import Spinner from "../../Components/loader";

const CreateAuction = () => {
  const { withdraw, handleConnect } = useAuction();
  const { isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    create: false,
    endAuction: false,
    withdraw: false,
  });
  const handleModal = (modal) => {
    setModal((prev) => ({ ...prev, [modal]: !prev[modal] }));
  };
  const closeModal = () => {
    setModal({
      create: false,
      endAuction: false,
      withdraw: false,
    });
  };
  const handleWithdraw = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }
    setLoading(true);
    const trx = await withdraw();
    if (trx.status === false) {
      toast.error("Withdrawal failed");
      setLoading(false);
      return;
    } else {
      toast.success("Withdrawal successful");
      setLoading(false);
    }
  };
  
  return (
    <>
      <div className="py-[150px]">
        <div className="page-container">
          <div className="element z-[-1] absolute top-0 left-0 w-full h-full"></div>
          <div className="container">
            <div className="flex flex-col items-center justify-center gap-8 h-full font-dela-gothic-one">
              <button
                className="max-w-[500px] w-full   h-[60px] bg-dark-green hover:bg-green text-white font-bold rounded-lg transition-colors duration-200 uppercase tracking-wider"
                onClick={() => handleModal("create")}
              >
                Create Auction
              </button>

              <button
                className="max-w-[500px] w-full   h-[60px] bg-[#E7D514] hover:bg-[#E7D514]/[0.80] text-black font-bold rounded-lg transition-colors duration-200 uppercase tracking-wider"
                onClick={() => handleModal("endAuction")}
              >
                End Auction
              </button>

              <button
                className="max-w-[500px] w-full   h-[60px] bg-[#f60a0a] hover:bg-[#f60a0a]/[0.80] text-white font-bold rounded-lg transition-colors duration-200 uppercase tracking-wider flex-center"
                onClick={handleWithdraw}
                disabled={loading}
              >
                {loading ? <Spinner /> : "Withdraw"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {modal.create && <CreateAuctionModal setModal={setModal} />}
      {modal.endAuction && <EndAuctionModal setModal={setModal} />}
    </>
  );
};

export default CreateAuction;
