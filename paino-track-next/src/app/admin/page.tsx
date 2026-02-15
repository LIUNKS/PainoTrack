
'use client';

import { useState, useEffect } from 'react';
import StatusManager from '@/components/StatusManager';
import CreateTramiteForm from '@/components/CreateTramiteForm';
import GlassCard from '@/components/GlassCard';
import Button from '@/components/Button';
import StatusBadge from '@/components/StatusBadge';
import Navbar from '@/components/Navbar';
import { Plus, RefreshCw, Loader2, Users, Search, FileText, CheckCircle2, Clock, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tramite, TramiteStatus } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';

const STATUS_OPTIONS: TramiteStatus[] = ['Recibido', 'En Redacción', 'Pendiente de Firma', 'En Registros', 'Finalizado'];

export default function AdminDashboard() {
    const { user } = useAuth();
    const [tramites, setTramites] = useState<Tramite[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [updating, setUpdating] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredTramites = tramites.filter(t =>
        t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.dni.includes(searchTerm) ||
        (t.code && t.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const stats = {
        total: tramites.length,
        active: tramites.filter(t => t.status !== 'Finalizado').length,
        finished: tramites.filter(t => t.status === 'Finalizado').length,
        pending: tramites.filter(t => t.status === 'Pendiente de Firma').length
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen pt-24 px-6 pb-12 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background">
                <div className="max-w-7xl mx-auto space-y-8">

                    <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-display font-bold text-white tracking-tight">
                                Hola, <span className="text-primary">{user?.email?.split('@')[0]}</span>
                            </h1>
                            <p className="text-gray-400 mt-1">Bienvenido a tu centro de control notarial.</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={() => window.location.href = '/admin/users'}>
                                <Users className="w-4 h-4" /> Usuarios
                            </Button>
                            <Button onClick={() => setShowCreate(!showCreate)}>
                                <Plus className="w-5 h-5" /> Nuevo Trámite
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <GlassCard className="!p-4 flex items-center gap-4 border-l-4 border-l-blue-500">
                            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">Total Casos</p>
                                <p className="text-2xl font-bold font-mono">{stats.total}</p>
                            </div>
                        </GlassCard>
                        <GlassCard className="!p-4 flex items-center gap-4 border-l-4 border-l-yellow-500">
                            <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-400">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">En Proceso</p>
                                <p className="text-2xl font-bold font-mono">{stats.active}</p>
                            </div>
                        </GlassCard>
                        <GlassCard className="!p-4 flex items-center gap-4 border-l-4 border-l-green-500">
                            <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">Finalizados</p>
                                <p className="text-2xl font-bold font-mono">{stats.finished}</p>
                            </div>
                        </GlassCard>
                        <GlassCard className="!p-4 flex items-center gap-4 border-l-4 border-l-orange-500">
                            <div className="p-3 bg-orange-500/10 rounded-lg text-orange-400">
                                <Filter className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">Por Firmar</p>
                                <p className="text-2xl font-bold font-mono">{stats.pending}</p>
                            </div>
                        </GlassCard>
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
                                        <h2 className="text-xl font-bold mb-4 font-display">Registrar Trámite</h2>
                                        <CreateTramiteForm onSuccess={() => {
                                            setShowCreate(false);
                                            fetchTramites();
                                        }} />
                                    </GlassCard>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className={showCreate ? 'lg:col-span-2' : 'lg:col-span-3'}>
                            <GlassCard className="overflow-hidden !p-0">
                                {loading ? (
                                    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-white/5 border-b border-white/10 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                                                    <th className="py-4 pl-6 text-left">Código / ID</th>
                                                    <th className="py-4 text-left">Cliente</th>
                                                    <th className="py-4 text-left">Tipo</th>
                                                    <th className="py-4 text-left">Estado</th>
                                                    <th className="py-4 text-left">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {tramites.map((t) => (
                                                    <tr key={t.id} className="hover:bg-white/5 transition-all group">
                                                        <td className="py-4 pl-6 font-mono text-primary font-medium">
                                                            {t.code ? (
                                                                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs border border-primary/20">
                                                                    {t.code}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-600 text-xs">
                                                                    {t.id.substring(0, 8)}...
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-4">
                                                            <div className="font-medium text-white">{t.clientName}</div>
                                                            <div className="text-xs text-gray-500 font-mono">{t.dni}</div>
                                                        </td>
                                                        <td className="py-4 text-sm text-gray-300">{t.type}</td>
                                                        <td className="py-4"><StatusBadge status={t.status} /></td>
                                                        <td className="py-4">
                                                            <div className="flex gap-2">
                                                                <StatusManager
                                                                    tramite={t}
                                                                    onUpdate={fetchTramites}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                {!loading && tramites.length === 0 && (
                                    <div className="text-center py-16">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search className="w-8 h-8 text-gray-600" />
                                        </div>
                                        <p className="text-gray-400 text-lg">No se encontraron trámites</p>
                                        <p className="text-gray-600 text-sm">Intenta con otra búsqueda o crea uno nuevo.</p>
                                    </div>
                                )}
                            </GlassCard>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
