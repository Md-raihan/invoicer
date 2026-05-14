import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCompany } from '../contexts/CompanyContext';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

export const Settings = () => {
  const { user } = useAuth();
  const { companies, currentCompany } = useCompany();
  const [isAdding, setIsAdding] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', address: '', taxId: '', phone: '', email: '', accountDetails: '' });
  const [editCompany, setEditCompany] = useState(currentCompany ? { ...currentCompany } : null);

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newCompany.name) return;

    await addDoc(collection(db, 'companies'), {
      ownerId: user.uid,
      ...newCompany,
      createdAt: new Date().toISOString()
    });

    setNewCompany({ name: '', address: '', taxId: '' });
    setIsAdding(false);
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCompany) return;

    await updateDoc(doc(db, 'companies', editCompany.id), {
      name: editCompany.name,
      address: editCompany.address,
      taxId: editCompany.taxId,
      phone: editCompany.phone || '',
      email: editCompany.email || '',
      accountDetails: editCompany.accountDetails || '',
    });
    alert("Company updated successfully!");
  };

  // Update edit state when current company changes
  React.useEffect(() => {
    if (currentCompany) setEditCompany({ ...currentCompany });
  }, [currentCompany]);

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your workspaces and profile.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Workspaces (Companies)</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIsAdding(!isAdding)}>
            {isAdding ? 'Cancel' : 'Add New Company'}
          </Button>
        </CardHeader>
        <CardContent>
          {isAdding && (
            <form onSubmit={handleAddCompany} className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
              <h3 className="font-medium text-slate-900">Create New Company</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input required value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={newCompany.email} onChange={e => setNewCompany({...newCompany, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input value={newCompany.phone} onChange={e => setNewCompany({...newCompany, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Tax ID / VAT</Label>
                  <Input value={newCompany.taxId} onChange={e => setNewCompany({...newCompany, taxId: e.target.value})} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Business Address</Label>
                  <textarea 
                    className="w-full h-20 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    value={newCompany.address} 
                    onChange={e => setNewCompany({...newCompany, address: e.target.value})} 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Bank / Account Details</Label>
                  <textarea 
                    className="w-full h-20 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    value={newCompany.accountDetails} 
                    onChange={e => setNewCompany({...newCompany, accountDetails: e.target.value})} 
                    placeholder="e.g. Bank Name, Account Number, Routing Number, SWIFT..."
                  />
                </div>
              </div>
              <Button type="submit">Create Workspace</Button>
            </form>
          )}

          {editCompany ? (
            <form onSubmit={handleUpdateCompany} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input required value={editCompany.name} onChange={e => setEditCompany({...editCompany, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={editCompany.email || ''} onChange={e => setEditCompany({...editCompany, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input value={editCompany.phone || ''} onChange={e => setEditCompany({...editCompany, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Tax ID / VAT</Label>
                  <Input value={editCompany.taxId} onChange={e => setEditCompany({...editCompany, taxId: e.target.value})} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Business Address</Label>
                  <textarea 
                    className="w-full h-20 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    value={editCompany.address} 
                    onChange={e => setEditCompany({...editCompany, address: e.target.value})} 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Bank / Account Details</Label>
                  <textarea 
                    className="w-full h-20 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    value={editCompany.accountDetails || ''} 
                    onChange={e => setEditCompany({...editCompany, accountDetails: e.target.value})} 
                    placeholder="e.g. Bank Name, Account Number, Routing Number, SWIFT..."
                  />
                </div>
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          ) : (
            <p className="text-slate-500 text-sm">No company selected. Create one to get started.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input disabled value={user?.displayName || ''} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input disabled value={user?.email || ''} />
            </div>
          </div>
          <p className="text-xs text-slate-500">Profile information is managed via your Google account.</p>
        </CardContent>
      </Card>
    </div>
  );
};
