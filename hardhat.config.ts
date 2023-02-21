import dotenv from 'dotenv'
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const RPC_OPAL = "https://rpc-opal.unique.network";
const PRIVATE_KEY = "49ae9d8b85b74ac98d62464c27342f68980a2068b78785399f85efef8595ddb5";


const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      metadata: {
        // Not including the metadata hash
        // https://github.com/paulrberg/solidity-template/issues/31
        bytecodeHash: "none",
      },
      optimizer: {
        enabled: true,
        runs: 800,
      },
      viaIR : true,
    },
  },
  networks: {
    opal: {
      url: RPC_OPAL,
      accounts: [`${PRIVATE_KEY}`]
    },
  }
};

export default config;
