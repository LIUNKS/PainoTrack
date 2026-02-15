'use client';

import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import StatusBadge from '@/components/StatusBadge';
import ProgressBar from '@/components/ProgressBar';
import { FileText, PenTool, CheckCircle, Archive, LucideIcon, AlertTriangle, AlertOctagon } from 'lucide-react';
import { Tramite } from '@/lib/db';

const STEPS: { status: string; label: string; icon: LucideIcon }[] = [
    { status: 'Recibido', label: 'Documentos Recibidos', icon: FileText },
    { status: 'En Redacción', label: 'Redacción Legal', icon: PenTool },
    { status: 'Pendiente de Firma', label: 'Firma Notarial', icon: CheckCircle },
    { status: 'En Registros', label: 'Inscripción SUNARP', icon: Archive },
    { status: 'Finalizado', label: 'Entrega Final', icon: CheckCircle },
];

export default function VisualTracker({ tramite }: { tramite: Tramite }) {
    const currentStepIndex = STEPS.findIndex(s => s.status === tramite.status);
    const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
        >
            <GlassCard className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h3 className="text-2xl font-display font-bold text-white mb-1">
                            {tramite.type}
                        </h3>
                        <p className="text-gray-400 text-sm">Expediente: <span className="text-primary font-mono">{tramite.code || tramite.id}</span></p>
                    </div>
                    <StatusBadge status={tramite.status} />
                </div>

                {tramite.status === 'Observado' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex gap-4 items-start"
                    >
                        <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-yellow-500 mb-1">Trámite Observado</h4>
                            <p className="text-yellow-200/80 text-sm">{tramite.observation || 'Se requiere atención en este trámite. Por favor revise los detalles.'}</p>
                        </div>
                    </motion.div>
                )}

                {tramite.status === 'Anulado' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-4 items-start"
                    >
                        <AlertOctagon className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-red-500 mb-1">Trámite Anulado</h4>
                            <p className="text-red-200/80 text-sm">{tramite.observation || 'Este trámite ha sido anulado.'}</p>
                        </div>
                    </motion.div>
                )}

                <div className="mb-8">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Progreso del Trámite</span>
                        <span>
                            {tramite.status === 'Anulado' ? 'Cancelado' :
                                tramite.status === 'Observado' ? 'Detenido' :
                                    `${Math.round(progress)}%`}
                        </span>
                    </div>
                    <ProgressBar
                        progress={progress}
                        color={tramite.status === 'Anulado' ? 'bg-red-500' : tramite.status === 'Observado' ? 'bg-yellow-500' : undefined}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {STEPS.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        const Icon = step.icon;

                        let ringColor = 'ring-primary';
                        let shadowColor = 'rgba(59,130,246,0.2)';

                        if (tramite.status === 'Observado' && isCompleted && index === currentStepIndex) {
                        }

                        return (
                            <div
                                key={step.label}
                                className={`relative flex flex-col items-center text-center p-4 rounded-xl transition-all duration-500 ${isCompleted ? 'bg-white/5 border border-primary/30' : 'opacity-40 border border-transparent'
                                    } ${isCurrent ? 'ring-2 ring-primary shadow-[0_0_20px_rgba(59,130,246,0.2)]' : ''}`}
                            >
                                <div className={`p-3 rounded-full mb-3 ${isCompleted ? 'bg-primary/20 text-primary' : 'bg-white/5 text-gray-500'}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <p className="text-xs font-semibold">{step.label}</p>

                                {isCurrent && (
                                    <motion.div
                                        layoutId="glow"
                                        className="absolute inset-0 bg-primary/10 rounded-xl blur-xl -z-10"
                                        transition={{ duration: 0.5 }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </GlassCard>

            <GlassCard className="bg-transparent border-dashed">
                <h4 className="text-lg font-display font-medium mb-4">Historial de Actividad</h4>
                <div className="space-y-4">
                    {tramite.history.map((h, i) => (
                        <div key={i} className="flex gap-4 items-start">
                            <div className="w-2 h-2 mt-2 rounded-full bg-primary shadow-[0_0_10px_#3B82F6]" />
                            <div>
                                <p className="text-white font-medium">{h.status}</p>
                                <p className="text-xs text-gray-500">{new Date(h.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </motion.div>
    );
}
