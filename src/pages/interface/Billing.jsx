import React, { useEffect, useState, useContext } from 'react';
import Sidebar from '../../components/Sidebar';
import { AuthContext } from '../../components/AuthContext';

export default function Billing() {
  const { user } = useContext(AuthContext);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/billing', {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Failed to fetch billing data');
        }

        const data = await res.json();
        setPaymentMethod(data.paymentMethod || null);
        setInvoices(data.invoices || []);
      } catch (err) {
        console.error('❌ Billing fetch failed:', err.message);
      }
    };

    fetchBillingData();
  }, []);

  return (
    <div className="billing-layout">
      <Sidebar />

      <main className="billing-main">
        <h1 className="billing-title">Billing</h1>

        <div className="billing-card">
          <h2 className="billing-subtitle">Payment Method</h2>

          {paymentMethod ? (
            <div className="billing-payment-info">
              <p><strong>Card:</strong> {paymentMethod.card.brand.toUpperCase()} •••• {paymentMethod.card.last4}</p>
              <p><strong>Expires:</strong> {paymentMethod.card.exp_month}/{paymentMethod.card.exp_year}</p>
            </div>
          ) : (
            <p>No payment method saved yet.</p>
          )}

          <button className="billing-add-button">+ Add Payment Method</button>
        </div>

        <div className="billing-card">
          <h2 className="billing-subtitle">Invoice History</h2>

          {invoices.length === 0 ? (
            <p className="billing-description">No invoices available yet.</p>
          ) : (
            <div className="billing-table">
              <div className="billing-table-header">
                <span>Date</span>
                <span>Invoice Number</span>
                <span>Amount</span>
                <span>Download</span>
              </div>

              {invoices.map((invoice, index) => (
                <div className="billing-table-row" key={index}>
                  <span>{invoice.date}</span>
                  <span>{invoice.number}</span>
                  <span>£{invoice.amount}</span>
                  <a
                    href={invoice.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="billing-download-icon"
                  >
                    📥
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
