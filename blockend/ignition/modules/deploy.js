// scripts/deploy.js

const { ethers } = require('hardhat');

async function main() {
  // Use the deployed ERC20 token address

  console.log('Deploying the NFTAuction contract...');
  const baseUri = 'https://ipfs.io/';
  const nftName = 'NFT Auction';
  const nftSymbol = 'NFTA';
  const dumpWallet = '0x382FAaF2dC48132EC2e0c824105FdF4Bdb17e20a';
  // Get the contract factory
  const NFTAuction = await ethers.getContractFactory('NFTAuctionV4');
  // Deploy the contract
  const nftAuction = await NFTAuction.deploy(
    baseUri,
    nftName,
    nftSymbol,
    dumpWallet
  );
  await nftAuction.ownerMint(2);

  console.log('NFTAuctionV3 deployed to:', nftAuction.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
