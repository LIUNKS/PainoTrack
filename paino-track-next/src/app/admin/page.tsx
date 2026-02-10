'use client';

import { useState, useEffect } from 'react';
import CreateTramiteForm from '@/components/CreateTramiteForm';
import GlassCard from '@/components/GlassCard';
import Button from '@/components/Button';
import StatusBadge from '@/components/StatusBadge';
import Navbar from '@/components/Navbar';
import { Plus, RefreshCw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tramite, TramiteStatus } from '@/lib/db';

const STATUS_OPTIONS: TramiteStatus[] = ['Recibido', 'En Redacción', 'Pendiente de Firma', 'En Registros', 'Finalizado'];

export default function AdminDashboard() {
    const [tramites, setTramites] = useState<Tramite[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchTramites = async () => {
        try {
            const res = await fetch('/api/tramites');
            const data = await res.json();
            setTramites(data);
        } catch (error) {
            console.error('Error fetching tramites:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTramites();
    }, []);

    const updateStatus = async (id: string, newStatus: TramiteStatus) => {
        setUpdating(id);
        try {
            const res = await fetch(`/api/tramites/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchTramites();
            }
        } catch (error) {
            console.error('Failed to update status', error);
        } finally {
            setUpdating(null);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen pt-24 px-6 pb-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-display font-bold">Panel de Gestión</h1>
                        <Button onClick={() => setShowCreate(!showCreate)}>
                            <Plus className="w-5 h-5" /> Nuevo Trámite
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {showCreate && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="lg:col-span-1"
                                >
                                    <GlassCard>
                                        <h2 className="text-xl font-bold mb-4">Registrar Trámite</h2>
                                        <CreateTramiteForm onSuccess={() => {
                                            setShowCreate(false);
                                            fetchTramites();
                                        }} />
                                    </GlassCard>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className={showCreate ? 'lg:col-span-2' : 'lg:col-span-3'}>
                            <GlassCard className="overflow-x-auto">
                                {loading ? (
                                    <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                                ) : (
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-gray-400 border-b border-white/10">
                                                <th className="pb-4 pl-4">ID</th>
                                                <th className="pb-4">Cliente</th>
                                                <th className="pb-4">Tipo</th>
                                                <th className="pb-4">Estado Actual</th>
                                                <th className="pb-4">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {tramites.map((t) => (
                                                <tr key={t.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="py-4 pl-4 font-mono text-primary">{t.code || t.id.substring(0, 8) + '...'}</td>
                                                    <td className="py-4">{t.clientName}<br /><span className="text-xs text-gray-500">{t.dni}</span></td>
                                                    <td className="py-4">{t.type}</td>
                                                    <td className="py-4"><StatusBadge status={t.status} /></td>
                                                    <td className="py-4">
                                                        <div className="flex gap-2">
                                                            {STATUS_OPTIONS.indexOf(t.status) < STATUS_OPTIONS.length - 1 && (
                                                                <Button
                                                                    variant="outline"
                                                                    className="px-3 py-1 text-xs h-8"
                                                                    loading={updating === t.id}
                                                                    onClick={() => {
                                                                        const nextIdx = STATUS_OPTIONS.indexOf(t.status) + 1;
                                                                        updateStatus(t.id, STATUS_OPTIONS[nextIdx]);
                                                                    }}
                                                                >
                                                                    Avanzar <RefreshCw className="w-3 h-3 ml-1" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                                {!loading && tramites.length === 0 && (
                                    <p className="text-center text-gray-500 py-8">No hay trámites registrados.</p>
                                )}
                            </GlassCard>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
