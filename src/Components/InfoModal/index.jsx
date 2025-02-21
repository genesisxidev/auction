import React, { useState } from "react";
import ModalWrapper from "../ModalWrapper/Wrapper";

const InfoModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);


  React.useEffect(() => {
    const isVisited = localStorage.getItem('isModalVisited');
    if (isVisited) {
      setIsModalOpen(false);
    }   
    else{
      setIsModalOpen(true);
    }
  }, []);

  const handleCloseModal = () => {
    localStorage.setItem('isModalVisited', 'true');
    setIsModalOpen(false);
  };
  return (
    <>
      {isModalOpen && (
        <ModalWrapper className="max-w-[44.5625rem] ">
          <div className="text-white p-6 font-montserrat">
            <button
              className="absolute top-6 right-6 text-white text-xl font-bold hover:opacity-75"
              onClick={handleCloseModal}
            >
              X
            </button>
            <h2 className="lg:text-2xl md:text-xl text-lg font-bold mb-4 ">
              Auction Guide
            </h2>

            <ul className="list-disc ml-6 space-y-2">
              <li>
                <span className="font-semibold">Connect your wallet.</span>
              </li>
              <li>
                <span className="font-semibold">
                  Click "Live Auctions" to view active auctions.
                </span>
              </li>
              <li>Once the base price is met, the countdown starts.</li>
              <li>
                When time runs out, the piece is automatically sent to the
                wallet of the highest bidder.
              </li>
            </ul>

            <div className="mt-6">
              <h3 className="xl-text bold flex items-center">
                <span className="mr-2" role="img" aria-label="bell">
                  🔔
                </span>
                Stay Alert
              </h3>
              <p className="mt-2">
                A bell will sound when a new bid is placed on an auction you're
                viewing.
              </p>
            </div>

            <div className="mt-6">
              <h3 className="xl-text bold flex items-center">
                <span className="mr-2" role="img" aria-label="warning">
                  ⚠️
                </span>
                Important Notes
              </h3>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>
                  If you're outbid, your funds are automatically returned and a
                  new highest bidder is set.
                </li>
                <li>
                  Last-minute transactions may go through, but could be reverted
                  if rejected by the contract.
                </li>
              </ul>
            </div>

            <div className="mt-6">
              <h3 className="xl-text bold">Disclaimer</h3>
              <p className="sm-text mt-2">
                All bids are final. We are not responsible for failed
                transactions, network congestion, gas fees, or external wallet
                issues. Participation in auctions is at your own risk.
              </p>
              <p className="sm-text mt-2">
                By interacting with this auction, you acknowledge the risks of
                blockchain transactions. Always verify contract addresses and
                ensure your wallet is secure. We will never ask for your private
                keys. We do not guarantee uninterrupted access to auctions and
                reserve the right to modify, pause, or cancel auctions at any
                time due to security concerns, system errors, or compliance
                requirements. Users are responsible for ensuring their
                participation complies with local laws and regulations regarding
                digital assets and auctions. We are not liable for any legal
                consequences arising from user participation.
              </p>
            </div>
          </div>
        </ModalWrapper>
      )}
    </>
  );
};

export default InfoModal;
