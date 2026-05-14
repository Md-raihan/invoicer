import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

export interface Company {
  id: string;
  name: string;
  address: string;
  taxId: string;
  phone?: string;
  email?: string;
  accountDetails?: string;
  ownerId: string;
}

interface CompanyContextType {
  companies: Company[];
  currentCompany: Company | null;
  setCurrentCompany: (company: Company | null) => void;
  loading: boolean;
}

const CompanyContext = createContext<CompanyContextType>({
  companies: [],
  currentCompany: null,
  setCurrentCompany: () => {},
  loading: true,
});

export const CompanyProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCompanies([]);
      setCurrentCompany(null);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'companies'), where('ownerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const comps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
      setCompanies(comps);
      
      if (comps.length > 0) {
        if (!currentCompany || !comps.find(c => c.id === currentCompany.id)) {
          setCurrentCompany(comps[0]);
        }
      } else {
        setCurrentCompany(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  return (
    <CompanyContext.Provider value={{ companies, currentCompany, setCurrentCompany, loading }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => useContext(CompanyContext);
