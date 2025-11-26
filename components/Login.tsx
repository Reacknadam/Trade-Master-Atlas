
import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { INITIAL_TOKENS } from '../constants';
import SignUp from './SignUp';
import '../styles/Login.css';

interface LoginProps {
    onGuestMode: () => void;
}

const Login: React.FC<LoginProps> = ({ onGuestMode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showSignUp, setShowSignUp] = useState(false);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            setError("L'email ou le mot de passe est incorrect.");
        }
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userDocRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(userDocRef);

            if (!docSnap.exists()) {
                await setDoc(userDocRef, {
                    email: user.email,
                    tokens: INITIAL_TOKENS,
                    referralCode: `REF-${user.uid.substring(0, 6).toUpperCase()}`,
                    createdAt: new Date(),
                });
            }
        } catch (error: any) {
            setError("Une erreur est survenue lors de la connexion avec Google.");
            console.error(error);
        }
    };

    if (showSignUp) {
        return <SignUp onBackToLogin={() => setShowSignUp(false)} />;
    }

    return (
        <div className="login-form-container">
            <h2 className="login-title">Connexion</h2>

            {error && <p className="error-message">{error}</p>}

            <button onClick={handleGoogleSignIn} className="google-btn">
                <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 111.4 512 0 398.6 0 256S111.4 0 244 0c69.8 0 130.8 28.2 175.2 72.8l-67.5 64.5C335.7 113.3 293.5 96 244 96c-82.6 0-149.3 66.9-149.3 149.9s66.7 150 149.3 150c95.6 0 131-68.5 135.2-104.2H244v-85.2h242.2c2.4 12.7 3.8 26.1 3.8 39.8z"></path></svg>
                Se connecter avec Google
            </button>

            <div className="divider">
                <div className="divider-line"></div>
                <span className="divider-text">OU</span>
                <div className="divider-line"></div>
            </div>

            <form onSubmit={handleEmailSubmit}>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" required />
                </div>
                <div className="form-group">
                    <label className="form-label">Mot de passe</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" required />
                </div>
                <button type="submit" className="submit-btn">
                    Se connecter
                </button>
            </form>
             <div className="switch-form-text">
                <button onClick={onGuestMode} className="switch-form-btn">
                    Continuer en tant qu'invité
                </button>
            </div>
            <p className="switch-form-text">
                Pas encore de compte ?{' '}
                <button onClick={() => setShowSignUp(true)} className="switch-form-btn">
                    Inscrivez-vous
                </button>
            </p>
        </div>
    );
};

export default Login;
