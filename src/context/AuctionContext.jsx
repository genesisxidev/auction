import { createContext, useContext, useEffect, useRef, useState } from "react";

import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";

import { config } from "../config/config";
import abi from "../../blockend/artifacts/contracts/NFTAuctionV3.sol/NFTAuctionV3.json";
import {
  writeContract,
  simulateContract,
  waitForTransactionReceipt,
  readContract,
} from "@wagmi/core";
// import { abi } from "../constant/abi";

import { useAppKit } from "@reown/appkit/react";
import { ethers } from "ethers";
const AuctionContext = createContext();

export const contractAddress = "0x9d269FAC9A9CeEb8C662f6a42099C3b8c90f883A";
export const AuctionProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { address, isConnected, chainId } = useAccount();

  const [isRefetchUpcomingAuctions, setIsRefetchUpcomingAuctions] =
    useState(false);
  const [isEndRefetch, setIsEndRefetch] = useState(false);
  const { open } = useAppKit();
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState([]);
  const [isAnyAuctionLive, setIsAnyAuctionLive] = useState(false);
  const [isAnyAuctionUpcoming, setIsAnyAuctionUpcoming] = useState(false);
  const [isBidPlaced, setIsBidPlaced] = useState(false);
  const isTrueRef = useRef(true);
  const audioPlayedRef = useRef(false);
  const [isRefetchLiveAuction, setIsRefetchLiveAuction] = useState(false);

  const handleConnect = () => {
    open();
  };

  async function sendTransaction(functionName, args, value) {
    try {
      if (args) {
        let req;
        if (value > 0) {
          const { request } = await simulateContract(config, {
            abi: abi.abi,
            address: contractAddress,
            functionName: functionName,
            args: args,
            value: value,
          });
          const hash = await writeContract(config, request);
          await waitForTransactionReceipt(config, { hash });
          return { status: true, signature: hash };
        } else {
          const { request } = await simulateContract(config, {
            abi: abi.abi,
            address: contractAddress,
            functionName: functionName,
            args: args,
          });
          const hash = await writeContract(config, request);
          await waitForTransactionReceipt(config, { hash });
          return { status: true, signature: hash };
        }
      } else {
        if (value > 0) {
          const { request } = await simulateContract(config, {
            abi: abi.abi,
            address: contractAddress,
            functionName: functionName,
            value: value,
          });
          const hash = await writeContract(config, request);
          await waitForTransactionReceipt(config, { hash });
          return { status: true, signature: hash };
        } else {
          const { request } = await simulateContract(config, {
            abi: abi.abi,
            address: contractAddress,
            functionName: functionName,
          });
          const hash = await writeContract(config, request);
          await waitForTransactionReceipt(config, { hash });
          return { status: true, signature: hash };
        }
      }
    } catch (error) {
      return { status: false, signature: null, error: error };
    }
  }

  const readFromContract = async (functionName, args) => {
    try {
      if (args) {
        const result = await readContract(config, {
          abi: abi.abi,
          address: contractAddress,
          functionName: functionName,
          args,
        });

        return result;
      } else {
        const result = await readContract(config, {
          abi: abi.abi,
          address: contractAddress,
          functionName: functionName,
        });
        return result;
      }
    } catch (error) {
      console.log("Error in readContractHelper:", error);
      throw error;
    }
  };
  async function createAuction(tokenId, duration, basePrice, minimumBid) {
    const trx = await sendTransaction("createAuction", [
      tokenId,
      Number(duration),
      parseEther(basePrice.toString()),
      parseEther(minimumBid.toString()),
    ]);

    console.log(trx);

    const { status, signature, error } = trx;
    console.log(status, signature, error);

    return { status, signature, error };
  }
  async function placeBid(tokenId, amount) {
    const trx = await sendTransaction(
      "bid",
      [tokenId],
      parseEther(amount.toString())
    );

    const { status, signature, error } = trx;
    return { status, signature, error };
  }
  async function endAuction(tokenId) {
    const { status, signature, error } = await sendTransaction("endAuction", [
      tokenId,
    ]);
    return { status, signature, error };
  }

  async function cancelAuction(tokenId) {
    const { status, signature, error } = await sendTransaction(
      "cancelAuction",
      [tokenId]
    );
    return { status, signature, error };
  }

  async function getLiveAuctions() {
    const trx = await readFromContract("getLiveAuctions");
    return trx;
  }
  async function checkIfOwner() {
    const data = await readFromContract("owner");

    return data === address;
  }

  const withdraw = async () => {
    const trx = await sendTransaction("withdraw");
    const { status, signature, error, data } = trx;
    return { status, signature, error, data };
  };
  async function getBids(tokenId) {
    const { status, signature, error, data } = await readFromContract(
      "getBids",
      [tokenId]
    );
    return { status, signature, error, data };
  }

  async function getUpcomingAuctions() {
    const data = await readFromContract("getUpcomingAuctions");

    return data;
  }
  async function getEndedAuctions() {
    const data = await readFromContract("getEndedAuctions");

    return data;
  }
  async function getTokenURI(tokenId) {
    const data = await readFromContract("tokenURI", [tokenId]);
    return data;
  }
  async function getBaseURI() {
    const data = await readFromContract("baseURI");
    return data;
  }
  async function getAuctionFromTokenId(tokenId) {
    const data = await readFromContract("getAuctionForTokenId", [tokenId]);
    // console.log("data", data);
    return data;
  }

  useEffect(() => {
    if (isConnected || address) {
      checkIfOwner().then((res) => {
        setIsAdmin(res);
      });
    } else {
      setIsAdmin(false);
    }
  }, [address, isConnected]);

  useEffect(() => {
    getUpcomingAuctions().then((res) => {
      setUpcomingAuctions(res);
    });
  }, [isRefetchUpcomingAuctions]);

  const checkIfAnyAuctionLive = async () => {
    const data = await getLiveAuctions();
    const filteredData = data.filter((item) => Number(item.tokenId) >= 1);
    setIsAnyAuctionLive(filteredData.length > 0);
  };

  const checkIfAnyAuctionUpcoming = async () => {
    const data = await getUpcomingAuctions();

    setIsAnyAuctionUpcoming(data.length > 0);
  };

  useEffect(() => {
    checkIfAnyAuctionLive();
    checkIfAnyAuctionUpcoming();
  }, [isRefetchUpcomingAuctions]);

  return (
    <AuctionContext.Provider
      value={{
        createAuction,
        placeBid,
        endAuction,
        getLiveAuctions,
        getUpcomingAuctions,
        getEndedAuctions,
        getTokenURI,
        getBaseURI,
        checkIfOwner,
        withdraw,
        getBids,
        handleConnect,
        isAdmin,
        liveAuctions,
        setLiveAuctions,
        upcomingAuctions,
        getAuctionFromTokenId,
        isRefetchUpcomingAuctions,
        setIsRefetchUpcomingAuctions,
        isEndRefetch,
        setIsEndRefetch,
        isAnyAuctionLive,
        setIsAnyAuctionLive,
        isAnyAuctionUpcoming,
        setIsAnyAuctionUpcoming,
        isBidPlaced,
        setIsBidPlaced,
        audioPlayedRef,
        isTrueRef,
        isRefetchLiveAuction,
        setIsRefetchLiveAuction,
        cancelAuction,
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
};

const useAuction = () => {
  return useContext(AuctionContext);
};

export default useAuction;
