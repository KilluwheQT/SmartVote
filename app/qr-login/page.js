'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QrCode, ArrowLeft, Vote, RefreshCw, CheckCircle, Smartphone } from 'lucide-react';
import { signInWithCustomToken } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function QRLoginPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [status, setStatus] = useState('generating'); // generating, waiting, authenticated, error
  const [loading, setLoading] = useState(false);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    generateQRSession();
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const generateQRSession = async () => {
    setStatus('generating');
    
    // Generate unique session ID
    const newSessionId = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);

    try {
      // Create QR session in Firestore
      await setDoc(doc(db, 'qrSessions', newSessionId), {
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      });

      // Generate QR code URL (using a QR code API)
      const qrData = JSON.stringify({
        type: 'smartvote_login',
        sessionId: newSessionId,
        timestamp: Date.now()
      });
      
      // Using QR Server API for QR code generation
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;
      setQrCode(qrUrl);
      setStatus('waiting');

      // Listen for authentication
      unsubscribeRef.current = onSnapshot(
        doc(db, 'qrSessions', newSessionId),
        async (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            
            if (data.status === 'authenticated' && data.userId) {
              setStatus('authenticated');
              
              // Clean up session
              await deleteDoc(doc(db, 'qrSessions', newSessionId));
              
              toast.success('Login successful!');
              router.push('/dashboard');
            }
          }
        }
      );

      // Auto-expire after 5 minutes
      setTimeout(() => {
        if (status === 'waiting') {
          setStatus('error');
          toast.error('QR code expired. Please refresh.');
        }
      }, 5 * 60 * 1000);

    } catch (error) {
      console.error('QR generation error:', error);
      setStatus('error');
      toast.error('Failed to generate QR code');
    }
  };

  const handleRefresh = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    generateQRSession();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link href="/login" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Link>

        <Card>
          <Card.Body className="text-center py-8">
            <Vote className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              QR Code Login
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Scan with your phone to login instantly
            </p>

            {status === 'generating' && (
              <div className="py-12">
                <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Generating QR code...</p>
              </div>
            )}

            {status === 'waiting' && qrCode && (
              <>
                <div className="bg-white p-4 rounded-lg inline-block mb-6">
                  <img 
                    src={qrCode} 
                    alt="Login QR Code" 
                    className="w-64 h-64"
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Smartphone className="w-4 h-4" />
                    <span>Scan with SmartVote mobile app</span>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                      How to use:
                    </h3>
                    <ol className="text-sm text-blue-700 dark:text-blue-300 text-left list-decimal list-inside space-y-1">
                      <li>Open SmartVote app on your phone</li>
                      <li>Tap "Scan QR Code" on the login screen</li>
                      <li>Point your camera at this QR code</li>
                      <li>Confirm login on your phone</li>
                    </ol>
                  </div>

                  <p className="text-xs text-gray-500">
                    QR code expires in 5 minutes
                  </p>

                  <Button variant="secondary" onClick={handleRefresh}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh QR Code
                  </Button>
                </div>
              </>
            )}

            {status === 'authenticated' && (
              <div className="py-12">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  Login Successful!
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Redirecting to dashboard...
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="py-12">
                <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  QR code expired or failed to generate
                </p>
                <Button onClick={handleRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate New QR Code
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-4">
          This feature is for campus-only login
        </p>
      </div>
    </div>
  );
}
