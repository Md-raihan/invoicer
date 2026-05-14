import React, { useEffect, useState } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { formatCurrency } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, FileText, Users, AlertCircle } from 'lucide-react';

export const Dashboard = () => {
  const { currentCompany } = useCompany();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    outstanding: 0,
    overdue: 0,
    invoiceCount: 0,
    clientCount: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentCompany) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch Invoices
        const invQuery = query(collection(db, 'invoices'), where('companyId', '==', currentCompany.id));
        const invSnap = await getDocs(invQuery);
        const invoices = invSnap.docs.map(d => d.data());

        // Fetch Clients
        const clientQuery = query(collection(db, 'clients'), where('companyId', '==', currentCompany.id));
        const clientSnap = await getDocs(clientQuery);

        let totalRev = 0;
        let outstand = 0;
        let over = 0;

        const monthlyData: Record<string, number> = {};

        invoices.forEach(inv => {
          if (inv.status === 'paid') {
            totalRev += inv.totalAmount;
            
            // For chart
            const month = new Date(inv.issueDate).toLocaleString('default', { month: 'short' });
            monthlyData[month] = (monthlyData[month] || 0) + inv.totalAmount;
          } else if (inv.status === 'sent') {
            outstand += inv.totalAmount;
          } else if (inv.status === 'overdue') {
            over += inv.totalAmount;
            outstand += inv.totalAmount; // Overdue is also outstanding
          }
        });

        const formattedChartData = Object.keys(monthlyData).map(key => ({
          name: key,
          total: monthlyData[key]
        }));

        setStats({
          totalRevenue: totalRev,
          outstanding: outstand,
          overdue: over,
          invoiceCount: invoices.length,
          clientCount: clientSnap.size
        });
        setChartData(formattedChartData);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentCompany]);

  if (!currentCompany) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <FileText className="text-slate-400" size={32} />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Welcome to Invoicer</h2>
        <p className="text-slate-500 max-w-md">To get started, please create your first company profile in the Settings page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview for {currentCompany.name}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Outstanding</CardTitle>
            <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.outstanding)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.overdue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.clientCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          {chartData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="total" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">
              No revenue data available yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
