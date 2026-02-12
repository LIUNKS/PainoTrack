'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import GlassCard from '@/components/GlassCard';
import CreateTramiteForm from '@/components/CreateTramiteForm';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/Button';

export default function NewTramitePage() {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || role !== 'admin')) {
            router.push('/');
        }
    }, [user, role, loading, router]);

    if (loading || !user || role !== 'admin') {
        return null; // Or a loading spinner
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-primary/30">
            <Navbar />
            <div className="pt-24 px-6 pb-12 max-w-3xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/admin')}
                    className="mb-6 pl-0 hover:bg-transparent hover:text-primary"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Panel
                </Button>

                <GlassCard>
                    <h1 className="text-2xl font-bold mb-6 font-display">Registrar Nuevo Trámite</h1>
                    <p className="text-gray-400 mb-8">
                        Ingrese los datos del cliente y el tipo de trámite. El sistema vinculará automáticamente el caso con el cliente si el DNI coincide.
                    </p>
                    <CreateTramiteForm onSuccess={() => router.push('/admin')} />
                </GlassCard>
            </div>
        </div>
    );
}
