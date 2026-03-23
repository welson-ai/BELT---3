import { useState } from 'react';
import { sendXLM, isValidPublicKey } from '../utils/stellar';

export default function SendPanel({ wallet, onSent }) {
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [txHash, setTxHash] = useState('');
  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (!destination.trim()) errs.destination = 'Destination is required.';
    else if (!isValidPublicKey(destination.trim())) errs.destination = 'Not a valid Stellar public key.';
    else if (destination.trim() === wallet.publicKey) errs.destination = 'Cannot send to yourself.';
    if (!amount.trim()) errs.amount = 'Amount is required.';
    else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) errs.amount = 'Enter a valid positive amount.';
    if (memo && memo.length > 28) errs.memo = 'Memo must be 28 characters or less.';
    return errs;
  }

  async function handleSend(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setStatus('sending'); setMessage(''); setTxHash('');
    try {
      const result = await sendXLM(wallet.secretKey, destination.trim(), parseFloat(amount).toFixed(7), memo.trim());
      setTxHash(result.hash);
      setStatus('success');
      setMessage(`Successfully sent ${amount} XLM!`);
      setDestination(''); setAmount(''); setMemo('');
      onSent?.();
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Transaction failed.');
    }
  }

  if (status === 'success') return (
    <div className="send-success">
      <div className="success-icon">✓</div>
      <h3>Transaction Sent!</h3>
      <p>{message}</p>
      {txHash && (
        <a className="tx-link" href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} target="_blank" rel="noreferrer">
          View on Explorer ↗
        </a>
      )}
      <button className="cta-btn" onClick={() => { setStatus('idle'); setMessage(''); }}>Send Another</button>
    </div>
  );

  return (
    <form className="send-form" onSubmit={handleSend}>
      <h3 className="panel-title">Send XLM</h3>
      <div className="field">
        <label>Recipient Address</label>
        <input type="text" placeholder="G..." value={destination}
          onChange={(e) => { setDestination(e.target.value); setErrors(p => ({...p, destination: ''})); }}
          disabled={status === 'sending'} spellCheck="false" />
        {errors.destination && <p className="field-error">{errors.destination}</p>}
      </div>
      <div className="field">
        <label>Amount (XLM)</label>
        <input type="number" placeholder="0.00" min="0.0000001" step="any" value={amount}
          onChange={(e) => { setAmount(e.target.value); setErrors(p => ({...p, amount: ''})); }}
          disabled={status === 'sending'} />
        {errors.amount && <p className="field-error">{errors.amount}</p>}
      </div>
      <div className="field">
        <label>Memo <span className="optional">(optional, max 28 chars)</span></label>
        <input type="text" placeholder="Payment note..." maxLength={28} value={memo}
          onChange={(e) => setMemo(e.target.value)} disabled={status === 'sending'} />
        {errors.memo && <p className="field-error">{errors.memo}</p>}
      </div>
      {status === 'error' && <div className="form-error send-error">{message}</div>}
      <button type="submit" className="cta-btn send" disabled={status === 'sending'}>
        {status === 'sending' ? <span className="sending-label"><span className="spinner" />Sending…</span> : 'Send XLM →'}
      </button>
    </form>
  );
}
