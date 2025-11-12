import { ContractId, AccountId } from '@hashgraph/sdk';
import { TokenId } from '@hashgraph/sdk';
import { ethers } from 'ethers';
import { useContext, useEffect } from 'react';
import { appConfig } from '../../../config';
import { MetamaskContext } from '../../../contexts/MetamaskContext';
import { ContractFunctionParameterBuilder } from '../contractFunctionParameterBuilder';
import { WalletInterface } from '../walletInterface';

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on(event: 'accountsChanged', handler: (accounts: string[]) => void): void;
  on(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: 'accountsChanged', handler: (accounts: string[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
const currentNetworkConfig = appConfig.networks.testnet;

export const switchToHederaNetwork = async (ethereum: EthereumProvider) => {
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: currentNetworkConfig.chainId }],
    });
  } catch (error) {
    const err = error as { code?: number };
    if (err.code === 4902) {
      try {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainName: `Hedera (${currentNetworkConfig.network})`,
              chainId: currentNetworkConfig.chainId,
              nativeCurrency: {
                name: 'HBAR',
                symbol: 'HBAR',
                decimals: 18,
              },
              rpcUrls: [currentNetworkConfig.jsonRpcUrl],
            },
          ],
        });
      } catch (addError) {
        console.error(addError);
      }
    }
    console.error(error);
  }
};

const getProvider = () => {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called in the browser environment');
  }
  const { ethereum } = window;
  if (!ethereum) {
    throw new Error('Metamask is not installed! Go install the extension!');
  }

  return new ethers.providers.Web3Provider(ethereum);
};

export const connectToMetamask = async () => {
  if (typeof window === 'undefined') {
    console.warn('MetaMask can only be accessed in the browser');
    return [];
  }

  try {
    const { ethereum } = window;
    if (!ethereum) {
      alert('Metamask is not installed! Please install the MetaMask extension.');
      return [];
    }

    const provider = getProvider();
    let accounts: string[] = [];

    await switchToHederaNetwork(ethereum);
    accounts = await provider.send('eth_requestAccounts', []);

    return accounts;
  } catch (error) {
    const err = error as { code?: number };
    if (err.code === 4001) {
      console.warn('Please connect to Metamask.');
    } else {
      console.error('Error connecting to MetaMask:', error);
    }
    return [];
  }
};

class MetaMaskWallet implements WalletInterface {
  private convertAccountIdToSolidityAddress(accountId: AccountId): string {
    const accountIdString =
      accountId.evmAddress !== null
        ? accountId.evmAddress.toString()
        : accountId.toSolidityAddress();

    return `0x${accountIdString}`;
  }

  async transferHBAR(toAddress: AccountId, amount: number) {
    const provider = getProvider();
    const signer = await provider.getSigner();
    const tx = await signer.populateTransaction({
      to: this.convertAccountIdToSolidityAddress(toAddress),
      value: ethers.utils.parseEther(amount.toString()),
    });
    try {
      const { hash } = await signer.sendTransaction(tx);
      await provider.waitForTransaction(hash);

      return hash;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(message);
      return null;
    }
  }

  async transferFungibleToken(toAddress: AccountId, tokenId: TokenId, amount: number) {
    const hash = await this.executeContractFunction(
      ContractId.fromString(tokenId.toString()),
      'transfer',
      new ContractFunctionParameterBuilder()
        .addParam({
          type: 'address',
          name: 'recipient',
          value: this.convertAccountIdToSolidityAddress(toAddress),
        })
        .addParam({
          type: 'uint256',
          name: 'amount',
          value: amount,
        }),
      appConfig.constants.METAMASK_GAS_LIMIT_TRANSFER_FT,
    );

    return hash;
  }

  async transferNonFungibleToken(toAddress: AccountId, tokenId: TokenId, serialNumber: number) {
    const provider = getProvider();
    const addresses = await provider.listAccounts();
    const hash = await this.executeContractFunction(
      ContractId.fromString(tokenId.toString()),
      'transferFrom',
      new ContractFunctionParameterBuilder()
        .addParam({
          type: 'address',
          name: 'from',
          value: addresses[0],
        })
        .addParam({
          type: 'address',
          name: 'to',
          value: this.convertAccountIdToSolidityAddress(toAddress),
        })
        .addParam({
          type: 'uint256',
          name: 'nftId',
          value: serialNumber,
        }),
      appConfig.constants.METAMASK_GAS_LIMIT_TRANSFER_NFT,
    );

    return hash;
  }

