'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import Button from '@/components/Button';
import GlassCard from '@/components/GlassCard';

interface TrackingSearchProps {
    onSearch: (query: string) => void;
    loading: boolean;
}

export default function TrackingSearch({ onSearch, loading }: TrackingSearchProps) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
        }
    };

    return (
        <GlassCard className="max-w-xl mx-auto text-center transform hover:scale-[1.01] transition-transform">
            <h2 className="text-3xl font-display font-bold mb-2">Consulta tu Trámite</h2>
            <p className="text-gray-400 mb-8">Ingresa tu número de expediente (PN-XXXXXX) o DNI</p>

            <form onSubmit={handleSubmit} className="flex gap-4">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="PN-123456"
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-3 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                </div>
                <Button
                    type="submit"
                    loading={loading}
                    disabled={!query.trim()}
                    className="min-w-[120px]"
                >
                    Buscar
                </Button>
            </form>
        </GlassCard>
    );
}
