import React, { useState, useRef } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Button } from '../components/ui/Button';
import { Printer, Save } from 'lucide-react';

export const CreateBill = () => {
  const { currentCompany, loading: companyLoading } = useCompany();
  const [loading, setLoading] = useState(false);

  const [billData, setBillData] = useState({
    logoText: 'TalkTalk\nBusiness',
    clientAddress: 'UPTIMEWORKERS LTD\n\nSUITE A 82\nJAMES CARTER ROAD, MILDENHALL\nBURY ST. EDMUNDS\nIP28 7DE\nUNITED KINGDOM',
    companyAddress: 'TalkTalk Business Direct,\nPO Box 674,\nSalford,\nM5 0NJ',
    phone: '0800 083 5903',
    accountNo: '882 01175234',
    invoiceNo: '21244367',
    invoiceDate: '22 oct 2024',
    dueDate: '26 oct 2024',
    prevBalance: 45.54,
    paymentReceived: 45.54,
    charges: [
      { id: 1, desc: 'Recurring Charges', amount: 33.95 },
      { id: 2, desc: 'Fixed Line Calls', amount: 0.00 },
      { id: 3, desc: 'Other Charges and Credits', amount: 4.00 }
    ],
    vatRate: 20,
    supportText: 'With Support Centre you can:\n+View your products and services\n+Track and manage orders\n+Diagnose and fix faults\n+View and manage bills\n+Request service changes\n\ntalktalkbusiness.co.uk/myprofile',
    promoText: 'Did you know you can save £4 per month by opting to receive your bill online? To go paperless:\n\nCall: 0808 250 3374\n\nVisit:\ntalktalkbusiness.co.uk/myprofile'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    if (!currentCompany) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'bills'), {
        companyId: currentCompany.id,
        billData: JSON.stringify(billData),
        createdAt: new Date().toISOString()
      });
      alert('Bill saved successfully!');
    } catch (error) {
      console.error('Error saving bill:', error);
      alert('Failed to save bill.');
    } finally {
      setLoading(false);
    }
  };

  const updateCharge = (id: number, field: string, value: string | number) => {
    setBillData(prev => ({
      ...prev,
      charges: prev.charges.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const addCharge = () => {
    setBillData(prev => ({
      ...prev,
      charges: [...prev.charges, { id: Date.now(), desc: 'New Charge', amount: 0 }]
    }));
  };

  const removeCharge = (id: number) => {
    setBillData(prev => ({
      ...prev,
      charges: prev.charges.filter(c => c.id !== id)
    }));
  };

  const balanceForward = billData.prevBalance - billData.paymentReceived;
  const subTotal = billData.charges.reduce((sum, c) => sum + Number(c.amount), 0);
  const vat = subTotal * (billData.vatRate / 100);
  const totalDue = balanceForward + subTotal + vat;

  const InputClass = "bg-transparent border-transparent hover:border-slate-200 focus:border-indigo-500 focus:ring-0 p-0 m-0 resize-none";

  if (companyLoading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (!currentCompany) return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-bold text-slate-700 mb-2">No Company Found</h2>
      <p className="text-slate-500 mb-4">Please create a company in the settings first.</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Custom Utility Bill</h1>
          <p className="text-slate-500 mt-1">Create a bill using the TalkTalk format.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handlePrint()} className="gap-2">
            <Printer size={16} /> Print / PDF
          </Button>
          <Button onClick={handleSave} disabled={loading} className="gap-2">
            <Save size={16} /> {loading ? 'Saving...' : 'Save Bill'}
          </Button>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 print:border-0 print:shadow-none overflow-hidden">
        <div className="p-12 bg-white text-black font-sans text-sm" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
          
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="col-span-7 space-y-12">
              {/* Logo */}
              <div>
                <textarea 
                  className={`w-full text-4xl font-bold text-sky-500 leading-tight h-24 ${InputClass}`}
                  value={billData.logoText}
                  onChange={(e) => setBillData({...billData, logoText: e.target.value})}
                />
              </div>

              {/* Client Address */}
              <div>
                <textarea 
                  className={`w-full h-40 leading-snug uppercase ${InputClass}`}
                  value={billData.clientAddress}
                  onChange={(e) => setBillData({...billData, clientAddress: e.target.value})}
                />
              </div>

              {/* Invoice Summary */}
              <div>
                <h2 className="text-xl font-bold mb-4">Invoice Summary</h2>
                
                {/* Customer Details Box */}
                <div className="border border-black rounded-full px-4 py-1 mb-4 font-bold text-lg">
                  Customer Details
                </div>
                
                <div className="px-4 space-y-1 mb-8">
                  <div className="flex justify-between">
                    <span>Your Previous Balance</span>
                    <input 
                      type="number" 
                      className={`text-right w-24 ${InputClass}`}
                      value={billData.prevBalance}
                      onChange={(e) => setBillData({...billData, prevBalance: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Received</span>
                    <div className="flex items-center justify-end w-24">
                      <input 
                        type="number" 
                        className={`text-right w-16 ${InputClass}`}
                        value={billData.paymentReceived}
                        onChange={(e) => setBillData({...billData, paymentReceived: parseFloat(e.target.value) || 0})}
                      />
                      <span>CR</span>
                    </div>
                  </div>
                  <div className="flex justify-between font-bold mt-2">
                    <span>Balance Brought Forward</span>
                    <span>{balanceForward.toFixed(2)}</span>
                  </div>
                </div>

                {/* New Charges */}
                <div className="flex justify-between font-bold border-b border-black pb-1 mb-2 px-4">
                  <span>Summary of new charges</span>
                  <span>Amount(£)</span>
                </div>
                
                <div className="px-4 space-y-1 mb-6">
                  {billData.charges.map((charge) => (
                    <div key={charge.id} className="flex justify-between group">
                      <input 
                        className={`flex-1 ${InputClass}`}
                        value={charge.desc}
                        onChange={(e) => updateCharge(charge.id, 'desc', e.target.value)}
                      />
                      <input 
                        type="number" 
                        className={`text-right w-24 ${InputClass}`}
                        value={charge.amount}
                        onChange={(e) => updateCharge(charge.id, 'amount', parseFloat(e.target.value) || 0)}
                      />
                      <button onClick={() => removeCharge(charge.id)} className="text-red-500 opacity-0 group-hover:opacity-100 print:hidden ml-2">×</button>
                    </div>
                  ))}
                  <button onClick={addCharge} className="text-indigo-500 text-xs print:hidden mt-2">+ Add Charge</button>
                </div>

                {/* Totals */}
                <div className="px-4 space-y-1 mb-4">
                  <div className="flex justify-between">
                    <span>Sub Total Excluding VAT</span>
                    <span>{subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <span>Vat @</span>
                      <input 
                        type="number" 
                        className={`w-8 ${InputClass}`}
                        value={billData.vatRate}
                        onChange={(e) => setBillData({...billData, vatRate: parseFloat(e.target.value) || 0})}
                      />
                      <span>%</span>
                    </div>
                    <span>{vat.toFixed(2)}</span>
                  </div>
                </div>

                {/* Total Due Box */}
                <div className="border border-black rounded-full px-4 py-2 flex justify-between items-center font-bold text-lg mb-8">
                  <span className="uppercase tracking-wide">Total Now Due</span>
                  <span>{totalDue.toFixed(2)}</span>
                </div>

                {/* Bottom Promo Box */}
                <div className="border border-black p-4 text-center text-xs">
                  <h3 className="font-bold text-sm mb-2">Have your business needs changed?</h3>
                  <p>As part of your service, we can complete a health check of your connectivity and voice tech to see if we can help your changing business needs. Simply call your account team on 0808 274 9543</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-5 border-l border-black pl-6">
              <div className="space-y-8">
                {/* Company Info */}
                <div>
                  <textarea 
                    className={`w-full h-24 text-xs ${InputClass}`}
                    value={billData.companyAddress}
                    onChange={(e) => setBillData({...billData, companyAddress: e.target.value})}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                    </svg>
                    <input 
                      className={`text-2xl font-bold w-full ${InputClass}`}
                      value={billData.phone}
                      onChange={(e) => setBillData({...billData, phone: e.target.value})}
                    />
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="space-y-1 text-xs font-bold">
                  <div className="grid grid-cols-2">
                    <span>ACCOUNT No.</span>
                    <input 
                      className={`text-right font-normal ${InputClass}`}
                      value={billData.accountNo}
                      onChange={(e) => setBillData({...billData, accountNo: e.target.value})}
                    />
                  </div>
                  <div className="h-4"></div>
                  <div className="grid grid-cols-2">
                    <span>INVOICE No.</span>
                    <input 
                      className={`text-right font-normal ${InputClass}`}
                      value={billData.invoiceNo}
                      onChange={(e) => setBillData({...billData, invoiceNo: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2">
                    <span>INVOICE DATE</span>
                    <input 
                      className={`text-right font-normal ${InputClass}`}
                      value={billData.invoiceDate}
                      onChange={(e) => setBillData({...billData, invoiceDate: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2">
                    <span>DUE DATE</span>
                    <input 
                      className={`text-right font-normal ${InputClass}`}
                      value={billData.dueDate}
                      onChange={(e) => setBillData({...billData, dueDate: e.target.value})}
                    />
                  </div>
                  <div className="text-center font-normal mt-6">
                    Page 1 of 5
                  </div>
                </div>

                {/* Support Box */}
                <div className="border border-black p-4 text-center text-xs">
                  <h3 className="font-bold mb-4">Support centre – your one<br/>stop shop</h3>
                  <textarea 
                    className={`w-full h-40 text-center ${InputClass}`}
                    value={billData.supportText}
                    onChange={(e) => setBillData({...billData, supportText: e.target.value})}
                  />
                </div>

                {/* Promo Box */}
                <div className="border border-black p-4 text-center text-xs">
                  <h3 className="font-bold mb-4">Go green, go paperless</h3>
                  <textarea 
                    className={`w-full h-32 text-center ${InputClass}`}
                    value={billData.promoText}
                    onChange={(e) => setBillData({...billData, promoText: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-4 border-t border-transparent text-[8px] text-slate-500">
            <p>TalkTalk Business is a trading name of TalkTalk Business Direct Limited. Registered office: Soapworks, Ordsall Lane, Salford, M5 3TT Registered in England and Wales No. 11347230 VAT No. 744 0320 68 Part of the TalkTalk Group.</p>
            <div className="mt-2 text-sky-500 font-bold text-xl leading-none">
              TalkTalk<br/>Business
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
