'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

type UserRole = 'admin' | 'client' | null;

interface UserData {
    displayName?: string;
    dni?: string;
    phoneNumber?: string;
    role: UserRole;
}

interface AuthContextType {
    user: User | null;
    role: UserRole;
    userData: UserData | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    userData: null,
    loading: true,
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch user role from Firestore
                try {
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setRole(data.role as UserRole);
                        setUserData({
                            role: data.role as UserRole,
                            displayName: data.displayName,
                            dni: data.dni,
                            phoneNumber: data.phoneNumber
                        });
                    } else {
                        // Default to client if no document exists
                        setRole('client');
                        setUserData(null);
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    setRole('client');
                    setUserData(null);
                }
                setUser(firebaseUser);
            } else {
                setUser(null);
                setRole(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await signOut(auth);
        setRole(null);
        setUserData(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, role, userData, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
