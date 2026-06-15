import "@nomicfoundation/hardhat-toolbox";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: "0.8.20",
  networks: {
    // Ganache Desktop — default port 7545
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      // Fallback to known Ganache Desktop key — local testnet only, never use a real key here
      accounts: [process.env.DEPLOYER_PRIVATE_KEY || "0x17097324b321f5ee780b70a8e3cae14b663d8263414216bdb879708cbbc1193c"],
    },
    // Ganache CLI / Hardhat node — port 8545
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
};
