
import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { REFERRAL_BONUS } from '../constants';
import { GemIcon } from './icons';

interface ReferralModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReferralSuccess: (amount: number) => void; // This will be removed later
}

const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const [referralCode, setReferralCode] = useState('Chargement...');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen && currentUser) {
            const userDocRef = doc(db, 'users', currentUser.uid);
            getDoc(userDocRef).then(docSnap => {
                if (docSnap.exists()) {
                    setReferralCode(docSnap.data().referralCode);
                }
            });
        }
    }, [isOpen, currentUser]);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-8 m-4 max-w-md w-full border border-gray-700 shadow-xl">
                <h2 className="text-2xl font-bold text-cyan-400 mb-4">Programme de Parrainage</h2>
                <p className="text-gray-400 mb-6">
                    Invitez vos amis avec votre code unique et recevez tous les deux des tokens bonus !
                </p>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Votre code de parrainage :</label>
                    <div className="flex">
                        <input
                            type="text"
                            readOnly
                            value={referralCode}
                            className="flex-1 bg-gray-700 border border-gray-600 rounded-l-lg p-2 focus:outline-none"
                        />
                        <button
                            onClick={handleCopy}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 rounded-r-lg transition-colors"
                        >
                            {copied ? 'Copié!' : 'Copier'}
                        </button>
                    </div>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg flex items-center justify-center space-x-3 mb-6">
                    <GemIcon className="w-6 h-6 text-cyan-400"/>
                    <p className="font-semibold text-gray-200">
                        Gagnez <span className="text-cyan-400">{REFERRAL_BONUS} tokens</span> pour chaque ami qui s'inscrit.
                    </p>
                </div>
                
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReferralModal;
