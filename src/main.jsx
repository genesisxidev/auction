import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuctionProvider } from "./context/AuctionContext.jsx";
import { WagmiProvider } from "wagmi";
import { ToastContainer } from "react-toastify";
import { wagmiAdapter } from "./config/config.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <AuctionProvider>
        <ToastContainer />
        <App />
      </AuctionProvider>
    </WagmiProvider>
  </StrictMode>
);
