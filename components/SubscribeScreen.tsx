
import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

// This is a placeholder for the worker root URL
const WORKER_ROOT = 'https://yass-webhook.israelntalu328.workers.dev';

const generateDepositId = () => window.crypto.randomUUID();

interface SubscribeScreenProps {
    onClose: () => void;
}

const SubscribeScreen: React.FC<SubscribeScreenProps> = ({ onClose }) => {
    const { currentUser } = useAuth();
    const [visible, setVisible] = useState(false);
    const [amount, setAmount] = useState<number>(4500);
    const [currency, setCurrency] = useState<string>('CDF');
    const [depositId, setDepositId] = useState<string | null>(null);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

    useEffect(() => {
        // In a real app, you might fetch this config from Firestore
        // For now, we'll stick to the default values.
    }, []);

    const startPayment = () => {
        if (!currentUser?.uid) {
            alert('Erreur: Utilisateur non connecté');
            return;
        }
        const id = generateDepositId();
        setDepositId(id);
        setPaymentUrl(`${WORKER_ROOT}/payment-page?amount=${amount}&currency=${currency}&depositId=${id}`);
        setVisible(true);
    };

    const handlePaymentResult = async (status: 'success' | 'failed') => {
        setVisible(false);

        if (!currentUser?.uid || !depositId) {
            alert('Une erreur est survenue. Session invalide.');
            return;
        }

        const payload: any = {
            paymentStatus: status,
            paymentUpdatedAt: serverTimestamp(),
        };
        if (status === 'success') {
            payload.isSellerVerified = true;
            payload.sellerUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }

        await setDoc(doc(db, 'users', currentUser.uid), payload, { merge: true });

        const paymentDoc = {
            userId: currentUser.uid,
            depositId,
            amount,
            currency,
            status,
            createdAt: serverTimestamp(),
        };
        await addDoc(collection(db, 'payments'), paymentDoc);

        if (status === 'success') {
            alert('Paiement confirmé avec succès !');
            onClose(); // Close the subscription screen
        } else {
            alert('Le paiement a échoué.');
        }
    };

    // This effect will listen for messages from the iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // A real implementation should check event.origin for security
            if (event.data.pawapay) {
                const { status } = event.data;
                if (status === 'SUCCESSFUL' || status === 'SUCCESS') {
                    handlePaymentResult('success');
                } else {
                    handlePaymentResult('failed');
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [currentUser, depositId]);


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center text-white">Abonnement Vendeur</h2>
                <p className="text-sm text-center text-gray-400">Finalisez pour devenir vendeur vérifié.</p>
                <p className="text-3xl font-bold text-center text-cyan-400">{amount.toLocaleString()} {currency}</p>

                <button onClick={startPayment} className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md transition-colors">
                    Payer maintenant
                </button>
                <button onClick={onClose} className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md transition-colors mt-4">
                    Retour
                </button>
            </div>

            {visible && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg h-3/4 flex flex-col">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Finaliser le paiement</h3>
                            <button onClick={() => setVisible(false)} className="text-gray-400 hover:text-white">&times;</button>
                        </div>
                        <iframe
                            src={paymentUrl!}
                            className="w-full h-full border-0"
                            title="Paiement Pawapay"
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscribeScreen;
