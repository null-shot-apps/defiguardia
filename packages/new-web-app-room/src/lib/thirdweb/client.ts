import { createThirdwebClient, defineChain } from "thirdweb";

// Create the Thirdweb client
export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
});

// Define supported chains for DeFiGuard AI
export const baseSepolia = defineChain({
  id: 84532,
  name: "Base Sepolia",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpc: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://sepolia.base.org",
  blockExplorers: [
    {
      name: "BaseScan",
      url: "https://sepolia.basescan.org",
    },
  ],
  testnet: true,
});

export const arbitrumSepolia = defineChain({
  id: 421614,
  name: "Arbitrum Sepolia",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpc: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC || "https://sepolia-rollup.arbitrum.io/rpc",
  blockExplorers: [
    {
      name: "Arbiscan",
      url: "https://sepolia.arbiscan.io",
    },
  ],
  testnet: true,
});

export const ethereumSepolia = defineChain({
  id: 11155111,
  name: "Ethereum Sepolia",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpc: process.env.NEXT_PUBLIC_ETHEREUM_SEPOLIA_RPC || "https://ethereum-sepolia.publicnode.com",
  blockExplorers: [
    {
      name: "Etherscan",
      url: "https://sepolia.etherscan.io",
    },
  ],
  testnet: true,
});

// Supported chains array
export const supportedChains = [baseSepolia, arbitrumSepolia, ethereumSepolia];

// Chain configurations for easy access
export const chainConfigs = {
  baseSepolia: {
    chain: baseSepolia,
    name: "Base Sepolia",
    icon: "🔵",
    color: "#0052FF",
  },
  arbitrumSepolia: {
    chain: arbitrumSepolia,
    name: "Arbitrum Sepolia", 
    icon: "🔷",
    color: "#28A0F0",
  },
  ethereumSepolia: {
    chain: ethereumSepolia,
    name: "Ethereum Sepolia",
    icon: "⚡",
    color: "#627EEA",
  },
} as const;
