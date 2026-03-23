import { useState } from 'react';
import { generateKeypair, keypairFromSecret, isValidSecretKey } from '../utils/stellar';

export default function WalletSetup({ onWalletReady }) {
  const [mode, setMode] = useState('choose');
  const [secretInput, setSecretInput] = useState('');
  const [error, setError] = useState('');
  const [newWallet, setNewWallet] = useState(null);
  const [copied, setCopied] = useState(false);

  function handleGenerate() {
    setNewWallet(generateKeypair());
    setMode('created');
  }

  function handleImport(e) {
    e.preventDefault();
    setError('');
    if (!isValidSecretKey(secretInput.trim())) {
      setError('Invalid secret key. Must start with "S" and be 56 characters.');
      return;
    }
    try {
      onWalletReady(keypairFromSecret(secretInput.trim()));
    } catch {
      setError('Could not load wallet from this secret key.');
    }
  }

  function handleCopy(text) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="setup-container">
      <div className="setup-hero">
        <div className="hero-glyph">◈</div>
        <h1 className="hero-title">Your Stellar Wallet</h1>
        <p className="hero-sub">Send, receive, and track XLM on Stellar Testnet</p>
      </div>

      {mode === 'choose' && (
        <div className="setup-cards">
          <button className="setup-card primary" onClick={handleGenerate}>
            <span className="card-icon">⊕</span>
            <span className="card-title">Create New Wallet</span>
            <span className="card-desc">Generate a fresh keypair for Stellar Testnet</span>
          </button>
          <button className="setup-card" onClick={() => setMode('import')}>
            <span className="card-icon">⊙</span>
            <span className="card-title">Import Wallet</span>
            <span className="card-desc">Use an existing secret key to access your account</span>
          </button>
        </div>
      )}

      {mode === 'created' && newWallet && (
        <div className="wallet-reveal">
          <div className="reveal-warning">⚠ Save your secret key now. It will not be shown again.</div>
          <div className="key-block">
            <label>Public Key (Address)</label>
            <div className="key-row">
              <code>{newWallet.publicKey}</code>
              <button className="copy-btn" onClick={() => handleCopy(newWallet.publicKey)}>{copied ? '✓' : 'Copy'}</button>
            </div>
          </div>
          <div className="key-block secret">
            <label>Secret Key — Keep Private!</label>
            <div className="key-row">
              <code>{newWallet.secretKey}</code>
              <button className="copy-btn" onClick={() => handleCopy(newWallet.secretKey)}>{copied ? '✓' : 'Copy'}</button>
            </div>
          </div>
          <button className="cta-btn" onClick={() => onWalletReady(newWallet)}>I've saved my keys — Enter Wallet →</button>
          <button className="ghost-btn" onClick={() => setMode('choose')}>Back</button>
        </div>
      )}

      {mode === 'import' && (
        <form className="import-form" onSubmit={handleImport}>
          <label htmlFor="secret">Secret Key</label>
          <input
            id="secret" type="password"
            placeholder="SXXX..."
            value={secretInput}
            onChange={(e) => { setSecretInput(e.target.value); setError(''); }}
            autoComplete="off" spellCheck="false"
          />
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="cta-btn">Unlock Wallet →</button>
          <button type="button" className="ghost-btn" onClick={() => setMode('choose')}>Back</button>
        </form>
      )}
    </div>
  );
}
