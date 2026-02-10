import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, FileText, PenTool, Archive, LucideIcon } from 'lucide-react';

const statusConfig: Record<string, { color: string; icon: LucideIcon }> = {
    'Recibido': { color: 'bg-blue-500/20 text-blue-400 border-blue-500/50', icon: FileText },
    'En Redacción': { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', icon: PenTool },
    'Pendiente de Firma': { color: 'bg-orange-500/20 text-orange-400 border-orange-500/50', icon: Clock },
    'En Registros': { color: 'bg-purple-500/20 text-purple-400 border-purple-500/50', icon: Archive },
    'Finalizado': { color: 'bg-green-500/20 text-green-400 border-green-500/50', icon: CheckCircle2 },
};

export default function StatusBadge({ status }: { status: string }) {
    const config = statusConfig[status] || statusConfig['Recibido'];
    const Icon = config.icon;

    return (
        <div className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border flex items-center gap-2 w-fit",
            config.color
        )}>
            <Icon className="w-3 h-3" />
            {status}
        </div>
    );
}
