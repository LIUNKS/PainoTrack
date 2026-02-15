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

    useEffect(() => {
        if (isOpen && tramite.status !== 'Anulado' && tramite.status !== 'Observado') {
            const currentIndex = STATUS_FLOW.indexOf(tramite.status);
            if (currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1) {
                setSelectedStatus(STATUS_FLOW[currentIndex + 1]);
            } else {
                setSelectedStatus(tramite.status);
            }
        }
    }, [isOpen, tramite.status]);

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
                const data = await res.json();

                if (data.clientData && data.clientData.phone) {
                    const { name, phone, code, type } = data.clientData;
                    const cleanPhone = phone.replace(/\D/g, '');
                    const message = `Hola ${name || 'Cliente'}, le saluda Lucía de Notaría Paino. Le informo que su trámite ${code || ''} (${type || ''}) ha cambiado al estado: ${selectedStatus}.${observation ? ` Observación: ${observation}` : ''}`;
                    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                }

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

    const openModal = () => {
        if (tramite.status === 'Anulado') {
            alert('Este trámite está anulado y no se puede modificar.');
            return;
        }
        setIsOpen(true);
    };

    const getStatusColor = (status: TramiteStatus) => {
        if (status === 'Observado') return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20';
        if (status === 'Anulado') return 'text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/20';
        if (status === selectedStatus) return 'text-primary bg-primary/20 border-primary/50';
        return 'text-gray-400 bg-white/5 border-white/10 hover:bg-white/10';
    };

    const getNextStatus = () => {
        const currentIndex = STATUS_FLOW.indexOf(tramite.status);
        if (currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1) {
            return STATUS_FLOW[currentIndex + 1];
        }
        return null;
    };

    const nextStatus = getNextStatus();

    return (
        <div className="relative">
            <Button
                variant="outline"
                className={`!py-1.5 !px-3 !text-xs h-8 hover:bg-white/10 ${isOpen ? 'bg-white/10' : ''} ${tramite.status === 'Anulado' ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={openModal}
            >
                <ArrowRight className="w-3 h-3 mr-1" /> Gestionar
            </Button>

            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                                onClick={() => setIsOpen(false)}
                            />

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
                                    <div className="space-y-4">
                                        <label className="text-sm font-medium text-gray-400">Acciones Disponibles</label>

                                        {tramite.status === 'Observado' ? (
                                            <div className="space-y-2">
                                                <p className="text-sm text-yellow-500 mb-2">Selecciona el estado para reactivar el trámite:</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {STATUS_FLOW.map((status) => (
                                                        <button
                                                            key={status}
                                                            onClick={() => setSelectedStatus(status)}
                                                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 border ${getStatusColor(status)}`}
                                                        >
                                                            {status}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="pt-2 border-t border-white/5 mt-2">
                                                    <button
                                                        onClick={() => setSelectedStatus('Anulado')}
                                                        className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all border ${getStatusColor('Anulado')}`}
                                                    >
                                                        <AlertOctagon className="w-4 h-4 inline-block mr-2" />
                                                        Anular Trámite
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Case 2: Normal Flow - Show Next Step Only */
                                            <div className="space-y-3">
                                                {nextStatus ? (
                                                    <button
                                                        onClick={() => setSelectedStatus(nextStatus)}
                                                        className={`w-full px-4 py-4 rounded-xl text-base font-bold transition-all duration-300 flex items-center justify-center gap-2 border ${selectedStatus === nextStatus
                                                            ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 border-primary'
                                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 border-white/10'
                                                            }`}
                                                    >
                                                        <Check className="w-5 h-5" />
                                                        Avanzar a {nextStatus}
                                                    </button>
                                                ) : (
                                                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                                                        <p className="text-green-500 font-bold">¡Trámite Finalizado!</p>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-2 gap-3 pt-2">
                                                    <button
                                                        onClick={() => setSelectedStatus('Observado')}
                                                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-all border ${selectedStatus === 'Observado'
                                                            ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'
                                                            : 'bg-white/5 text-gray-400 hover:text-yellow-500 hover:bg-yellow-500/10 border-white/10'
                                                            }`}
                                                    >
                                                        <AlertTriangle className="w-4 h-4 inline-block mr-2" />
                                                        Observar
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedStatus('Anulado')}
                                                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-all border ${selectedStatus === 'Anulado'
                                                            ? 'bg-red-500/20 text-red-500 border-red-500/50'
                                                            : 'bg-white/5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 border-white/10'
                                                            }`}
                                                    >
                                                        <AlertOctagon className="w-4 h-4 inline-block mr-2" />
                                                        Anular
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {(selectedStatus === 'Observado' || selectedStatus === 'Anulado' || observation) && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">
                                                {(selectedStatus === 'Observado' || selectedStatus === 'Anulado') ? 'Motivo (Requerido)' : 'Observación (Opcional)'}
                                            </label>
                                            <textarea
                                                value={observation}
                                                onChange={(e) => setObservation(e.target.value)}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none h-24"
                                                placeholder="Detalla el motivo del cambio de estado..."
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center justify-end gap-3 pt-2">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setIsOpen(false)}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            onClick={handleUpdate}
                                            disabled={loading}
                                            className="bg-primary hover:bg-primary/90 text-white min-w-[120px]"
                                        >
                                            {loading ? 'Guardando...' : (
                                                <span className="flex items-center gap-2">
                                                    <Save className="w-4 h-4" /> Guardar
                                                </span>
                                            )}
                                        </Button>
                                    </div>
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
