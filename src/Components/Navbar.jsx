import { useAppKit } from "@reown/appkit/react";
import React from "react";
import { useAccount } from "wagmi";
const Navbar = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const handleOpen = () => {
    alert("open");
    // open();
  };
  return (
    <div className="bg-[#141a19]">
      <header className="flex justify-between items-center px-6 py-4">
        <h1 className="text-green-500 text-lg font-bold">Auction Live Now</h1>
        <div className="text-center">
          <p className="text-sm text-white">Next Auction</p>
          <p className="text-lg font-bold text-white ">OD:OOH:OM:OS</p>
        </div>
        <nav className="flex space-x-3 uppercase">
          <button className="text-white  px-4 py-2 rounded">HOME</button>
          {isConnected ? (
            <button
              className="text-white  px-4 py-2 rounded"
                onClick={handleOpen}
            >
              disconnect
            </button>
          ) : (
            <button
              type="button"
              className="text-white  px-4 py-2 rounded"
                onClick={handleOpen}
            >
              CONNECT
            </button>
          )}
        </nav>
      </header>
    </div>
  );
};

export default Navbar;
