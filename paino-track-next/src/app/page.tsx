'use client';

import { useState } from 'react';
import TrackingSearch from '@/components/TrackingSearch';
import VisualTracker from '@/components/VisualTracker';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Tramite } from '@/lib/db';

export default function Home() {
  const [tramite, setTramite] = useState<Tramite | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    setTramite(null);
    try {
      const res = await fetch(`/api/tramites?q=${query}`);
      if (!res.ok) {
        throw new Error('Trámite no encontrado. Verifique el código o DNI.');
      }
      const data = await res.json();
      setTramite(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar el trámite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 px-6 pb-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {!tramite && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <h1 className="text-5xl md:text-7xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 tracking-tight">
                Seguridad Jurídica<br />
                <span className="text-primary text-glow">En Tiempo Real</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Ingrese a la nueva era de la transparencia notarial. Consulte el estado de sus documentos desde cualquier lugar, en cualquier momento.
              </p>
            </motion.div>
          )}

          <TrackingSearch onSearch={handleSearch} loading={loading} />

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="max-w-xl mx-auto text-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400"
              >
                {error}
              </motion.div>
            )}

            {tramite && (
              <VisualTracker tramite={tramite} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
