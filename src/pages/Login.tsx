import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { FileText } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans">
      <div className="mb-8 flex items-center gap-2 font-bold text-3xl text-indigo-600">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
          <FileText size={24} />
        </div>
        Invoicer
      </div>
      
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <p className="text-slate-500 text-sm mt-2">Sign in to manage your invoices and clients.</p>
        </CardHeader>
        <CardContent className="pt-6">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">{error}</div>}
          
          <Button 
            className="w-full h-12 text-base" 
            onClick={handleGoogleLogin} 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </Button>
          
          <p className="text-center text-xs text-slate-400 mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
