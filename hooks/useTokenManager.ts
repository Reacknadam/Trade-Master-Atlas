
import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export const useTokenManager = () => {
    const { currentUser } = useAuth();
    const [tokens, setTokens] = useState<number>(0);

    useEffect(() => {
        if (!currentUser) return;

        const userDocRef = doc(db, 'users', currentUser.uid);

        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                setTokens(doc.data().tokens);
            } else {
                console.error("User document does not exist!");
            }
        });

        return () => unsubscribe();
    }, [currentUser]);

    const updateTokensInDb = useCallback(async (newTokens: number) => {
        if (!currentUser) return;
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, { tokens: newTokens });
    }, [currentUser]);

    const spendTokens = useCallback(async (amount: number): Promise<boolean> => {
        if (tokens >= amount) {
            const newTokens = tokens - amount;
            await updateTokensInDb(newTokens);
            return true;
        }
        return false;
    }, [tokens, updateTokensInDb]);

    const addTokens = useCallback(async (amount: number) => {
        const newTokens = tokens + amount;
        await updateTokensInDb(newTokens);
    }, [tokens, updateTokensInDb]);

    return { tokens, spendTokens, addTokens };
};
