import { useState, useEffect, useCallback } from 'react';
import { getAccountDetails, fundWithFriendbot, getRecentTransactions, formatAddress, formatXLM } from '../utils/stellar';
import SendPanel from './SendPanel';
import TransactionList from './TransactionList';

export default function Dashboard({ wallet, onDisconnect }) {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [funding, setFunding] = useState(false);
  const [fundMsg, setFundMsg] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const loadAccount = useCallback(async () => {
    setLoading(true); setError(''); setNotFound(false);
    try {
      setAccount(await getAccountDetails(wallet.publicKey));
      setTransactions(await getRecentTransactions(wallet.publicKey));
    } catch (err) {
      if (err?.response?.status === 404) setNotFound(true);
      else setError('Failed to load account.');
    } finally { setLoading(false); }
  }, [wallet.publicKey]);

  useEffect(() => { loadAccount(); }, [loadAccount]);

  async function handleFriendbot() {
    setFunding(true); setFundMsg('');
    try {
      await fundWithFriendbot(wallet.publicKey);
      setFundMsg('✓ Funded with 10,000 XLM!');
      await loadAccount();
    } catch (err) {
      setFundMsg('⚠ ' + (err.message || 'Funding failed.'));
    } finally { setFunding(false); }
  }

  function handleCopy() {
    navigator.clipboard.writeText(wallet.publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="dashboard">
      <div className="account-card">
        <div className="account-top">
          <div className="account-avatar">{wallet.publicKey.slice(0, 2)}</div>
          <div className="account-info">
            <div className="address-row">
              <span className="address-text">{formatAddress(wallet.publicKey, 8)}</span>
              <button className="copy-mini" onClick={handleCopy}>{copied ? '✓' : '⧉'}</button>
            </div>
            {account && <div className="account-meta">Seq: {account.sequence} · {account.subentryCount} entries</div>}
          </div>
          <button className="disconnect-btn" onClick={onDisconnect}>✕</button>
        </div>

        {loading ? (
          <div className="balance-loading">
            <div className="pulse-bar" /><div className="pulse-bar short" />
          </div>
        ) : notFound ? (
          <div className="not-found">
            <p>Account not yet activated on Testnet.</p>
            <button className="fund-btn" onClick={handleFriendbot} disabled={funding}>
              {funding ? 'Funding…' : '⚡ Fund with Friendbot'}
            </button>
            {fundMsg && <p className="fund-msg">{fundMsg}</p>}
          </div>
        ) : (
          <>
            <div className="balance-display">
              <div className="balance-label">Total Balance</div>
              <div className="balance-row">
                <span className="balance-amount">{formatXLM(account?.xlmBalance)}</span>
                <span className="balance-unit">XLM</span>
              </div>
            </div>
            <div className="account-actions">
              <button className="fund-btn small" onClick={handleFriendbot} disabled={funding}>
                {funding ? 'Funding…' : '⚡ Friendbot'}
              </button>
              <button className="refresh-btn" onClick={loadAccount}>↻ Refresh</button>
            </div>
            {fundMsg && <p className="fund-msg">{fundMsg}</p>}
          </>
        )}
        {error && <p className="form-error">{error}</p>}
      </div>

      {!notFound && !loading && (
        <>
          <div className="tab-bar">
            {['overview','send','history'].map(tab => (
              <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-panel">
                <h3 className="panel-title">Asset Balances</h3>
                <div className="asset-list">
                  {account?.balances?.map((b, i) => (
                    <div className="asset-row" key={i}>
                      <span className="asset-name">{b.asset_type === 'native' ? 'XLM' : b.asset_code}</span>
                      <span className="asset-balance">{formatXLM(b.balance)}</span>
                    </div>
                  ))}
                </div>
                <div className="info-box">
                  <p>🔑 Your address:<br /><code>{wallet.publicKey}</code></p>
                </div>
              </div>
            )}
            {activeTab === 'send' && <SendPanel wallet={wallet} onSent={loadAccount} />}
            {activeTab === 'history' && <TransactionList transactions={transactions} publicKey={wallet.publicKey} />}
          </div>
        </>
      )}
    </div>
  );
}
