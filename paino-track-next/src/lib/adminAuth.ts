import { initializeApp, getApps, getApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, query, where, getDocs, collection } from "firebase/firestore";
import { db } from "./firebase";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export const createUser = async (email: string, password: string, role: 'admin' | 'client', displayName?: string, dni?: string, phoneNumber?: string) => {
    const SECONDARY_APP_NAME = 'SECONDARY_APP_FOR_USER_CREATION';
    let secondaryApp;

    try {
        secondaryApp = getApp(SECONDARY_APP_NAME);
    } catch {
        secondaryApp = initializeApp(firebaseConfig, SECONDARY_APP_NAME);
    }

    const secondaryAuth = getAuth(secondaryApp);

    try {
        if (dni) {
            const q = query(collection(db, 'users'), where('dni', '==', dni));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                return { success: false, error: 'El DNI ya está registrado en el sistema.' };
            }
        }

        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
            email,
            role,
            displayName: displayName || '',
            dni: dni || '',
            phoneNumber: phoneNumber || '',
            createdAt: new Date().toISOString()
        });

        await signOut(secondaryAuth);

        return { success: true, uid: user.uid };

    } catch (error: any) {
        console.error("Error creating user:", error);
        return { success: false, error: error.message };
    }
};
