import { WalletConnectContext } from '../../../contexts/WalletConnectContext';
import { useCallback, useContext, useEffect } from 'react';
import { WalletInterface } from '../walletInterface';
import {
  AccountId,
  ContractExecuteTransaction,
  ContractId,
  ContractCallQuery,
  LedgerId,
  TokenAssociateTransaction,
  TokenId,
  TransactionId,
  TransferTransaction,
  TransactionReceipt,
  TransactionReceiptQuery,
  Hbar,
} from '@hashgraph/sdk';
import { ContractFunctionParameterBuilder } from '../contractFunctionParameterBuilder';
import { appConfig } from '../../../config';
import { SignClientTypes } from '@walletconnect/types';
import { DAppConnector, HederaSessionEvent, HederaChainId } from '@hashgraph/hedera-wallet-connect';
import EventEmitter from 'events';

const base_url = process.env.PUBLIC_BACKEND_API_URL;
console.log(Hbar);

/* eslint-disable react-refresh/only-export-components */

// Created refreshEvent because `dappConnector.walletConnectClient.on(eventName, syncWithWalletConnectContext)` would not call syncWithWalletConnectContext
const refreshEvent = new EventEmitter();

// Create a new project in walletconnect cloud to generate a project id
const walletConnectProjectId = '377d75bb6f86a2ffd427d032ff6ea7d3';
const currentNetworkConfig = appConfig.networks.testnet;
const hederaNetwork = currentNetworkConfig.network;
// const hederaClient = Client.forName(hederaNetwork);

const metadata: SignClientTypes.Metadata = {
  name: 'Pick-n-Get',
  description: 'Recycling Platform',
  url:
    typeof window !== 'undefined'
      ? window.location.origin
      : (base_url ?? 'https://pick-n-get-fe.vercel.app/'),
  icons: [typeof window !== 'undefined' ? window.location.origin + '/logo192.png' : '/logo192.png'],
};

// Define supported Hedera JSON-RPC methods manually
const SUPPORTED_HEDERA_METHODS = [
  'hedera_signAndExecuteTransaction',
  'hedera_executeTransaction',
  'hedera_signTransaction',
  'hedera_signMessage',
  'hedera_getNodeAddresses',
];

