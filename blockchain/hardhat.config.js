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
      accounts: [process.env.DEPLOYER_PRIVATE_KEY || "0x6daeded7b1dc171b2a6cd563337abbbfc87fa423db68a3e9277a1a2d4b458ec6"],
    },
    // Ganache CLI / Hardhat node — port 8545
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
};
