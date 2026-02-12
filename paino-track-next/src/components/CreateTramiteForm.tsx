'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function CreateTramiteForm({ onSuccess }: { onSuccess: () => void }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        dni: '',
        clientName: '',
        type: 'Escritura'
    });
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [found, setFound] = useState(false);

    const handleDniChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val.length > 8) return;

        setFormData(prev => ({ ...prev, dni: val }));
        setFound(false);

        if (val.length === 8) {
            setSearching(true);
            try {
                const q = query(collection(db, 'users'), where('dni', '==', val));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const userData = querySnapshot.docs[0].data();
                    if (userData.displayName) {
                        setFormData(prev => ({ ...prev, clientName: userData.displayName }));
                        setFound(true);
                    }
                }
            } catch (error) {
                console.error("Error searching user:", error);
            } finally {
                setSearching(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.dni || !formData.clientName) return;

        setLoading(true);
        try {
            const res = await fetch('/api/tramites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setFormData({ dni: '', clientName: '', type: 'Escritura' });
                setFound(false);
                router.refresh();
                onSuccess();
            }
        } catch (error) {
            console.error('Error creating tramite:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">DNI Cliente</label>
                <div className="relative">
                    <input
                        type="text"
                        value={formData.dni}
                        onChange={handleDniChange}
                        className={`w-full bg-black/30 border rounded-lg px-4 py-2 text-white focus:border-primary/50 transition-colors pr-10 ${found ? 'border-green-500/50' : 'border-white/10'}`}
                        placeholder="12345678"
                        required
                        minLength={8}
                        maxLength={8}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {searching && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                        {found && !searching && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nombre Completo</label>
                <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary/50 transition-colors"
                    placeholder="Juan Pérez"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tipo de Acto</label>
                <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary/50 transition-colors"
                >
                    <option value="Escritura">Escritura Pública</option>
                    <option value="Poder">Poder fuera de registro</option>
                    <option value="Vehicular">Transferencia Vehicular</option>
                    <option value="Constitución">Constitución de Empresa</option>
                </select>
            </div>

            <Button type="submit" className="w-full" loading={loading}>
                Crear Trámite
            </Button>
        </form>
    );
}
