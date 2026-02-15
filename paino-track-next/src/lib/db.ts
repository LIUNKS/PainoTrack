import { db } from './firebase';
import {
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    query,
    where,
    Timestamp
} from 'firebase/firestore';

export type TramiteStatus = 'Recibido' | 'En Redacción' | 'Pendiente de Firma' | 'En Registros' | 'Finalizado' | 'Observado' | 'Anulado';

export interface Tramite {
    id: string;
    code?: string;
    dni: string;
    clientName: string;
    type: string;
    status: TramiteStatus;
    observation?: string;
    createdAt: string;
    updatedAt: string;
    history: { status: TramiteStatus; timestamp: string; observation?: string }[];
}

const COLLECTION_NAME = 'tramites';

const formatDate = (date: any) => {
    if (date?.toDate) return date.toDate().toISOString();
    return new Date().toISOString();
};

export const TramiteService = {
    async getAll(): Promise<Tramite[]> {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: formatDate(doc.data().createdAt),
            updatedAt: formatDate(doc.data().updatedAt),
            history: (doc.data().history || []).map((h: any) => ({
                ...h,
                timestamp: formatDate(h.timestamp)
            }))
        })) as Tramite[];
    },

    async getByCodeOrDni(search: string): Promise<Tramite | null> {
        const tramitesRef = collection(db, COLLECTION_NAME);

        let q = query(tramitesRef, where("dni", "==", search));
        let querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            q = query(tramitesRef, where("code", "==", search));
            querySnapshot = await getDocs(q);
        }

        if (querySnapshot.empty) return null;

        const doc = querySnapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data(),
            createdAt: formatDate(doc.data().createdAt),
            updatedAt: formatDate(doc.data().updatedAt),
            history: (doc.data().history || []).map((h: any) => ({
                ...h,
                timestamp: formatDate(h.timestamp)
            }))
        } as Tramite;
    },

    async getByDni(dni: string): Promise<Tramite[]> {
        const tramitesRef = collection(db, COLLECTION_NAME);
        const q = query(tramitesRef, where("dni", "==", dni));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: formatDate(doc.data().createdAt),
            updatedAt: formatDate(doc.data().updatedAt),
            history: (doc.data().history || []).map((h: any) => ({
                ...h,
                timestamp: formatDate(h.timestamp)
            }))
        })) as Tramite[];
    },

    async create(data: Omit<Tramite, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'code'>): Promise<Tramite> {
        const code = `PN-${Math.floor(100000 + Math.random() * 900000)}`;
        const newTramite = {
            ...data,
            code,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            history: [{ status: data.status, timestamp: Timestamp.now() }]
        };

        const docRef = await addDoc(collection(db, COLLECTION_NAME), newTramite);

        return {
            id: docRef.id,
            ...newTramite,
            createdAt: formatDate(newTramite.createdAt),
            updatedAt: formatDate(newTramite.updatedAt),
            history: newTramite.history.map(h => ({ ...h, timestamp: formatDate(h.timestamp) }))
        } as Tramite;
    },

    async updateStatus(id: string, status: TramiteStatus, observation?: string): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) throw new Error("Tramite not found");

        const currentHistory = docSnap.data().history || [];

        const updateData: any = {
            status,
            updatedAt: Timestamp.now(),
            history: [...currentHistory, {
                status,
                timestamp: Timestamp.now(),
                ...(observation ? { observation } : {})
            }]
        };

        if (observation !== undefined) {
            updateData.observation = observation;
        } else if (status !== 'Observado' && status !== 'Anulado') {
            updateData.observation = null;
        }

        await updateDoc(docRef, updateData);
    }
};
