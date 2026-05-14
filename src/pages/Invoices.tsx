import React, { useEffect, useState } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { Plus, MoreHorizontal, FileEdit, Trash2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Invoices = () => {
  const { currentCompany } = useCompany();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentCompany) return;

    const q = query(collection(db, 'invoices'), where('companyId', '==', currentCompany.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const invs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by issue date descending
      invs.sort((a: any, b: any) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
      setInvoices(invs);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentCompany]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      await deleteDoc(doc(db, 'invoices', id));
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateDoc(doc(db, 'invoices', id), { status: newStatus });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge variant="success">Paid</Badge>;
      case 'sent': return <Badge variant="default" className="bg-blue-100 text-blue-800">Sent</Badge>;
      case 'overdue': return <Badge variant="destructive">Overdue</Badge>;
      default: return <Badge variant="default" className="bg-slate-100 text-slate-800">Draft</Badge>;
    }
  };

  if (!currentCompany) return <div>Please select or create a company first.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Invoices</h1>
          <p className="text-slate-500 mt-1">Manage and track your invoices.</p>
        </div>
        <Button onClick={() => navigate('/invoices/new')} className="gap-2">
          <Plus size={16} /> New Invoice
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  No invoices found. Create your first one!
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium text-slate-900">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell>{format(new Date(invoice.issueDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(invoice.totalAmount, invoice.currency)}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <select 
                        className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/invoices/${invoice.id}/edit`)}>
                        <FileEdit size={16} className="text-slate-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(invoice.id)}>
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
