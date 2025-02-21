import { useEffect } from "react";
import notificationSound from "../assets/audio/auction_noise.mp3";
import { ethers, formatEther } from "ethers";
import useAuction, { contractAddress } from "../context/AuctionContext";
import abi from "../../blockend/artifacts/contracts/NFTAuctionV3.sol/NFTAuctionV3.json";
import { toast } from "react-toastify";
import { formatAddress } from "../helpers/helper";
const provider = new ethers.JsonRpcProvider(
  "https://rpc.testnet.fantom.network"
);
export const useBidPlacedListener = (
  event,
  isLiveListener = false,
  id = null
) => {
  const { setIsRefetchLiveAuction } = useAuction();
  useEffect(() => {
    const contract = new ethers.Contract(contractAddress, abi.abi, provider);

    const handleBidPlaced = (tokenId, bidder, amount) => {
      console.log("tokenId", tokenId);
      console.log("bidder", bidder);
      console.log("amount", amount);
      // Play sound for every bid
      if (isLiveListener) {
        const audio = new Audio(notificationSound);
        audio
          .play()
          .catch((error) => console.error("Audio play error:", error));
        setIsRefetchLiveAuction((prev) => !prev);
        toast.success(`New Auction Live Now`);
      } else {
        if (Number(tokenId) === Number(id)) {
          const audio = new Audio(notificationSound);
          audio
            .play()
            .catch((error) => console.error("Audio play error:", error));

          // Show toast notification for every bid
          toast.success(
            `New bid placed: ${formatEther(amount)} ETH by ${formatAddress(
              bidder
            )}`
          );
        }
      }
    };

    // Add event listener
    contract.on(event, handleBidPlaced);

    // Cleanup function
    return () => {
      contract.off(event, handleBidPlaced);
    };
  }, []);
};
