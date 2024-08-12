require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const GNOSIS_RPC_URL = process.env.GNOSIS_RPC_URL || "https://rpc.gnosischain.com";
const CHIADO_RPC_URL = "https://rpc.chiadochain.net"; 
const PRIVATE_KEY = process.env.PRIVATE_KEY || "1dcde38260327d5f54f83a1678b54641d3339b2ba6869cbac906c701dec2bdd6";

const formatPrivateKey = (key) => {
  if (key.startsWith("0x")) {
    return key.slice(2);
  }
  return key;
};

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
      },
      {
        version: "0.8.20",
      },
    ],
  },
  networks: {
    gnosis: {
      url: GNOSIS_RPC_URL,
      accounts: PRIVATE_KEY ? [formatPrivateKey(PRIVATE_KEY)] : [],
      chainId: 100,
    },
    chiado: {
      url: CHIADO_RPC_URL,
      accounts: PRIVATE_KEY ? [formatPrivateKey(PRIVATE_KEY)] : [],
      chainId: 10200,
    },
  },
  etherscan: {
    apiKey: {
      gnosis: "NOT_NEEDED",
      chiado: "NOT_NEEDED"
    },
    customChains: [
      {
        network: "chiado",
        chainId: 10200,
        urls: {
          apiURL: "https://gnosis-chiado.blockscout.com/api",
          browserURL: "https://gnosis-chiado.blockscout.com"
        }
      }
    ]
  },
};

