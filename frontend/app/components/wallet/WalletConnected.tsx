'use client';

import { useState } from 'react';
import {
  Wallet,
  Copy,
  ExternalLink,
  QrCode,
  Send,
  ArrowUpDown,
  Clock,
  Plus,
  Minus,
  TrendingUp,
} from 'lucide-react';

interface WalletConnectedProps {
  onDisconnect: () => void;
}

interface Transaction {
  id: number;
  type: string;
  amount: string;
  date: string;
  address: string;
  status: string;
}

export default function WalletConnected({ onDisconnect }: WalletConnectedProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const walletData = {
    address: '0x742d35Cc6c63C4Cc529925a3b0b4C9dbC40b40b',
    balance: {
      eco: 1450,
      usdc: 5.05,
      fiat: 5.05,
    },
    totalValue: 7050.0,
    change: 12.5,
  };

  const transactions = [
    {
      id: 1,
      type: 'received',
      amount: '+25.5 ECO',
      date: '2025-01-14 14:30',
      address: '0xf8dc...3c5b',
      status: 'completed',
    },
    {
      id: 2,
      type: 'sent',
      amount: '-15 USDC',
      date: '2025-01-14 09:15',
      address: '0x7a5c...4b0f',
      status: 'completed',
    },
    {
      id: 3,
      type: 'swap',
      amount: '50 ECO',
      date: '2025-01-13 18:45',
      address: '0x9a8c...4a4b',
      status: 'completed',
    },
    {
      id: 4,
      type: 'received',
      amount: '+18.75 ECO',
      date: '2025-01-12 11:20',
      address: '0x3f7c...3c5b',
      status: 'completed',
    },
  ];

  const copyAddress = () => {
    navigator.clipboard.writeText(walletData.address);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'send', label: 'Send' },
    { id: 'swap', label: 'Swap' },
    { id: 'history', label: 'History' },
  ];

  return (
    <div className="space-y-6">
      {/* Wallet Status Card */}
      <div className=".shadow-wallet-green rounded-2xl border border-[#A5D6A74D] bg-black/80 p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-inter font-lg font-medium text-white">Wallet Connected</h3>
              <p className="font-inter text-base font-normal text-white/50">
                {walletData.address.slice(0, 8)}...{walletData.address.slice(-4)}
              </p>
            </div>
          </div>
          <span className="font-space-grotesk gradient-button rounded-lg border px-4 py-2 text-lg font-medium text-black">
            Trade HBAR For Cash
          </span>
        </div>

        {/* Balance Section */}
        <div className="mb-6">
          <h4 className="font-space-grotesk font-inter mb-4 text-lg font-medium text-white">
            Balance
          </h4>
          <div className="space-y-3">
            {/* ECO Tokens */}
            <div className="rounded-lg border bg-[#DCFCE7] p-4">
              <div className="font-inter text-primary flex items-center justify-between">
                <div>
                  <p className="font-medium">Receive Tokens</p>
                  <p className="text-sm">Pick-n-Get Utility Token</p>
                </div>
                <div className="text-primary text-right">
                  <p className="text-lg font-medium">
                    {walletData.balance.eco.toLocaleString()} ECO
                  </p>
                  <p className="text-sm">₦2082.50</p>
                </div>
              </div>
            </div>

            {/* USDC */}
            <div className="rounded-lg border bg-[#DBEAFE] p-4">
              <div className="flex items-center justify-between">
                <div className="text-info-darker">
                  <p className="font-medium">USDC</p>
                  <p className="text-sm">USD Coin Stablecoin</p>
                </div>
                <div className="text-info-darker font-inter text-right">
                  <p className="text-lg font-medium">${walletData.balance.usdc}</p>
                  <p className="text-sm font-normal">{walletData.balance.usdc} HBAR</p>
                </div>
              </div>
            </div>

            {/* Fiat Equivalent */}
            <div className="rounded-lg bg-[#F3E8FF] p-4">
              <div className="flex items-center justify-between text-[#9333EA]">
                <div>
                  <p className="font-medium">Fiat Equivalent</p>
                  <p className="text-sm">Local currency</p>
                </div>
                <div className="text-right text-[#9333EA]">
                  <p className="text-lg font-bold">${walletData.balance.fiat}</p>
                  <p className="text-sm">{walletData.balance.fiat} USDC</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onDisconnect}
          className="font-space-grotesk focus-visible mb-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#EF5350] px-8 py-2 text-lg font-medium transition-all duration-200 hover:bg-red-700 hover:shadow-lg"
        >
          <Wallet className="h-5 w-5" />
          Disconnect Wallet
        </button>

        {/* Disconnect Button */}

        <p className="text-inactive font-inter mt-2 text-center text-sm">
          Supported wallets: MetaMask, WalletConnect, Coinbase Wallet
        </p>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
        <div className="rounded-xl border border-green-500/20 bg-[#DCFCE7] p-4 lg:p-6">
          <div className="mb-2 flex items-center gap-2">
            <Wallet className="text-primary h-5 w-5" />
            <span className="text-primary font-inter text-sm font-medium">
              Total Portfolio Value
            </span>
          </div>
          <p className="font-space-grotesk font-space-grotesk text-primary text-2xl font-bold lg:text-3xl">
            ₦{walletData.totalValue.toLocaleString()}
          </p>
          <p className="text-primary font-inter mt-1 flex items-center gap-1 text-xs font-normal">
            <TrendingUp className="h-3 w-3" />+{walletData.change}% (24h)
          </p>
        </div>

        <div className="text-info-darker rounded-lg bg-[#DBEAFE] p-4 lg:p-6">
          <div className="mb-2 flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <span className="font-inter text-sm font-medium">ECO Tokens</span>
          </div>
          <p className="font-space-grotesk text-2xl font-bold lg:text-3xl">
            {walletData.balance.eco.toLocaleString()}
          </p>
          <p className="font-inter mt-1 text-sm font-normal">₦2082.50</p>
        </div>

        <div className="text-info-purple rounded-lg border border-purple-500/20 bg-[#F3E8FF] p-4 lg:p-6">
          <div className="mb-2 flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <span className="font-inter text-sm font-medium">HBAR Balance</span>
          </div>
          <p className="font-space-grotesk text-2xl font-bold lg:text-3xl">
            {walletData.balance.usdc}
          </p>
          <p className="text-info-purple font-inter mt-1 text-sm">Stablecoin</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto rounded-lg bg-black/40 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`min-w-0 flex-1 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-black'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-2xl border border-slate-700/50 bg-black/80 p-6 lg:p-8">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'send' && <SendTab />}
        {activeTab === 'swap' && <SwapTab />}
        {activeTab === 'history' && <HistoryTab transactions={transactions} />}
      </div>

      {/* Wallet Address & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="shadow-wallet-green rounded-2xl bg-black/80 p-6">
          <h3 className="font-space-grotesk mb-4 flex items-center gap-2 font-semibold text-white">
            <Wallet className="h-5 w-5" />
            Wallet Address
          </h3>
          <div className="mb-4 rounded-lg bg-slate-800 p-4">
            <p className="font-mono text-sm break-all text-gray-300">{walletData.address}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyAddress}
              className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600"
            >
              <Copy className="h-4 w-4" />
              Copy
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600">
              <QrCode className="h-4 w-4" />
              QR Code
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600">
              <ExternalLink className="h-4 w-4" />
              Explorer
            </button>
          </div>
        </div>

        <div className="shadow-wallet-green rounded-2xl bg-black/80 p-6">
          <h3 className="font-space-grotesk mb-4 font-semibold text-white">Quick Actions</h3>
          <div className="space-y-3">
            <button className="flex w-full items-center gap-3 rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700">
              <Send className="h-5 w-5" />
              Send Tokens
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700">
              <Plus className="h-5 w-5" />
              Receive Tokens
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg bg-purple-600 px-4 py-3 font-medium text-white transition-colors hover:bg-purple-700">
              <ArrowUpDown className="h-5 w-5" />
              Swap Tokens
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab Components
function OverviewTab() {
  return (
    <div className="py-8 text-center text-gray-400">
      <p>Overview content will be displayed here</p>
    </div>
  );
}

function SendTab() {
  const [selectedToken, setSelectedToken] = useState('ECO');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex items-center gap-2">
        <Send className="h-5 w-5 text-blue-400" />
        <h3 className="font-space-grotesk text-xl font-semibold text-white">Send Tokens</h3>
      </div>

      <div className="space-y-4">
        {/* Token Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Select Token</label>
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white"
          >
            <option value="ECO">ECO Token (1450 available)</option>
            <option value="USDC">USDC ($5.05 available)</option>
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white"
          />
        </div>

        {/* Recipient */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Recipient Address</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white"
          />
        </div>

        {/* Network Fee */}
        <div className="rounded-lg bg-slate-800 p-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Network Fee:</span>
            <span className="text-white">~$0.50</span>
          </div>
          <div className="mt-1 flex justify-between text-sm">
            <span className="text-gray-400">Total:</span>
            <span className="text-white">0 + fee</span>
          </div>
        </div>

        <button className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-blue-700">
          Send Transaction
        </button>
      </div>
    </div>
  );
}

function SwapTab() {
  const [fromToken, setFromToken] = useState('ECO');
  const [toToken, setToToken] = useState('USDC');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex items-center gap-2">
        <ArrowUpDown className="h-5 w-5 text-purple-400" />
        <h3 className="font-space-grotesk text-xl font-semibold text-white">Swap Tokens</h3>
      </div>

      <div className="space-y-4">
        {/* From Token */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">From</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white"
            />
            <select
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white"
            >
              <option value="ECO">ECO</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
        </div>

        {/* Swap Direction */}
        <div className="flex justify-center">
          <button className="rounded-full bg-slate-700 p-2 transition-colors hover:bg-slate-600">
            <ArrowUpDown className="h-5 w-5 text-gray-300" />
          </button>
        </div>

        {/* To Token */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">To</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={toAmount}
              onChange={(e) => setToAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white"
            />
            <select
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white"
            >
              <option value="USDC">USDC</option>
              <option value="ECO">ECO</option>
            </select>
          </div>
        </div>

        {/* Exchange Rate */}
        <div className="rounded-lg bg-slate-800 p-3">
          <p className="text-center text-sm text-gray-400">Exchange Rate: 1 ECO = $0.85 USDC</p>
        </div>

        <button className="w-full rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-purple-700">
          Swap Tokens
        </button>
      </div>
    </div>
  );
}

function HistoryTab({ transactions }: { transactions: Transaction[] }) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'received':
        return <Plus className="h-5 w-5 text-green-400" />;
      case 'sent':
        return <Minus className="h-5 w-5 text-red-400" />;
      case 'swap':
        return <ArrowUpDown className="h-5 w-5 text-purple-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'received':
        return 'text-green-400';
      case 'sent':
        return 'text-red-400';
      case 'swap':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Clock className="h-5 w-5 text-gray-400" />
        <h3 className="font-space-grotesk text-xl font-semibold text-white">Transaction History</h3>
      </div>

      <div className="space-y-3">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between rounded-lg bg-slate-800 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700">
                {getTransactionIcon(tx.type)}
              </div>
              <div>
                <p className="font-medium text-white capitalize">
                  {tx.type} {tx.type === 'swap' ? 'ECO → USDC' : ''}
                </p>
                <p className="text-sm text-gray-400">{tx.date}</p>
                <p className="text-xs text-gray-500">{tx.address}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${getTransactionColor(tx.type)}`}>{tx.amount}</p>
              <p className="text-sm text-gray-400">{tx.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
