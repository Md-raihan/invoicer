import React, { useState, useEffect, useRef } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { generateInvoiceNumber, formatCurrency } from '../lib/utils';
import { Plus, Trash2, ArrowLeft, Printer } from 'lucide-react';
import { format } from 'date-fns';

export const CreateInvoice = () => {
  const { currentCompany, loading: companyLoading } = useCompany();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);
  const [savedProducts, setSavedProducts] = useState<any[]>([]);
  
  const [invoiceData, setInvoiceData] = useState({
    clientId: '',
    clientName: '',
    invoiceNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Thank you for your business.',
    taxRate: 0,
    discount: 0,
    currency: 'USD',
  });

  const CURRENCIES = [
    { code: 'USD', label: 'US Dollar (USD)' },
    { code: 'EUR', label: 'Euro (EUR)' },
    { code: 'GBP', label: 'British Pound (GBP)' },
    { code: 'CAD', label: 'Canadian Dollar (CAD)' },
    { code: 'AUD', label: 'Australian Dollar (AUD)' },
    { code: 'BDT', label: 'Bangladeshi Taka (BDT)' },
    { code: 'INR', label: 'Indian Rupee (INR)' }
  ];

  const [items, setItems] = useState([{ id: Date.now(), description: '', quantity: 1, price: 0 }]);

  useEffect(() => {
    if (!currentCompany) return;

    const fetchInitialData = async () => {
      // Fetch Clients
      const clientQuery = query(collection(db, 'clients'), where('companyId', '==', currentCompany.id));
      const clientSnap = await getDocs(clientQuery);
      setClients(clientSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Fetch Products
      const prodQuery = query(collection(db, 'products'), where('companyId', '==', currentCompany.id));
      const prodSnap = await getDocs(prodQuery);
      setSavedProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      if (id) {
        // Fetch existing invoice
        try {
          const docRef = doc(db, 'invoices', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setInvoiceData({
              clientId: data.clientId || '',
              clientName: data.clientName || '',
              invoiceNumber: data.invoiceNumber || '',
              issueDate: data.issueDate || new Date().toISOString().split('T')[0],
              dueDate: data.dueDate || new Date().toISOString().split('T')[0],
              notes: data.notes || '',
              taxRate: data.taxRate || 0,
              discount: data.discount || 0,
              currency: data.currency || 'USD',
            });
            if (data.items && data.items.length > 0) {
              setItems(data.items.map((item: any, index: number) => ({
                id: index + Date.now(),
                description: item.description || '',
                quantity: item.quantity || 1,
                price: item.price || 0
              })));
            }
          }
        } catch (error) {
          console.error("Error fetching invoice", error);
        } finally {
          setIsFetching(false);
        }
      } else {
        // Fetch Last Invoice Number for new invoice
        const invQuery = query(
          collection(db, 'invoices'), 
          where('companyId', '==', currentCompany.id),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        const invSnap = await getDocs(invQuery);
        let lastNum = '';
        if (!invSnap.empty) {
          lastNum = invSnap.docs[0].data().invoiceNumber;
        }
        setInvoiceData(prev => ({ ...prev, invoiceNumber: generateInvoiceNumber(lastNum) }));
        setIsFetching(false);
      }
    };

    fetchInitialData();
  }, [currentCompany, id]);

  const handleItemChange = (id: number, field: string, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const taxAmount = subtotal * (invoiceData.taxRate / 100);
  const totalAmount = subtotal + taxAmount - invoiceData.discount;

  const handleSave = async () => {
    if (!currentCompany) return;
    if (!invoiceData.clientId) {
      alert("Please select a client");
      return;
    }

    setLoading(true);
    try {
      // Save unique items to products collection
      for (const item of items) {
        if (item.description.trim() !== '') {
          // Check if it already exists in savedProducts
          const exists = savedProducts.some(p => p.description.toLowerCase() === item.description.trim().toLowerCase());
          if (!exists) {
            await addDoc(collection(db, 'products'), {
              companyId: currentCompany.id,
              description: item.description.trim(),
              price: item.price
            });
            // Update local state temporarily to avoid saving it again if duplicate exist in current items array
            savedProducts.push({ description: item.description.trim() });
          }
        }
      }

      const client = clients.find(c => c.id === invoiceData.clientId);
      const invoicePayload: any = {
        companyId: currentCompany.id,
        clientId: invoiceData.clientId,
        clientName: client?.name || '',
        invoiceNumber: invoiceData.invoiceNumber,
        issueDate: invoiceData.issueDate,
        dueDate: invoiceData.dueDate,
        items: items.map(({ id, ...rest }) => ({ ...rest, total: rest.quantity * rest.price })),
        subtotal,
        taxRate: invoiceData.taxRate,
        taxAmount,
        discount: invoiceData.discount,
        totalAmount,
        currency: invoiceData.currency,
        notes: invoiceData.notes,
        updatedAt: new Date().toISOString()
      };
      
      if (id) {
        await updateDoc(doc(db, 'invoices', id), invoicePayload);
      } else {
        await addDoc(collection(db, 'invoices'), {
          ...invoicePayload,
          status: 'draft',
          createdAt: new Date().toISOString()
        });
      }
      
      navigate('/invoices');
    } catch (error) {
      console.error("Error saving invoice", error);
      alert("Failed to save invoice");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (companyLoading || isFetching) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (!currentCompany) return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-bold text-slate-700 mb-2">No Company Found</h2>
      <p className="text-slate-500 mb-4">Please create a company in the settings first.</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 print:max-w-none print:w-full print:mx-0 print:pb-0">
      <div className="flex justify-between items-center print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/invoices')}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create Invoice</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handlePrint()} className="gap-2">
            <Printer size={16} /> Print / PDF
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Invoice'}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 print:border-0 print:shadow-none print:p-12">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">{currentCompany.name}</h2>
            {currentCompany.address && <p className="text-slate-500 mt-1 whitespace-pre-line">{currentCompany.address}</p>}
            {currentCompany.phone && <p className="text-slate-500 mt-1">Phone: {currentCompany.phone}</p>}
            {currentCompany.email && <p className="text-slate-500">Email: {currentCompany.email}</p>}
            {currentCompany.taxId && <p className="text-slate-500">Tax ID: {currentCompany.taxId}</p>}
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-light text-indigo-600 mb-2">INVOICE</h1>
            <div className="flex items-center justify-end gap-2 text-slate-600 print:hidden">
              <span className="font-medium">#</span>
              <Input 
                className="w-32 h-8 text-right font-medium" 
                value={invoiceData.invoiceNumber}
                onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})}
              />
            </div>
            <div className="hidden print:flex items-center justify-end gap-2 text-slate-900 text-lg mt-2">
              <span className="font-bold">#</span>
              <span className="font-bold">{invoiceData.invoiceNumber}</span>
            </div>
          </div>
        </div>

        {/* Client & Dates */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <Label className="text-slate-500 mb-2 block print:hidden">Bill To</Label>
            <Label className="text-slate-500 mb-2 hidden print:block">Bill To:</Label>
            <select 
              className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 print:hidden"
              value={invoiceData.clientId}
              onChange={(e) => setInvoiceData({...invoiceData, clientId: e.target.value})}
            >
              <option value="">Select Client...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="hidden print:block font-bold text-slate-900 text-lg">
              {clients.find(c => c.id === invoiceData.clientId)?.name || 'Select Client'}
            </div>
            {invoiceData.clientId && (
              <div className="mt-2 text-sm text-slate-600">
                <p>{clients.find(c => c.id === invoiceData.clientId)?.address}</p>
                <p>{clients.find(c => c.id === invoiceData.clientId)?.email}</p>
              </div>
            )}
          </div>
          <div className="space-y-4 print:space-y-1 flex flex-col items-end">
            <div className="flex justify-between items-center gap-4 print:hidden w-full">
              <Label className="text-slate-500 w-24">Currency</Label>
              <select 
                className="flex-1 h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={invoiceData.currency}
                onChange={(e) => setInvoiceData({...invoiceData, currency: e.target.value})}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-between items-center gap-4 w-full print:hidden">
              <Label className="text-slate-500 w-24">Issue Date</Label>
              <Input 
                type="date" 
                className="flex-1"
                value={invoiceData.issueDate}
                onChange={(e) => setInvoiceData({...invoiceData, issueDate: e.target.value})}
              />
            </div>
            <div className="flex justify-between items-center gap-4 w-full print:hidden">
              <Label className="text-slate-500 w-24">Due Date</Label>
              <Input 
                type="date" 
                className="flex-1"
                value={invoiceData.dueDate}
                onChange={(e) => setInvoiceData({...invoiceData, dueDate: e.target.value})}
              />
            </div>

            <div className="hidden print:flex justify-end gap-3 w-full text-sm mt-4">
              <span className="text-slate-500 font-semibold w-24 text-right">Issue Date:</span>
              <span className="font-bold text-slate-900 w-32">{format(new Date(invoiceData.issueDate), 'MMM dd, yyyy')}</span>
            </div>
            <div className="hidden print:flex justify-end gap-3 w-full text-sm">
              <span className="text-slate-500 font-semibold w-24 text-right">Due Date:</span>
              <span className="font-bold text-slate-900 w-32">{format(new Date(invoiceData.dueDate), 'MMM dd, yyyy')}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[50%]">Description</TableHead>
                <TableHead className="w-[15%] text-right">Qty</TableHead>
                <TableHead className="w-[15%] text-right">Price</TableHead>
                <TableHead className="w-[15%] text-right">Total</TableHead>
                <TableHead className="w-[5%] print:hidden"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Input 
                      placeholder="Item description" 
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      className="border-transparent hover:border-slate-300 focus:border-indigo-500 print:hidden"
                    />
                    <span className="hidden print:block">{item.description || ' '}</span>
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="text-right border-transparent hover:border-slate-300 focus:border-indigo-500 print:hidden"
                    />
                    <span className="hidden print:block text-right">{item.quantity}</span>
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                      className="text-right border-transparent hover:border-slate-300 focus:border-indigo-500 print:hidden"
                    />
                    <span className="hidden print:block text-right">{item.price}</span>
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-700">
                    {formatCurrency(item.quantity * item.price, invoiceData.currency)}
                  </TableCell>
                  <TableCell className="print:hidden">
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500">
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex gap-4 mt-2 print:hidden items-center">
            <Button variant="ghost" onClick={addItem} className="text-indigo-600">
              <Plus size={16} className="mr-2" /> Add Line Item
            </Button>
            {savedProducts.length > 0 && (
              <select
                className="h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600"
                onChange={(e) => {
                  if (!e.target.value) return;
                  const prod = savedProducts.find(p => p.id === e.target.value);
                  if (prod) {
                    setItems([...items, { id: Date.now(), description: prod.description, quantity: 1, price: prod.price }]);
                  }
                  e.target.value = "";
                }}
              >
                <option value="">+ Add saved product</option>
                {savedProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.description} ({formatCurrency(p.price, invoiceData.currency)})</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-between items-start">
          <div className="w-1/2 pr-8 space-y-6">
            <div>
              <Label className="text-slate-500 mb-2 block print:hidden">Notes</Label>
              <Label className="text-slate-500 mb-2 hidden print:block text-sm font-semibold">Notes:</Label>
              <textarea 
                className="w-full h-24 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none print:hidden"
                value={invoiceData.notes}
                onChange={(e) => setInvoiceData({...invoiceData, notes: e.target.value})}
                placeholder="Payment instructions or notes..."
              />
              <div className="hidden print:block text-sm text-slate-700 whitespace-pre-line">
                {invoiceData.notes}
              </div>
            </div>
            
            {currentCompany.accountDetails && (
              <div className="print:block">
                <Label className="text-slate-500 mb-2 block">Payment Details</Label>
                <div className="text-sm text-slate-700 whitespace-pre-line bg-slate-50 p-4 rounded-md border border-slate-100 print:bg-transparent print:border-0 print:p-0">
                  {currentCompany.accountDetails}
                </div>
              </div>
            )}
          </div>
          <div className="w-1/2 space-y-3">
            <div className="flex justify-between items-center text-slate-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, invoiceData.currency)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <div className="flex items-center gap-2 print:hidden">
                <span>Tax (%)</span>
                <Input 
                  type="number" 
                  className="w-16 h-8 text-right" 
                  value={invoiceData.taxRate}
                  onChange={(e) => setInvoiceData({...invoiceData, taxRate: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="hidden print:flex items-center gap-2">
                <span>Tax ({invoiceData.taxRate}%)</span>
              </div>
              <span>{formatCurrency(taxAmount, invoiceData.currency)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 print:hidden">
                <span>Discount</span>
                <Input 
                  type="number" 
                  className="w-24 h-8 text-right" 
                  value={invoiceData.discount}
                  onChange={(e) => setInvoiceData({...invoiceData, discount: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="hidden print:flex items-center gap-2">
                <span>Discount</span>
              </div>
              <span className="print:hidden">{formatCurrency(invoiceData.discount, invoiceData.currency)}</span>
              <span className="hidden print:inline-block">
                {invoiceData.discount > 0 ? `-${formatCurrency(invoiceData.discount, invoiceData.currency)}` : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold text-slate-900 pt-2">
              <span>Total</span>
              <span>{formatCurrency(totalAmount, invoiceData.currency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
