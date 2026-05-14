import React, { useState } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Button } from '../components/ui/Button';
import { Printer, Save, History, Search, User } from 'lucide-react';

export const CreatePayslip = () => {
  const { currentCompany, loading: companyLoading } = useCompany();
  const [loading, setLoading] = useState(false);
  const [savedPayslips, setSavedPayslips] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [payslipData, setPayslipData] = useState({
    companyPhone: '',
    companyEmail: '',
    period: 'March 2026',
    employeeDetails: [
      { id: 1, label: 'Employee Name:', value: 'John Doe' },
      { id: 2, label: 'Employee ID:', value: 'EMP-001' },
      { id: 3, label: 'Designation:', value: 'Software Engineer' },
      { id: 4, label: 'Department:', value: 'Engineering' },
      { id: 5, label: 'Bank Name:', value: 'Global Bank' },
      { id: 6, label: 'Bank A/C No:', value: 'XXXX-XXXX-1234' }
    ],
    earnings: [
      { id: 1, desc: 'Basic Salary', amount: 5000 },
      { id: 2, desc: 'House Rent Allowance', amount: 1500 },
      { id: 3, desc: 'Conveyance', amount: 500 },
      { id: 4, desc: 'Medical Allowance', amount: 300 }
    ],
    deductions: [
      { id: 1, desc: 'Income Tax', amount: 800 },
      { id: 2, desc: 'Provident Fund', amount: 250 }
    ],
    signatures: [
      { id: 1, label: 'Account Signature', hasPaidStamp: false, width: 200, xOffset: 0 },
      { id: 2, label: 'Employee Signature', hasPaidStamp: false, width: 200, xOffset: 0 }
    ],
    notes: ''
  });

  React.useEffect(() => {
    if (currentCompany) {
      setPayslipData(prev => ({
        ...prev,
        companyPhone: prev.companyPhone || currentCompany.phone || '',
        companyEmail: prev.companyEmail || currentCompany.email || ''
      }));
      fetchSavedPayslips();
    }
  }, [currentCompany]);

  const fetchSavedPayslips = async () => {
    if (!currentCompany) return;
    try {
      const q = query(
        collection(db, 'payslips'),
        where('companyId', '==', currentCompany.id),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedPayslips(docs);
    } catch (error) {
      console.error("Error fetching saved payslips:", error);
    }
  };

  const loadPayslip = (data: any) => {
    setPayslipData({
      companyPhone: data.companyPhone || payslipData.companyPhone,
      companyEmail: data.companyEmail || payslipData.companyEmail,
      period: data.period || payslipData.period,
      employeeDetails: data.employeeDetails || [
        { id: 1, label: 'Employee Name:', value: data.employeeName || '' },
        { id: 2, label: 'Employee ID:', value: '' },
        { id: 3, label: 'Designation:', value: '' },
        { id: 4, label: 'Department:', value: '' },
        { id: 5, label: 'Bank Name:', value: '' },
        { id: 6, label: 'Bank A/C No:', value: '' }
      ],
      earnings: data.earnings || [],
      deductions: data.deductions || [],
      signatures: data.signatures || payslipData.signatures,
      notes: data.notes || ''
    });
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    if (!currentCompany) return;
    setLoading(true);
    try {
      const employeeNameField = payslipData.employeeDetails.find(d => d.label.toLowerCase().includes('name'));
      const employeeName = employeeNameField ? employeeNameField.value : 'Unknown Employee';

      await addDoc(collection(db, 'payslips'), {
        companyId: currentCompany.id,
        employeeName: employeeName,
        period: payslipData.period,
        employeeDetails: payslipData.employeeDetails,
        earnings: payslipData.earnings,
        deductions: payslipData.deductions,
        signatures: payslipData.signatures,
        notes: payslipData.notes,
        netPay: totalEarnings - totalDeductions,
        createdAt: new Date().toISOString()
      });
      alert('Payslip saved successfully!');
      fetchSavedPayslips();
    } catch (error) {
      console.error('Error saving payslip:', error);
      alert('Failed to save payslip.');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (type: 'earnings' | 'deductions', id: number, field: string, value: string | number) => {
    setPayslipData(prev => ({
      ...prev,
      [type]: prev[type].map((item: any) => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const updateDetail = (id: number, field: string, value: string) => {
    setPayslipData(prev => ({
      ...prev,
      employeeDetails: prev.employeeDetails.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addDetail = () => {
    setPayslipData(prev => ({
      ...prev,
      employeeDetails: [...prev.employeeDetails, { id: Date.now(), label: 'New Field:', value: '' }]
    }));
  };

  const removeDetail = (id: number) => {
    setPayslipData(prev => ({
      ...prev,
      employeeDetails: prev.employeeDetails.filter(item => item.id !== id)
    }));
  };

  const updateSignature = (id: number, field: string, value: string | boolean | number) => {
    setPayslipData(prev => ({
      ...prev,
      signatures: prev.signatures.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addSignature = () => {
    setPayslipData(prev => ({
      ...prev,
      signatures: [...prev.signatures, { id: Date.now(), label: 'New Signature', hasPaidStamp: false, width: 200, xOffset: 0 }]
    }));
  };

  const removeSignature = (id: number) => {
    setPayslipData(prev => ({
      ...prev,
      signatures: prev.signatures.filter(item => item.id !== id)
    }));
  };

  const addItem = (type: 'earnings' | 'deductions') => {
    setPayslipData(prev => ({
      ...prev,
      [type]: [...prev[type], { id: Date.now(), desc: 'New Item', amount: 0 }]
    }));
  };

  const removeItem = (type: 'earnings' | 'deductions', id: number) => {
    setPayslipData(prev => ({
      ...prev,
      [type]: prev[type].filter((item: any) => item.id !== id)
    }));
  };

  const totalEarnings = payslipData.earnings.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalDeductions = payslipData.deductions.reduce((sum, item) => sum + Number(item.amount), 0);
  const netPay = totalEarnings - totalDeductions;

  const InputClass = "bg-transparent border-transparent hover:border-slate-200 focus:border-indigo-500 focus:ring-0 p-0 m-0 resize-none";

  if (companyLoading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (!currentCompany) return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-bold text-slate-700 mb-2">No Company Found</h2>
      <p className="text-slate-500 mb-4">Please create a company in the settings first.</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create Payslip</h1>
          <p className="text-slate-500 mt-1">Generate a professional salary slip for your employees.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Button 
              variant="outline" 
              onClick={() => setShowHistory(!showHistory)} 
              className={`gap-2 ${showHistory ? 'bg-slate-100' : ''}`}
            >
              <History size={16} /> History
            </Button>
            
            {showHistory && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 shadow-xl rounded-lg z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-500">Recent Payslips</span>
                  <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600">×</button>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {savedPayslips.length > 0 ? (
                    savedPayslips.map((ps) => (
                      <button
                        key={ps.id}
                        onClick={() => loadPayslip(ps)}
                        className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100">
                            <User size={14} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{ps.employeeName}</div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-2">
                              <span>{ps.period}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                              <span>{new Date(ps.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      No saved payslips found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Button variant="outline" onClick={() => handlePrint()} className="gap-2">
            <Printer size={16} /> Print / PDF
          </Button>
          <Button onClick={handleSave} disabled={loading} className="gap-2">
            <Save size={16} /> {loading ? 'Saving...' : 'Save Payslip'}
          </Button>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 print:border-0 print:shadow-none overflow-hidden">
        <div className="p-8 text-slate-800 font-sans text-sm" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
          
          {/* Header */}
          <div className="text-center mb-4 border-b border-slate-300 pb-4">
            <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-wider">{currentCompany.name}</h1>
            {currentCompany.address && <p className="text-slate-600 mt-1 whitespace-pre-line text-xs">{currentCompany.address}</p>}
            
            <div className="flex justify-center gap-6 mt-1 text-slate-600 text-xs">
              <div className="flex items-center gap-1">
                <span className="font-semibold">Phone:</span>
                <input 
                  className={`w-32 text-center ${InputClass}`}
                  value={payslipData.companyPhone}
                  onChange={(e) => setPayslipData({...payslipData, companyPhone: e.target.value})}
                  placeholder="Add Phone"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold">Email:</span>
                <input 
                  className={`w-48 text-center ${InputClass}`}
                  value={payslipData.companyEmail}
                  onChange={(e) => setPayslipData({...payslipData, companyEmail: e.target.value})}
                  placeholder="Add Email"
                />
              </div>
            </div>

            <div className="mt-4">
              <h2 className="text-xl font-bold text-slate-800 tracking-widest">PAYSLIP</h2>
              <div className="flex items-center justify-center gap-2 mt-1 text-slate-600 font-medium">
                <span>For the month of</span>
                <input 
                  className={`w-32 text-center font-bold border-b border-slate-300 ${InputClass}`}
                  value={payslipData.period}
                  onChange={(e) => setPayslipData({...payslipData, period: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Employee Details */}
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-x-12 gap-y-2">
              {payslipData.employeeDetails.map((detail) => (
                <div key={detail.id} className="flex items-center gap-2 group relative">
                  <input 
                    className={`w-32 font-semibold text-slate-600 ${InputClass}`}
                    value={detail.label}
                    onChange={(e) => updateDetail(detail.id, 'label', e.target.value)}
                  />
                  <input 
                    className={`flex-1 ${detail.label.toLowerCase().includes('name') ? 'font-bold' : ''} ${InputClass}`}
                    value={detail.value}
                    onChange={(e) => updateDetail(detail.id, 'value', e.target.value)}
                  />
                  <button 
                    onClick={() => removeDetail(detail.id)} 
                    className="absolute -right-6 text-red-500 opacity-0 group-hover:opacity-100 print:hidden"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addDetail} className="text-indigo-500 text-xs print:hidden mt-4">+ Add Detail Field</button>
          </div>

          {/* Salary Details Table */}
          <div className="border border-slate-300 rounded-sm overflow-hidden mb-4">
            <div className="grid grid-cols-2 divide-x divide-slate-300">
              
              {/* Earnings Column */}
              <div>
                <div className="bg-slate-100 font-bold px-4 py-1 border-b border-slate-300 flex justify-between text-xs">
                  <span>Earnings</span>
                  <span>Amount</span>
                </div>
                <div className="p-4 space-y-1 min-h-[150px]">
                  {payslipData.earnings.map((item) => (
                    <div key={item.id} className="flex justify-between group">
                      <input 
                        className={`flex-1 ${InputClass}`}
                        value={item.desc}
                        onChange={(e) => updateItem('earnings', item.id, 'desc', e.target.value)}
                      />
                      <input 
                        type="number" 
                        className={`text-right w-24 ${InputClass}`}
                        value={item.amount}
                        onChange={(e) => updateItem('earnings', item.id, 'amount', parseFloat(e.target.value) || 0)}
                      />
                      <button onClick={() => removeItem('earnings', item.id)} className="text-red-500 opacity-0 group-hover:opacity-100 print:hidden ml-2">×</button>
                    </div>
                  ))}
                  <button onClick={() => addItem('earnings')} className="text-indigo-500 text-[10px] print:hidden mt-1">+ Add Earning</button>
                </div>
                <div className="bg-slate-50 font-bold px-4 py-2 border-t border-slate-300 flex justify-between text-xs">
                  <span>Total Earnings</span>
                  <span>{totalEarnings.toFixed(2)}</span>
                </div>
              </div>

              {/* Deductions Column */}
              <div>
                <div className="bg-slate-100 font-bold px-4 py-1 border-b border-slate-300 flex justify-between text-xs">
                  <span>Deductions</span>
                  <span>Amount</span>
                </div>
                <div className="p-4 space-y-1 min-h-[150px]">
                  {payslipData.deductions.map((item) => (
                    <div key={item.id} className="flex justify-between group">
                      <input 
                        className={`flex-1 ${InputClass}`}
                        value={item.desc}
                        onChange={(e) => updateItem('deductions', item.id, 'desc', e.target.value)}
                      />
                      <input 
                        type="number" 
                        className={`text-right w-24 ${InputClass}`}
                        value={item.amount}
                        onChange={(e) => updateItem('deductions', item.id, 'amount', parseFloat(e.target.value) || 0)}
                      />
                      <button onClick={() => removeItem('deductions', item.id)} className="text-red-500 opacity-0 group-hover:opacity-100 print:hidden ml-2">×</button>
                    </div>
                  ))}
                  <button onClick={() => addItem('deductions')} className="text-indigo-500 text-[10px] print:hidden mt-1">+ Add Deduction</button>
                </div>
                <div className="bg-slate-50 font-bold px-4 py-2 border-t border-slate-300 flex justify-between text-xs">
                  <span>Total Deductions</span>
                  <span>{totalDeductions.toFixed(2)}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Net Pay */}
          <div className="flex justify-end mb-8">
            <div className="w-1/2 border border-slate-300 rounded-sm">
              <div className="bg-slate-800 text-white font-bold px-4 py-2 flex justify-between text-base">
                <span>Net Pay</span>
                <span>{netPay.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-16">
            <div className={`grid grid-cols-${Math.min(payslipData.signatures.length, 3)} gap-12 relative`}>
              {payslipData.signatures.map((sig) => (
                <div 
                  key={sig.id} 
                  className="relative group flex flex-col items-center"
                  style={{ 
                    width: `${sig.width}px`,
                    transform: `translateX(${sig.xOffset}px)`
                  }}
                >
                  {sig.hasPaidStamp && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 -rotate-12 border-4 border-red-500/50 text-red-500/50 font-bold text-3xl px-4 py-1 rounded-lg uppercase tracking-widest pointer-events-none select-none">
                      PAID
                    </div>
                  )}
                  <div className="border-t border-slate-400 pt-1 w-full relative">
                    <input 
                      className={`w-full text-center font-semibold text-slate-600 text-xs ${InputClass}`}
                      value={sig.label}
                      onChange={(e) => updateSignature(sig.id, 'label', e.target.value)}
                    />
                    
                    {/* Controls Overlay */}
                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 print:hidden transition-opacity bg-white shadow-xl border border-slate-200 p-3 rounded-lg z-10 w-48">
                      <div className="flex gap-2 w-full">
                        <button 
                          onClick={() => updateSignature(sig.id, 'hasPaidStamp', !sig.hasPaidStamp)}
                          className={`flex-1 text-[10px] px-2 py-1 rounded border font-medium ${sig.hasPaidStamp ? 'bg-red-100 border-red-300 text-red-600' : 'bg-slate-100 border-slate-300 text-slate-600'}`}
                        >
                          {sig.hasPaidStamp ? 'Remove Stamp' : 'Add PAID Stamp'}
                        </button>
                        <button 
                          onClick={() => removeSignature(sig.id)}
                          className="text-red-500 hover:bg-red-50 font-bold px-2 rounded border border-transparent"
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className="w-full space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Width</span>
                          <span>{sig.width}px</span>
                        </div>
                        <input 
                          type="range" min="100" max="400" 
                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                          value={sig.width}
                          onChange={(e) => updateSignature(sig.id, 'width', parseInt(e.target.value))}
                        />
                      </div>

                      <div className="w-full space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Position</span>
                          <span>{sig.xOffset}px</span>
                        </div>
                        <input 
                          type="range" min="-200" max="200" 
                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                          value={sig.xOffset}
                          onChange={(e) => updateSignature(sig.id, 'xOffset', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center print:hidden">
              <button onClick={addSignature} className="text-indigo-500 text-[10px] font-medium hover:underline flex items-center gap-1">
                <span className="text-lg">+</span> Add Signature Field
              </button>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mt-8 pt-4 border-t border-slate-200">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Notes / Remarks:</h3>
            <textarea 
              className={`w-full min-h-[60px] text-slate-600 leading-relaxed text-xs ${InputClass}`}
              placeholder="Add any additional notes or remarks here..."
              value={payslipData.notes}
              onChange={(e) => setPayslipData({...payslipData, notes: e.target.value})}
            />
          </div>

        </div>
      </div>
    </div>
  );
};
