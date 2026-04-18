import React, { useState } from 'react';
import SorobanManager from '../contracts/soroban';

const ContractInteract = ({ wallet, deployedContracts }) => {
  const [selectedContract, setSelectedContract] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [methodArgs, setMethodArgs] = useState({});
  const [interacting, setInteracting] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const contractMethods = {
    get_info: { description: 'Get token information', args: [] },
    get_admin: { description: 'Get admin address', args: [] },
    balance: { description: 'Get balance of address', args: ['address'] },
    allowance: { description: 'Get allowance amount', args: ['owner', 'spender'] },
    decimals: { description: 'Get token decimals', args: [] },
    mint: { description: 'Mint new tokens (admin only)', args: ['to', 'amount'] },
    burn: { description: 'Burn tokens (admin only)', args: ['from', 'amount'] },
    transfer: { description: 'Transfer tokens', args: ['from', 'to', 'amount'] },
    approve: { description: 'Approve spending', args: ['owner', 'spender', 'amount'] },
    transfer_from: { description: 'Transfer from approved', args: ['spender', 'from', 'to', 'amount'] }
  };

  const handleContractSelect = (contractId) => {
    setSelectedContract(contractId);
    setSelectedMethod('');
    setMethodArgs({});
    setResult('');
    setError('');
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setMethodArgs({});
    setResult('');
    setError('');
  };

  const handleArgChange = (argName, value) => {
    setMethodArgs(prev => ({
      ...prev,
      [argName]: value
    }));
  };

  const handleInteract = async () => {
    if (!wallet || !selectedContract || !selectedMethod) {
      setError('Please select contract and method');
      return;
    }

    setInteracting(true);
    setError('');
    setResult('');

    try {
      // Simulate contract interaction
      const mockResults = {
        get_info: `Name: ${deployedContracts.find(c => c.contractId === selectedContract)?.name || 'Unknown'}, Symbol: ${deployedContracts.find(c => c.contractId === selectedContract)?.symbol || 'UNK'}, Total Supply: 1000000000`,
        get_admin: wallet.publicKey(),
        balance: `${Math.floor(Math.random() * 10000)} tokens`,
        allowance: `${Math.floor(Math.random() * 1000)} tokens`,
        decimals: '7',
        mint: `Successfully minted ${methodArgs.amount || '100'} tokens to ${methodArgs.to || 'address'}`,
        burn: `Successfully burned ${methodArgs.amount || '50'} tokens from ${methodArgs.from || 'address'}`,
        transfer: `Successfully transferred ${methodArgs.amount || '25'} tokens from ${methodArgs.from || 'address'} to ${methodArgs.to || 'address'}`,
        approve: `Approved ${methodArgs.spender || 'spender'} to spend ${methodArgs.amount || '100'} tokens`,
        transfer_from: `Successfully transferred ${methodArgs.amount || '30'} tokens from ${methodArgs.from || 'from'} to ${methodArgs.to || 'to'}`
      };

      // Simulate interaction delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setResult(mockResults[selectedMethod] || 'Transaction completed successfully');

    } catch (err) {
      setError(`Interaction failed: ${err.message}`);
    } finally {
      setInteracting(false);
    }
  };

  const selectedContractInfo = deployedContracts.find(c => c.contractId === selectedContract);

  return (
    <div className="contract-interact">
      <h3>Interact with Smart Contract</h3>

      <div className="contract-selector">
        <label>Select Contract:</label>
        <select 
          value={selectedContract} 
          onChange={(e) => handleContractSelect(e.target.value)}
        >
          <option value="">Choose a contract...</option>
          {deployedContracts.map((contract, index) => (
            <option key={index} value={contract.contractId}>
              {contract.name} ({contract.symbol}) - {contract.contractId.slice(0, 20)}...
            </option>
          ))}
        </select>
      </div>

      {selectedContractInfo && (
        <div className="contract-info">
          <h4>Contract Information</h4>
          <div className="info-grid">
            <div>
              <strong>Name:</strong> {selectedContractInfo.name}
            </div>
            <div>
              <strong>Symbol:</strong> {selectedContractInfo.symbol}
            </div>
            <div>
              <strong>Admin:</strong> {selectedContractInfo.admin.slice(0, 20)}...
            </div>
            <div>
              <strong>Network:</strong> {selectedContractInfo.network}
            </div>
          </div>
        </div>
      )}

      <div className="method-selector">
        <label>Select Method:</label>
        <select 
          value={selectedMethod} 
          onChange={(e) => handleMethodSelect(e.target.value)}
          disabled={!selectedContract}
        >
          <option value="">Choose a method...</option>
          {Object.entries(contractMethods).map(([method, info]) => (
            <option key={method} value={method}>
              {method} - {info.description}
            </option>
          ))}
        </select>
      </div>

      {selectedMethod && contractMethods[selectedMethod] && (
        <div className="method-args">
          <h4>Method Arguments:</h4>
          {contractMethods[selectedMethod].args.map((arg) => (
            <div key={arg} className="form-group">
              <label>{arg}:</label>
              <input
                type="text"
                value={methodArgs[arg] || ''}
                onChange={(e) => handleArgChange(arg, e.target.value)}
                placeholder={`Enter ${arg}`}
                disabled={interacting}
              />
            </div>
          ))}
        </div>
      )}

      <button 
        className="interact-btn"
        onClick={handleInteract}
        disabled={interacting || !selectedContract || !selectedMethod}
      >
        {interacting ? 'Executing...' : 'Execute Method'}
      </button>

      {error && <div className="error-message">{error}</div>}
      {result && <div className="result-message">{result}</div>}

      {selectedContract && (
        <div className="contract-methods-list">
          <h4>Available Methods:</h4>
          <div className="methods-grid">
            {Object.entries(contractMethods).map(([method, info]) => (
              <div key={method} className="method-card">
                <strong>{method}</strong>
                <p>{info.description}</p>
                <small>Args: {info.args.join(', ') || 'none'}</small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractInteract;
