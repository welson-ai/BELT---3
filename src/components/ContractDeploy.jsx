import React, { useState } from 'react';
import { Keypair } from '@stellar/stellar-sdk';
import SorobanManager, { CONTRACT_TEMPLATES } from '../contracts/soroban';

const ContractDeploy = ({ wallet, onContractDeployed }) => {
  const [deploying, setDeploying] = useState(false);
  const [contractName, setContractName] = useState('StellarPay Token');
  const [contractSymbol, setContractSymbol] = useState('XSP');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDeploy = async () => {
    if (!wallet) {
      setError('Please connect your wallet first');
      return;
    }

    setDeploying(true);
    setError('');
    setSuccess('');

    try {
      // For demo purposes, we'll simulate contract deployment
      // In production, you'd compile and deploy actual WASM
      const mockContractId = `C${Array.from({length: 63}, () => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        [Math.floor(Math.random() * 62)]
      ).join('')}`;

      const mockWasmHash = Array.from({length: 64}, () => 
        '0123456789abcdef'[Math.floor(Math.random() * 16)]
      ).join('');

      const contractInfo = {
        contractId: mockContractId,
        wasmHash: mockWasmHash,
        name: contractName,
        symbol: contractSymbol,
        admin: wallet.publicKey(),
        deployedAt: new Date().toISOString(),
        network: 'Testnet'
      };

      // Simulate deployment delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccess(`Contract "${contractName}" deployed successfully!`);
      onContractDeployed(contractInfo);

    } catch (err) {
      setError(`Deployment failed: ${err.message}`);
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="contract-deploy">
      <h3>Deploy Smart Contract</h3>
      
      <div className="contract-template">
        <h4>Contract Template: {CONTRACT_TEMPLATES.STELLARPAY_TOKEN.name}</h4>
        <p>{CONTRACT_TEMPLATES.STELLARPAY_TOKEN.description}</p>
      </div>

      <div className="deploy-form">
        <div className="form-group">
          <label>Token Name</label>
          <input
            type="text"
            value={contractName}
            onChange={(e) => setContractName(e.target.value)}
            placeholder="Enter token name"
            disabled={deploying}
          />
        </div>

        <div className="form-group">
          <label>Token Symbol</label>
          <input
            type="text"
            value={contractSymbol}
            onChange={(e) => setContractSymbol(e.target.value)}
            placeholder="Enter token symbol"
            maxLength={12}
            disabled={deploying}
          />
        </div>

        <div className="form-group">
          <label>Admin Address</label>
          <input
            type="text"
            value={wallet?.publicKey() || ''}
            readOnly
            className="readonly"
          />
        </div>

        <button 
          className="deploy-btn"
          onClick={handleDeploy}
          disabled={deploying || !wallet}
        >
          {deploying ? 'Deploying...' : 'Deploy Contract'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="contract-features">
        <h4>Contract Features:</h4>
        <ul>
          <li>✅ Mint new tokens (admin only)</li>
          <li>✅ Burn existing tokens (admin only)</li>
          <li>✅ Transfer tokens between addresses</li>
          <li>✅ Approve spending allowances</li>
          <li>✅ Transfer from approved addresses</li>
          <li>✅ Balance inquiries</li>
          <li>✅ Token information (name, symbol, supply)</li>
        </ul>
      </div>
    </div>
  );
};

export default ContractDeploy;