const dappConnector = new DAppConnector(
  metadata,
  LedgerId.fromString(hederaNetwork),
  walletConnectProjectId,
  SUPPORTED_HEDERA_METHODS,
  [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
  [HederaChainId.Testnet],
);

// ensure walletconnect is initialized only once
let walletConnectInitPromise: Promise<void> | undefined = undefined;
const initializeWalletConnect = async () => {
  if (walletConnectInitPromise === undefined) {
    walletConnectInitPromise = dappConnector.init();
  }
  await walletConnectInitPromise;
};

export const openWalletConnectModal = async () => {
  await initializeWalletConnect();
  await dappConnector.openModal().then((x) => {
    refreshEvent.emit('sync');
    console.log(x);
  });
};

class WalletConnectWallet implements WalletInterface {
  private getSigner() {
    if (dappConnector.signers.length === 0) {
      throw new Error('No signers found!');
    }
    return dappConnector.signers[0];
  }

  private getAccountId() {
    return AccountId.fromString(this.getSigner().getAccountId().toString());
  }

  async transferHBAR(toAddress: AccountId, amount: number) {
    const transferHBARTransaction = new TransferTransaction()
      .addHbarTransfer(this.getAccountId(), -amount)
      .addHbarTransfer(toAddress, amount);

    const signer = this.getSigner();
    await transferHBARTransaction.freezeWithSigner(signer);
    const txResult = await transferHBARTransaction.executeWithSigner(signer);
    return txResult ? txResult.transactionId : null;
  }

  async transferFungibleToken(toAddress: AccountId, tokenId: TokenId, amount: number) {
    const transferTokenTransaction = new TransferTransaction()
      .addTokenTransfer(tokenId, this.getAccountId(), -amount)
      .addTokenTransfer(tokenId, toAddress.toString(), amount);

    const signer = this.getSigner();
    await transferTokenTransaction.freezeWithSigner(signer);
    const txResult = await transferTokenTransaction.executeWithSigner(signer);
    return txResult ? txResult.transactionId : null;
  }

  async transferNonFungibleToken(toAddress: AccountId, tokenId: TokenId, serialNumber: number) {
    const transferTokenTransaction = new TransferTransaction().addNftTransfer(
      tokenId,
      serialNumber,
      this.getAccountId(),
      toAddress,
    );

    const signer = this.getSigner();
    await transferTokenTransaction.freezeWithSigner(signer);
    const txResult = await transferTokenTransaction.executeWithSigner(signer);
    return txResult ? txResult.transactionId : null;
  }

  async associateToken(tokenId: TokenId) {
    const associateTokenTransaction = new TokenAssociateTransaction()
      .setAccountId(this.getAccountId())
      .setTokenIds([tokenId]);

    const signer = this.getSigner();
    await associateTokenTransaction.freezeWithSigner(signer);
    const txResult = await associateTokenTransaction.executeWithSigner(signer);
    return txResult ? txResult.transactionId : null;
  }

  // Purpose: Execute contract function (state-changing)
  async executeContractFunction(
    contractId: ContractId,
    functionName: string,
    functionParameters: ContractFunctionParameterBuilder,
    gasLimit: number,
    payableAmount?: string | number,
  ) {
    const tx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(gasLimit)
      .setFunction(functionName, functionParameters.buildHAPIParams());

    // ✅ FIX: Use Hbar.from() with HbarUnit
    if (payableAmount !== undefined && payableAmount !== null) {
      const hbarAmount =
        typeof payableAmount === 'string' ? parseFloat(payableAmount) : payableAmount;

      // ✅ CORRECT: Specify HbarUnit.Hbar as the second parameter
      const { HbarUnit } = await import('@hashgraph/sdk');
      tx.setPayableAmount(Hbar.from(hbarAmount, HbarUnit.Hbar));
      console.log(`💰 Sending payment: ${hbarAmount} HBAR`);
    }

    const signer = this.getSigner();
    await tx.freezeWithSigner(signer);
    const txResult = await tx.executeWithSigner(signer);

    return txResult ? txResult.transactionId : null;
  }

  //  Execute contract view function (read-only)
  async executeContractViewFunction(
    contractId: ContractId,
    functionName: string,
    functionParameters: ContractFunctionParameterBuilder,
  ) {
    try {
      const query = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction(functionName, functionParameters.buildHAPIParams());

      const signer = this.getSigner();
      console.log('Query prepared:', query);
      console.log('Executing view function with signer:', signer);

      // Execute the query - note that ContractCallQuery might not work directly with signer
      // This is a placeholder implementation that needs proper testing
      console.warn('Contract view function calls need proper implementation for WalletConnect');

      // For now, return null until proper implementation is tested
      return null;
    } catch (error) {
      console.error('Error executing view function:', error);
      throw new Error(
        `View function call failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // NEW: Get transaction receipt for verification - FIXED VERSION
  async getTransactionReceipt(transactionId: TransactionId): Promise<TransactionReceipt | null> {
    try {
      // Create a TransactionReceiptQuery to get the receipt
      const receiptQuery = new TransactionReceiptQuery().setTransactionId(transactionId);

      const signer = this.getSigner();

      // Execute the receipt query using the signer
      const receipt = await receiptQuery.executeWithSigner(signer);
      return receipt;
    } catch (error) {
      console.error('Error getting transaction receipt:', error);
      return null;
    }
  }

  // NEW: Wait for transaction to reach consensus
  async waitForTransaction(
    transactionId: TransactionId,
    timeoutMs: number = 30000,
  ): Promise<TransactionReceipt | null> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const receipt = await this.getTransactionReceipt(transactionId);

        if (receipt && receipt.status.toString() === 'SUCCESS') {
          return receipt;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.log('Waiting for transaction consensus...');

        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log('Error while waiting for transaction:', error);
      }
    }

    throw new Error(`Transaction timeout after ${timeoutMs}ms`);
  }

  disconnect() {
    dappConnector.disconnectAll().then(() => {
      refreshEvent.emit('sync');
    });
  }
}

export const walletConnectWallet = new WalletConnectWallet();

// this component will sync the walletconnect state with the context
export const WalletConnectClient = () => {
  const { setAccountId, setIsConnected } = useContext(WalletConnectContext);

  const syncWithWalletConnectContext = useCallback(() => {
    const accountId = dappConnector.signers[0]?.getAccountId()?.toString();
    if (accountId) {
      setAccountId(accountId);
      setIsConnected(true);
    } else {
      setAccountId('');
      setIsConnected(false);
    }
  }, [setAccountId, setIsConnected]);

  useEffect(() => {
    refreshEvent.addListener('sync', syncWithWalletConnectContext);

    initializeWalletConnect().then(() => {
      syncWithWalletConnectContext();
    });

    return () => {
      refreshEvent.removeListener('sync', syncWithWalletConnectContext);
    };
  }, [syncWithWalletConnectContext]);

  return null;
};
