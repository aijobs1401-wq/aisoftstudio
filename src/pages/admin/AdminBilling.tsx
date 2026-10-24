import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  CreditCard,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Zap,
  DollarSign,
  Package,
  FileText,
  Sparkles,
  ArrowUpRight,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function AdminBilling() {
  const { session, profile, role } = useAuth();
  const token = session?.access_token || localStorage.getItem('sb-access-token') || '';

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [adminPlans, setAdminPlans] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Admin Plan form
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formMonthlyPrice, setFormMonthlyPrice] = useState('999');
  const [formYearlyPrice, setFormYearlyPrice] = useState('9990');
  const [formAccounts, setFormAccounts] = useState('1');
  const [formMessages, setFormMessages] = useState('2000');
  const [formContacts, setFormContacts] = useState('1000');

  const fetchBillingData = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        fetch('/api/billing/plans'),
        fetch('/api/billing/subscription', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const plansData = await plansRes.json();
      const subData = await subRes.json();

      if (plansRes.ok) setPlans(plansData);
      if (subRes.ok) setSubscriptionData(subData);

      if (role === 'admin') {
        const adminPlansRes = await fetch('/api/admin/billing/plans', { headers: { Authorization: `Bearer ${token}` } });
        const adminPlansData = await adminPlansRes.json();
        if (adminPlansRes.ok) setAdminPlans(adminPlansData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBillingData();
    }
  }, [token, role]);

  const handleCheckout = async (planId: string) => {
    try {
      setError(null);
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plan_id: planId, billing_cycle: billingCycle })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Initialize Razorpay Checkout or simulate test sandbox payment
      if (window.Razorpay) {
        const options = {
          key: data.key_id,
          amount: data.amount,
          currency: data.currency,
          name: 'AI SOFT STUDIO',
          description: 'Subscription Plan Renewal / Upgrade',
          order_id: data.order_id,
          handler: async (response: any) => {
            const verifyRes = await fetch('/api/billing/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                order_id: data.order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                transaction_id: data.transaction_id
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              setSuccessMsg('Payment verified and subscription activated successfully!');
              fetchBillingData();
            } else {
              setError(verifyData.error);
            }
          },
          prefill: {
            name: profile?.full_name || 'Valued Client',
            email: profile?.email || 'client@domain.com'
          },
          theme: { color: '#8B5CF6' }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback simulation for sandbox testing
        const verifyRes = await fetch('/api/billing/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            order_id: data.order_id,
            payment_id: 'pay_sandbox_' + Date.now(),
            signature: 'sandbox_sig_' + Date.now(),
            transaction_id: data.transaction_id
          })
        });
        if (verifyRes.ok) {
          setSuccessMsg('Sandbox payment simulated successfully! Subscription active.');
          fetchBillingData();
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSaveAdminPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/billing/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: editingPlan?.id,
          name: formName,
          description: formDesc,
          monthly_price: Number(formMonthlyPrice),
          yearly_price: Number(formYearlyPrice),
          max_whatsapp_accounts: Number(formAccounts),
          max_monthly_messages: Number(formMessages),
          max_contacts: Number(formContacts),
          max_campaigns_per_month: 50,
          max_automation_rules: 50,
          is_active: true,
          features: ['Configured by Super Admin']
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Subscription plan saved successfully.');
        setShowPlanModal(false);
        setEditingPlan(null);
        fetchBillingData();
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const currentSub = subscriptionData?.subscription;
  const currentPlan = currentSub?.subscription_plans;
  const usage = subscriptionData?.usage || { whatsapp_accounts: 0, contacts: 0, campaigns: 0, messages_sent: 0 };

  return (
    <AdminLayout activePath="/admin/billing" title="Subscription & Billing">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-[#090D1F] border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cyan-400" />
              <span>Subscription, Billing & Usage Quotas</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Manage your workspace subscription plan, review resource utilization, invoices, and secure payment history.
            </p>
          </div>
          {role === 'admin' && (
            <button
              onClick={() => {
                setEditingPlan(null);
                setFormName('');
                setFormDesc('');
                setShowPlanModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-opacity cursor-pointer"
            >
              + Create Plan (Super Admin)
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Current Subscription Status Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#090D1F] border border-white/10 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">Current Subscription Plan</div>
                <h3 className="text-xl font-bold text-white mt-0.5">{currentPlan?.name || 'Starter Trial Plan'}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider border ${currentSub?.status === 'active' ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30' : 'bg-amber-950 text-amber-300 border-amber-500/30'}`}>
                {currentSub?.status || 'trialing'}
              </span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              {currentPlan?.description || 'Enjoy full access to automated WhatsApp customer support and broadcast marketing features during your trial period.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-white/5">
              <div>
                <div className="text-[10px] font-mono text-gray-400">Billing Cycle</div>
                <div className="text-xs font-bold text-white uppercase mt-0.5">{currentSub?.billing_cycle || 'monthly'}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-gray-400">Renewal / Expiry</div>
                <div className="text-xs font-bold text-white font-mono mt-0.5">
                  {currentSub?.current_period_end ? new Date(currentSub.current_period_end).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-gray-400">Currency</div>
                <div className="text-xs font-bold text-white font-mono mt-0.5">{currentPlan?.currency || 'INR'}</div>
              </div>
            </div>
          </div>

          {/* Usage Quotas Card */}
          <div className="bg-[#090D1F] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Resource Quotas & Usage</span>
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">WhatsApp Accounts</span>
                  <span className="font-mono text-white">{usage.whatsapp_accounts} / {currentPlan?.max_whatsapp_accounts || 1}</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full rounded-full"
                    style={{ width: `${Math.min(100, (usage.whatsapp_accounts / (currentPlan?.max_whatsapp_accounts || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">Contacts Directory</span>
                  <span className="font-mono text-white">{usage.contacts} / {currentPlan?.max_contacts || 500}</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-violet-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (usage.contacts / (currentPlan?.max_contacts || 500)) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">Monthly Messages</span>
                  <span className="font-mono text-white">{usage.messages_sent} / {currentPlan?.max_monthly_messages || 1000}</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full"
                    style={{ width: `${Math.min(100, (usage.messages_sent / (currentPlan?.max_monthly_messages || 1000)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Selection & Upgrade */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" />
              <span>Available Subscription Tiers</span>
            </h3>
            <div className="flex items-center gap-2 bg-[#050711] border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${billingCycle === 'monthly' ? 'bg-cyan-500 text-black font-bold' : 'text-gray-400 hover:text-white'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${billingCycle === 'yearly' ? 'bg-cyan-500 text-black font-bold' : 'text-gray-400 hover:text-white'}`}
              >
                Yearly (Save 17%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => {
              const price = billingCycle === 'yearly' ? p.yearly_price : p.monthly_price;
              const isCurrent = currentSub?.plan_id === p.id;

              return (
                <div
                  key={p.id}
                  className={`bg-[#090D1F] border rounded-2xl p-6 flex flex-col justify-between space-y-6 relative transition-all ${isCurrent ? 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.15)]' : 'border-white/10 hover:border-white/20'}`}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-400 text-black font-bold text-[10px] uppercase tracking-wider">
                      Current Plan
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="text-base font-bold text-white">{p.name}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{p.description}</p>
                    <div className="pt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-white font-mono">₹{price}</span>
                      <span className="text-xs text-gray-400 font-mono">/ {billingCycle}</span>
                    </div>

                    <ul className="space-y-2 pt-3 border-t border-white/5 text-xs text-gray-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{p.max_whatsapp_accounts} WhatsApp Account(s)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{p.max_monthly_messages.toLocaleString()} Messages / month</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{p.max_contacts.toLocaleString()} Contacts Directory</span>
                      </li>
                      {(p.features || []).map((f: string, i: number) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    disabled={isCurrent}
                    onClick={() => handleCheckout(p.id)}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isCurrent ? 'bg-white/10 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20 hover:opacity-95'}`}
                  >
                    {isCurrent ? 'Active Plan' : 'Upgrade / Renew Now'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment History & Invoices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#090D1F] border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Invoices & Receipts</span>
            </h3>
            <div className="space-y-2">
              {(subscriptionData?.invoices || []).map((inv: any) => (
                <div key={inv.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono font-bold text-white">{inv.invoice_number}</div>
                    <div className="text-[10px] text-gray-400">{new Date(inv.invoice_date).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-emerald-400">₹{inv.amount}</div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-950 text-emerald-300">
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
              {(!subscriptionData?.invoices || subscriptionData.invoices.length === 0) && (
                <div className="text-center py-6 text-gray-500 text-xs">No invoices generated yet.</div>
              )}
            </div>
          </div>

          <div className="bg-[#090D1F] border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              <span>Transaction History</span>
            </h3>
            <div className="space-y-2">
              {(subscriptionData?.transactions || []).map((tx: any) => (
                <div key={tx.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono text-white">{tx.order_id}</div>
                    <div className="text-[10px] text-gray-400">{new Date(tx.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-white">₹{tx.amount}</div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${tx.status === 'captured' ? 'bg-emerald-950 text-emerald-300' : 'bg-gray-800 text-gray-300'}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
              {(!subscriptionData?.transactions || subscriptionData.transactions.length === 0) && (
                <div className="text-center py-6 text-gray-500 text-xs">No payment transactions recorded yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Super Admin Plan Modal */}
        {showPlanModal && role === 'admin' && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#090D1F] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-sm font-bold text-white">Configure Subscription Plan</h3>
                <button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAdminPlan} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Pro Growth"
                    className="w-full bg-[#050711] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Description</label>
                  <input
                    type="text"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Brief overview of features"
                    className="w-full bg-[#050711] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Monthly Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={formMonthlyPrice}
                      onChange={(e) => setFormMonthlyPrice(e.target.value)}
                      className="w-full bg-[#050711] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Yearly Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={formYearlyPrice}
                      onChange={(e) => setFormYearlyPrice(e.target.value)}
                      className="w-full bg-[#050711] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">WABA Accounts</label>
                    <input
                      type="number"
                      required
                      value={formAccounts}
                      onChange={(e) => setFormAccounts(e.target.value)}
                      className="w-full bg-[#050711] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Messages/mo</label>
                    <input
                      type="number"
                      required
                      value={formMessages}
                      onChange={(e) => setFormMessages(e.target.value)}
                      className="w-full bg-[#050711] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Contacts</label>
                    <input
                      type="number"
                      required
                      value={formContacts}
                      onChange={(e) => setFormContacts(e.target.value)}
                      className="w-full bg-[#050711] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPlanModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-xs font-medium hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20"
                  >
                    Save Plan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
