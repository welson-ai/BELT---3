import { useState } from 'react';
import WalletSetup from './components/WalletSetup';
import Dashboard from './components/Dashboard';
import './App.css';

export default function App() {
  const [wallet, setWallet] = useState(null);
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-star">✦</span>
            <span className="logo-text">StellarPay</span>
          </div>
          <div className="network-badge">TESTNET</div>
        </div>
      </header>
      <main className="app-main">
        {!wallet ? <WalletSetup onWalletReady={setWallet} /> : <Dashboard wallet={wallet} onDisconnect={() => setWallet(null)} />}
      </main>
      <footer className="app-footer">
        <p>Built on <a href="https://stellar.org" target="_blank" rel="noreferrer">Stellar</a> Testnet</p>
      </footer>
    </div>
  );
}