  async associateToken(tokenId: TokenId) {
    const hash = await this.executeContractFunction(
      ContractId.fromString(tokenId.toString()),
      'associate',
      new ContractFunctionParameterBuilder(),
      appConfig.constants.METAMASK_GAS_LIMIT_ASSOCIATE,
    );

    return hash;
  }
  async executeContractFunction(
    contractId: ContractId,
    functionName: string,
    functionParameters: ContractFunctionParameterBuilder,
    gasLimit: number,
    payableAmount?: string | number,
  ) {
    const provider = getProvider();
    const signer = await provider.getSigner();

    const isPayable = payableAmount !== undefined && payableAmount !== null;
    const payableKeyword = isPayable ? ' payable' : '';
    const abi = [
      `function ${functionName}(${functionParameters.buildAbiFunctionParams()})${payableKeyword}`,
    ];

    console.log(`ABI: ${abi[0]}`);

    const contract = new ethers.Contract(`0x${contractId.toEvmAddress()}`, abi, signer);

    try {
      const ethersOverrides: { gasLimit?: number; value?: ethers.BigNumber } = {
        gasLimit: gasLimit === -1 ? undefined : gasLimit,
      };

      if (isPayable) {
        let tinybars: string;

        if (typeof payableAmount === 'string') {
          // Already in tinybars
          tinybars = payableAmount;
        } else {
          // Convert HBAR to tinybars
          tinybars = Math.floor(payableAmount * 1e8).toString();
        }

        const hbarAmount = Number(tinybars) / 1e8;

        console.log(`💰 Payment details:`);
        console.log(`   - Amount: ${hbarAmount} HBAR`);
        console.log(`   - Tinybars: ${tinybars}`);

        // Convert tinybars to weibars for Hedera JSON-RPC
        // Hedera: 1 HBAR = 10^8 tinybars
        // Ethereum: 1 ETH = 10^18 Wei
        // Difference: 10^10
        // So: tinybars * 10^10 = weibars (for RPC compatibility)
        const weibars = ethers.BigNumber.from(tinybars).mul(ethers.BigNumber.from('10000000000'));

        ethersOverrides.value = weibars;

        console.log(`   - Weibars (for RPC): ${weibars.toString()}`);
        console.log(
          `   - Verification: ${weibars.div(ethers.BigNumber.from('10000000000')).toNumber() / 1e8} HBAR`,
        );
      }

      console.log(`🚀 Executing contract function: ${functionName}`);
      console.log(`📊 Contract: 0x${contractId.toEvmAddress()}`);

      const txResult = await contract[functionName](
        ...functionParameters.buildEthersParams(),
        ethersOverrides,
      );

      console.log(`✅ Transaction submitted: ${txResult.hash}`);

      console.log(`⏳ Waiting for confirmation...`);
      const receipt = await provider.waitForTransaction(txResult.hash);
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

      return txResult.hash;
    } catch (error) {
      console.error('❌ MetaMask execution error:');
      console.error('Error:', error);

      if (error && typeof error === 'object') {
        const err = error as {
          data?: unknown;
          error?: unknown;
          reason?: string;
          code?: string | number;
          message?: string;
        };

        if (err.data) console.error('Error data:', err.data);
        if (err.error) console.error('Inner error:', err.error);
        if (err.reason) console.error('Reason:', err.reason);
        if (err.code) console.error('Code:', err.code);
        if (err.message) console.error('Message:', err.message);
      }

      return null;
    }
  }
  disconnect() {
    alert('Please disconnect using the Metamask extension.');
  }
}

export const metamaskWallet = new MetaMaskWallet();

export const MetaMaskClient = () => {
  const { setMetamaskAccountAddress } = useContext(MetamaskContext);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log('MetaMask not detected');
        return;
      }

      const provider = getProvider();
      provider.listAccounts().then((signers) => {
        if (signers.length !== 0) {
          setMetamaskAccountAddress(signers[0]);
        } else {
          setMetamaskAccountAddress('');
        }
      });

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length !== 0) {
          setMetamaskAccountAddress(accounts[0]);
        } else {
          setMetamaskAccountAddress('');
        }
      };

      ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (ethereum?.removeListener) {
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('MetaMask client error:', message);
    }
  }, [setMetamaskAccountAddress]);

  return null;
};
