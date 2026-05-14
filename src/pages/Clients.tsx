import React, { useEffect, useState } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Trash2, Plus } from 'lucide-react';

export const Clients = () => {
  const { currentCompany } = useCompany();
  const [clients, setClients] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', address: '' });

  useEffect(() => {
    if (!currentCompany) return;

    const q = query(collection(db, 'clients'), where('companyId', '==', currentCompany.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return unsubscribe;
  }, [currentCompany]);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCompany || !newClient.name) return;

    await addDoc(collection(db, 'clients'), {
      companyId: currentCompany.id,
      ...newClient,
      createdAt: new Date().toISOString()
    });

    setNewClient({ name: '', email: '', address: '' });
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this client?')) {
      await deleteDoc(doc(db, 'clients', id));
    }
  };

  if (!currentCompany) return <div>Please select a company.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Clients</h1>
          <p className="text-slate-500 mt-1">Manage your customer directory.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
          <Plus size={16} /> Add Client
        </Button>
      </div>

      {isAdding && (
        <Card className="bg-slate-50 border-indigo-100">
          <CardHeader>
            <CardTitle className="text-lg">New Client</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddClient} className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input required value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} placeholder="Acme Corp" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} placeholder="billing@acme.com" />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={newClient.address} onChange={e => setNewClient({...newClient, address: e.target.value})} placeholder="123 Business Rd..." />
              </div>
              <div className="md:col-span-3 flex justify-end gap-2 mt-2">
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit">Save Client</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">No clients found.</TableCell>
              </TableRow>
            ) : (
              clients.map(client => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell className="text-slate-500 max-w-[200px] truncate">{client.address}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)}>
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
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
