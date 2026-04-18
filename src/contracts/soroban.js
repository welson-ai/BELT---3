import { 
  Contract,
  SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  xdr,
  ScInt,
  Address,
  nativeToScVal,
  scValToNative
} from '@stellar/stellar-sdk';

// Soroban contract utilities
export class SorobanManager {
  constructor(rpcUrl = 'https://soroban-testnet.stellar.org') {
    this.rpc = new SorobanRpc.Server(rpcUrl, { allowHttp: true });
    this.networkPassphrase = Networks.TESTNET;
  }

  // Deploy contract to Soroban
  async deployContract(wallet, wasmCode) {
    try {
      const account = await this.rpc.getAccount(wallet.publicKey());
      
      // Upload contract wasm
      const uploadTx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          xdr.Operation.uploadContractWasm({
            wasm: wasmCode,
          })
        )
        .setTimeout(30)
        .build();

      const preparedUploadTx = await this.rpc.prepareTransaction(uploadTx);
      const signedUploadTx = wallet.signTransaction(preparedUploadTx);
      const uploadResult = await this.rpc.sendTransaction(signedUploadTx);

      if (uploadResult.status !== 'SUCCESS') {
        throw new Error(`Upload failed: ${uploadResult.status}`);
      }

      // Get wasm hash from result
      const wasmHash = uploadResult.resultXdr
        .map((op) => op.value().wasmHash())
        .value();

      // Create contract instance
      const createTx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          xdr.Operation.createContract({
            wasmHash,
            address: new Address(wallet.publicKey()),
            salt: xdr.ScVal.scvBytes(crypto.getRandomValues(new Uint8Array(32))),
          })
        )
        .setTimeout(30)
        .build();

      const preparedCreateTx = await this.rpc.prepareTransaction(createTx);
      const signedCreateTx = wallet.signTransaction(preparedCreateTx);
      const createResult = await this.rpc.sendTransaction(signedCreateTx);

      if (createResult.status !== 'SUCCESS') {
        throw new Error(`Contract creation failed: ${createResult.status}`);
      }

      const contractId = createResult.resultXdr
        .map((op) => op.value().contractId().toString('hex'))
        .value();

      return {
        contractId,
        wasmHash: wasmHash.toString('hex'),
        transactionHash: createResult.hash
      };

    } catch (error) {
      console.error('Contract deployment failed:', error);
      throw error;
    }
  }

  // Interact with deployed contract
  async callContract(wallet, contractId, method, args = []) {
    try {
      const account = await this.rpc.getAccount(wallet.publicKey());
      const contract = new Contract(contractId);

      const callTx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(contract.call(method, ...args))
        .setTimeout(30)
        .build();

      const preparedTx = await this.rpc.prepareTransaction(callTx);
      const signedTx = wallet.signTransaction(preparedTx);
      const result = await this.rpc.sendTransaction(signedTx);

      if (result.status !== 'SUCCESS') {
        throw new Error(`Contract call failed: ${result.status}`);
      }

      // Get transaction result
      const txResult = await this.rpc.getTransaction(result.hash);
      if (txResult.status !== 'SUCCESS') {
        throw new Error(`Transaction failed: ${txResult.status}`);
      }

      return {
        success: true,
        result: txResult.resultXdr,
        transactionHash: result.hash
      };

    } catch (error) {
      console.error('Contract call failed:', error);
      throw error;
    }
  }

  // Read contract state (no transaction needed)
  async readContract(contractId, method, args = []) {
    try {
      const contract = new Contract(contractId);
      const result = await this.rpc.simulateTransaction(
        new TransactionBuilder(new Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '1'), {
          fee: BASE_FEE,
          networkPassphrase: this.networkPassphrase,
        })
          .addOperation(contract.call(method, ...args))
          .setTimeout(30)
          .build()
      );

      if (result.status !== 'SUCCESS') {
        throw new Error(`Simulation failed: ${result.status}`);
      }

      return {
        success: true,
        result: result.resultXdr
      };

    } catch (error) {
      console.error('Contract read failed:', error);
      throw error;
    }
  }

  // Get contract information
  async getContractInfo(contractId) {
    try {
      const ledgerData = await this.rpc.getLedgerEntries([contractId]);
      return ledgerData;
    } catch (error) {
      console.error('Failed to get contract info:', error);
      return null;
    }
  }

  // Convert JavaScript values to Soroban ScVal
  toScVal(value) {
    if (typeof value === 'string') {
      return nativeToScVal(value);
    } else if (typeof value === 'number') {
      return nativeToScVal(new ScInt(value));
    } else if (typeof value === 'bigint') {
      return nativeToScVal(new ScInt(value));
    } else if (typeof value === 'object' && value.constructor === Address) {
      return nativeToScVal(value);
    }
    return nativeToScVal(value);
  }

  // Convert Soroban ScVal to JavaScript
  fromScVal(scVal) {
    return scValToNative(scVal);
  }
}

// Contract templates
export const CONTRACT_TEMPLATES = {
  STELLARPAY_TOKEN: {
    name: 'StellarPay Token',
    description: 'Custom fungible token with mint, burn, and approval functions',
    methods: {
      initialize: ['name', 'symbol', 'admin'],
      mint: ['to', 'amount'],
      burn: ['from', 'amount'],
      transfer: ['from', 'to', 'amount'],
      approve: ['owner', 'spender', 'amount'],
      transfer_from: ['spender', 'from', 'to', 'amount'],
      balance: ['address'],
      allowance: ['owner', 'spender'],
      get_info: [],
      get_admin: [],
      decimals: []
    }
  }
};

export default SorobanManager;
