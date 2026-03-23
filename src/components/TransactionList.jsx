import { formatAddress } from '../utils/stellar';

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function TransactionList({ transactions, publicKey }) {
  if (!transactions?.length) return (
    <div className="tx-empty">
      <span className="tx-empty-icon">◎</span>
      <p>No transactions yet.</p>
    </div>
  );

  return (
    <div className="tx-list">
      <h3 className="panel-title">Recent Transactions</h3>
      {transactions.map((tx) => {
        const isSource = tx.source_account === publicKey;
        return (
          <div key={tx.id} className="tx-row">
            <div className={`tx-direction ${isSource ? 'out' : 'in'}`}>{isSource ? '↑' : '↓'}</div>
            <div className="tx-details">
              <div className="tx-hash">
                <a href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`} target="_blank" rel="noreferrer">
                  {formatAddress(tx.hash, 8)}
                </a>
              </div>
              <div className="tx-meta">
                {isSource ? 'Sent' : `From ${formatAddress(tx.source_account, 4)}`}
                {tx.memo && <span className="tx-memo"> · "{tx.memo}"</span>}
              </div>
            </div>
            <div className="tx-time">{timeAgo(tx.created_at)}</div>
            <div className={`tx-status ${tx.successful ? 'ok' : 'fail'}`}>{tx.successful ? '✓' : '✗'}</div>
          </div>
        );
      })}
    </div>
  );
}
