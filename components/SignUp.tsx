
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDocs, query, where, collection, writeBatch } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { INITIAL_TOKENS, REFERRAL_BONUS } from '../constants';

interface SignUpProps {
    onBackToLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onBackToLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            setIsLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;

            let initialTokens = INITIAL_TOKENS;

            // Handle referral
            if (referralCode.trim() !== '') {
                const q = query(collection(db, 'users'), where('referralCode', '==', referralCode.trim()));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const referrerDoc = querySnapshot.docs[0];
                    const referrerData = referrerDoc.data();

                    const batch = writeBatch(db);

                    // Award bonus to referrer
                    const referrerRef = doc(db, 'users', referrerDoc.id);
                    batch.update(referrerRef, { tokens: referrerData.tokens + REFERRAL_BONUS });

                    // Award bonus to new user
                    initialTokens += REFERRAL_BONUS;

                    await batch.commit();

                } else {
                    setError("Code de parrainage invalide.");
                    // Note: In a real app, you might want to handle this differently,
                    // but for now we'll just show an error and continue with signup.
                }
            }

            // Create the new user document in Firestore
            await setDoc(doc(db, 'users', newUser.uid), {
                email: newUser.email,
                tokens: initialTokens,
                referralCode: `REF-${newUser.uid.substring(0, 6).toUpperCase()}`,
                createdAt: new Date(),
            });

        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center text-white">Inscription</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Mot de passe</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Confirmer le mot de passe</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Code de parrainage (optionnel)</label>
                        <input type="text" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md transition-colors disabled:bg-gray-500">
                        {isLoading ? 'Inscription en cours...' : "S'inscrire"}
                    </button>
                </form>
                <p className="text-sm text-center text-gray-400">
                    Déjà un compte ?{' '}
                    <button onClick={onBackToLogin} className="font-medium text-cyan-500 hover:underline">
                        Connectez-vous
                    </button>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
