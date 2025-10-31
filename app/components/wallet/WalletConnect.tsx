"use client"

import { Wallet } from "lucide-react"

interface WalletConnectProps {
  onConnect: () => void
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-black/80 rounded-2xl p-8 lg:p-6 border border-slate-700/50 text-center">
        {/* Wallet Icon */}
        <div className="w-17 h-17 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-6">
          <Wallet className="w-10 h-10 text-green-500" />
        </div>

        {/* Title */}
        <h2 className="text-2xl lg:text-3xl font-bold text-white  font-space-grotesk">
          Connect Wallet
        </h2>

        {/* Description */}
        <p className="text-gray-300 mb-8 font-inter font-normal text-base secondary-text">
          Connect your Web3 wallet to start earning ECO tokens from recycling
        </p>

        {/* Connect Button */}
        <button
          onClick={onConnect}
          className="gradient-button font-space-grotesk font-medium w-3xl px-8 py-2 rounded-xl text-lg 
            hover:shadow-lg transition-all text-black  duration-200 focus-visible mb-6 inline-flex justify-center items-center gap-2"
        >
          <Wallet className="w-5 h-5   " style={{ stroke: "black", color: "black" }} />
          Connect Wallet
        </button>

        {/* Supported Wallets */}
        <p className="text-[#A1A1A1] text-sm font-inter">
          Supported wallets: MetaMask, WalletConnect, Coinbase Wallet
        </p>
      </div>
    </div>
  )
}
