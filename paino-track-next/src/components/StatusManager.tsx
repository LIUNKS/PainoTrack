'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertTriangle, AlertOctagon, ArrowRight, Save } from 'lucide-react';
import Button from '@/components/Button';
import { Tramite, TramiteStatus } from '@/lib/db';

interface StatusManagerProps {
    tramite: Tramite;
    onUpdate: () => void;
}

const STATUS_FLOW: TramiteStatus[] = ['Recibido', 'En Redacción', 'Pendiente de Firma', 'En Registros', 'Finalizado'];

export default function StatusManager({ tramite, onUpdate }: StatusManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<TramiteStatus>(tramite.status);
    const [observation, setObservation] = useState('');
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleUpdate = async () => {
        if ((selectedStatus === 'Observado' || selectedStatus === 'Anulado') && !observation.trim()) {
            alert('Por favor indica el motivo de la observación o anulación.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/tramites/${tramite.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: selectedStatus, observation })
            });

            if (res.ok) {
                setIsOpen(false);
                setObservation('');
                onUpdate();
            }
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: TramiteStatus) => {
        if (status === 'Observado') return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20';
        if (status === 'Anulado') return 'text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/20';
        if (status === selectedStatus) return 'text-primary bg-primary/20 border-primary/50';
        return 'text-gray-400 bg-white/5 border-white/10 hover:bg-white/10';
    };

    return (
        <div className="relative">
            <Button
                variant="outline"
                className={`!py-1.5 !px-3 !text-xs h-8 hover:bg-white/10 ${isOpen ? 'bg-white/10' : ''}`}
                onClick={() => {
                    setSelectedStatus(tramite.status);
                    setIsOpen(true);
                }}
            >
                <ArrowRight className="w-3 h-3 mr-1" /> Gestionar
            </Button>

            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                                onClick={() => setIsOpen(false)}
                            />

                            {/* Modal Content */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative z-10 w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5"
                            >
                                <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-bold text-white font-display">Gestionar Estado</h3>
                                        <p className="text-xs text-gray-400">Actualiza el progreso del trámite</p>
                                    </div>
                                    <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Status Selection */}
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-3 block">Flujo Regular</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {STATUS_FLOW.map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => setSelectedStatus(s)}
                                                    className={`px-3 py-3 rounded-xl text-sm border transition-all flex items-center gap-2 ${getStatusColor(s)}`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full ${s === selectedStatus ? 'bg-current' : 'bg-gray-600'}`} />
                                                    {s}
                                                    {s === selectedStatus && <Check className="w-4 h-4 ml-auto" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-3 block">Estados Alternos</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => setSelectedStatus('Observado')}
                                                className={`px-3 py-3 rounded-xl text-sm border flex items-center gap-2 transition-all ${getStatusColor('Observado')}`}
                                            >
                                                <AlertTriangle className="w-4 h-4" /> Observado
                                                {selectedStatus === 'Observado' && <Check className="w-4 h-4 ml-auto" />}
                                            </button>
                                            <button
                                                onClick={() => setSelectedStatus('Anulado')}
                                                className={`px-3 py-3 rounded-xl text-sm border flex items-center gap-2 transition-all ${getStatusColor('Anulado')}`}
                                            >
                                                <AlertOctagon className="w-4 h-4" /> Anulado
                                                {selectedStatus === 'Anulado' && <Check className="w-4 h-4 ml-auto" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Observation Text Area */}
                                    <AnimatePresence>
                                        {(selectedStatus === 'Observado' || selectedStatus === 'Anulado') && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="space-y-2 overflow-hidden"
                                            >
                                                <label className="text-sm text-gray-400 font-medium">
                                                    {selectedStatus === 'Observado' ? 'Motivo de la observación' : 'Motivo de la anulación'} <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    value={observation}
                                                    onChange={(e) => setObservation(e.target.value)}
                                                    placeholder="Ingrese los detalles para informar al cliente..."
                                                    className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none resize-none transition-all placeholder:text-gray-600"
                                                    autoFocus
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Context Info */}
                                    {selectedStatus !== 'Observado' && selectedStatus !== 'Anulado' && selectedStatus !== tramite.status && (
                                        <p className="text-sm text-center text-primary/80 bg-primary/10 py-2 rounded-lg border border-primary/20">
                                            Cambiar estado a: <strong>{selectedStatus}</strong>
                                        </p>
                                    )}
                                </div>

                                <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                                    <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancelar</Button>
                                    <Button onClick={handleUpdate} loading={loading}>
                                        <Save className="w-4 h-4 mr-2" /> Guardar Cambios
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
