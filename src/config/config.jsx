import { createAppKit } from "@reown/appkit/react";

import { WagmiProvider } from "wagmi";
import { mainnet } from "@reown/appkit/networks";

import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

// 1. Get projectId from https://cloud.reown.com
export const projectId = "e9f34e2d173bc2c9f8381920f2279055";

// 2. Create a metadata object - optional
const metadata = {
  name: "Auction NFTs",
  description: "Auction NFTs",
  url: "https://reown.com/appkit", // origin must match your domain & subdomain
  icons: ["https://assets.reown.com/reown-profile-pic.png"],
};

// 3. Set the networks
const networks = [mainnet];

// 4. Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});

export const config = wagmiAdapter.wagmiConfig


