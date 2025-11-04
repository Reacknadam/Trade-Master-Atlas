
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDocs, query, where, collection, writeBatch } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { INITIAL_TOKENS, REFERRAL_BONUS } from '../constants';
import '../styles/SignUp.css';

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

            if (referralCode.trim() !== '') {
                const q = query(collection(db, 'users'), where('referralCode', '==', referralCode.trim()));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const referrerDoc = querySnapshot.docs[0];
                    const referrerData = referrerDoc.data();

                    const batch = writeBatch(db);
                    const referrerRef = doc(db, 'users', referrerDoc.id);
                    batch.update(referrerRef, { tokens: referrerData.tokens + REFERRAL_BONUS });
                    initialTokens += REFERRAL_BONUS;
                    await batch.commit();
                } else {
                    setError("Code de parrainage invalide.");
                }
            }

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
        <div className="login-form-container">
            <h2 className="login-title">Inscription</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" required />
                </div>
                <div className="form-group">
                    <label className="form-label">Mot de passe</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" required />
                </div>
                <div className="form-group">
                    <label className="form-label">Confirmer le mot de passe</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="form-input" required />
                </div>
                <div className="form-group">
                    <label className="form-label">Code de parrainage (optionnel)</label>
                    <input type="text" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} className="form-input" />
                </div>
                <button type="submit" disabled={isLoading} className="submit-btn">
                    {isLoading ? 'Inscription en cours...' : "S'inscrire"}
                </button>
            </form>
            <p className="switch-form-text">
                Déjà un compte ?{' '}
                <button onClick={onBackToLogin} className="switch-form-btn">
                    Connectez-vous
                </button>
            </p>
        </div>
    );
};

export default SignUp;
