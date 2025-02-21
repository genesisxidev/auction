import React from "react";
import useAuction from "../../context/AuctionContext";
import { useAccount } from "wagmi";

const ConnectWallet = ({ component, walletButtonClassName }) => {
  const { handleConnect } = useAuction();
  const { isConnected } = useAccount();
  return isConnected ? (
    component
  ) : (
    <button onClick={handleConnect} className={walletButtonClassName}>  
      connect
    </button>
  );
};

export default ConnectWallet;
