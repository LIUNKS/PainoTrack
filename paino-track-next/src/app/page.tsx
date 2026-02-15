'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, ShieldCheck, Clock, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Button from '@/components/Button';
import VisualTracker from '@/components/VisualTracker';
import { Tramite } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [selectedTramite, setSelectedTramite] = useState<Tramite | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchUserTramites = async () => {
      if (userData?.dni) {
        setLoading(true);
        try {
          const res = await fetch(`/api/tramites?dni=${userData.dni}`);
          if (res.ok) {
            const data = await res.json();
            setTramites(data);
            if (data.length === 1) {
              setSelectedTramite(data[0]);
            }
          }
        } catch (err) {
          console.error("Error fetching tramites", err);
          setError("Error al cargar sus trámites.");
        } finally {
          setLoading(false);
        }
      }
    };

    if (userData) {
      fetchUserTramites();
    }
  }, [userData]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 px-6 pb-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {!user ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8 py-20"
            >
              <h1 className="text-5xl md:text-7xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 tracking-tight">
                Portal de Clientes<br />
                <span className="text-primary text-glow">PainoTrack</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Acceda a su cuenta para visualizar el estado de todos sus trámites notariales en tiempo real.
              </p>
              <div className="flex justify-center">
                <Button onClick={() => router.push('/login')} className="px-8 py-4 text-lg">
                  Iniciar Sesión
                </Button>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-display font-bold text-white mb-2">Mis Trámites</h2>
                  <p className="text-gray-400">Bienvenido, {userData?.displayName || 'Cliente'}</p>
                </div>
              </div>

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

                {!selectedTramite && tramites.length === 0 && !loading && (
                  <div className="text-center py-20 opacity-50">
                    <p className="text-xl">No tiene trámites registrados con el DNI {userData?.dni}</p>
                  </div>
                )}

                {!selectedTramite && tramites.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tramites.map((t) => (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setSelectedTramite(t)}
                        className="cursor-pointer"
                      >
                        <div className="glass p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">
                              {t.code || t.id.substring(0, 8)}
                            </span>
                            <div className={`w-2 h-2 rounded-full ${t.status === 'Finalizado' ? 'bg-green-500' : 'bg-yellow-500'} shadow-[0_0_8px_currentColor]`} />
                          </div>
                          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">{t.type}</h3>
                          <p className="text-gray-400 text-sm mb-4">{t.clientName}</p>
                          <div className="text-xs text-gray-500 flex justify-between items-center bg-black/20 p-2 rounded-lg">
                            <span>Estado:</span>
                            <span className="text-white font-medium">{t.status}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </>
          )}

          <AnimatePresence>
            {selectedTramite && (
              <div>
                {tramites.length > 1 && (
                  <button
                    onClick={() => setSelectedTramite(null)}
                    className="mb-6 text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
                  >
                    ← Volver a mis trámites
                  </button>
                )}
                <VisualTracker tramite={selectedTramite} />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
