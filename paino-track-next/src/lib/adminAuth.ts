import { initializeApp, getApps, getApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, query, where, getDocs, collection } from "firebase/firestore";
import { db } from "./firebase"; // Use main app's Firestore for writing data

// Re-use the existing config
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export const createUser = async (email: string, password: string, role: 'admin' | 'client', displayName?: string, dni?: string, phoneNumber?: string) => {
    // 1. Initialize a secondary app to avoid logging out the current user
    const SECONDARY_APP_NAME = 'SECONDARY_APP_FOR_USER_CREATION';
    let secondaryApp;

    try {
        secondaryApp = getApp(SECONDARY_APP_NAME);
    } catch {
        secondaryApp = initializeApp(firebaseConfig, SECONDARY_APP_NAME);
    }

    const secondaryAuth = getAuth(secondaryApp);

    try {
        // 1. Check if DNI already exists
        if (dni) {
            const q = query(collection(db, 'users'), where('dni', '==', dni));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                return { success: false, error: 'El DNI ya está registrado en el sistema.' };
            }
        }

        // 2. Create user in Auth
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const user = userCredential.user;

        // 3. Write role to Firestore (using the PRIMARY app's db connection)
        // We use the primary DB because we are authenticated as admin there
        await setDoc(doc(db, 'users', user.uid), {
            email,
            role,
            displayName: displayName || '',
            dni: dni || '',
            phoneNumber: phoneNumber || '',
            createdAt: new Date().toISOString()
        });

        // 4. Sign out from secondary app immediately so it doesn't interfere
        await signOut(secondaryAuth);

        return { success: true, uid: user.uid };

    } catch (error: any) {
        console.error("Error creating user:", error);
        return { success: false, error: error.message };
    }
    // Note: We don't delete the app repeatedly to avoid overhead, or we could handle cleanup if strictly needed.
    // However, keeping it initialized is usually fine for this use case.
};
