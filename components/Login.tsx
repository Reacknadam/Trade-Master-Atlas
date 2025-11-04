
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import SignUp from './SignUp'; // We'll create this component next

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showSignUp, setShowSignUp] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            setError(error.message);
        }
    };

    if (showSignUp) {
        return <SignUp onBackToLogin={() => setShowSignUp(false)} />;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center text-white">Connexion</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md transition-colors"
                    >
                        Se connecter
                    </button>
                </form>
                <p className="text-sm text-center text-gray-400">
                    Pas encore de compte ?{' '}
                    <button onClick={() => setShowSignUp(true)} className="font-medium text-cyan-500 hover:underline">
                        Inscrivez-vous
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
