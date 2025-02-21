require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    ftm: {
      url: "https://rpc.testnet.fantom.network",
      accounts: ["79e4237247e2c147d50578e614bcceea1fb9195f130be6d92493f06f7c373ba8"],
    },
  },
};
