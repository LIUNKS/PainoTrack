'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';

export default function CreateTramiteForm({ onSuccess }: { onSuccess: () => void }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        dni: '',
        clientName: '',
        type: 'Escritura'
    });
    const [loading, setLoading] = useState(false);

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
                router.refresh(); // Refresh server components
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
                <input
                    type="text"
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary/50 transition-colors"
                    placeholder="12345678"
                    required
                />
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
