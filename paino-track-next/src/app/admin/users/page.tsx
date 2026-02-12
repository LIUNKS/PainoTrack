'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Button from '@/components/Button';
import GlassCard from '@/components/GlassCard';
import { UserPlus, Loader2, Users } from 'lucide-react';
import { createUser } from '@/lib/adminAuth';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

interface UserData {
    id: string;
    email: string;
    role: 'admin' | 'client';
    displayName?: string;
    dni?: string;
    phoneNumber?: string;
    createdAt?: string;
}

export default function UsersManagementPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'admin' | 'client'>('client');
    const [displayName, setDisplayName] = useState('');
    const [dni, setDni] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [creating, setCreating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchUsers = async () => {
        try {
            const q = query(collection(db, 'users'));
            const querySnapshot = await getDocs(q);
            const usersList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as UserData[];
            setUsers(usersList);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate DNI format
        if (!/^\d{8}$/.test(dni)) {
            setMessage({ type: 'error', text: 'El DNI debe tener exactamente 8 números.' });
            return;
        }

        setCreating(true);
        setMessage(null);

        const result = await createUser(email, password, role, displayName, dni, phoneNumber);

        if (result.success) {
            setMessage({ type: 'success', text: 'Usuario creado correctamente' });
            setEmail('');
            setPassword('');
            setDisplayName('');
            setDni('');
            setPhoneNumber('');
            setRole('client');
            setShowCreate(false);
            fetchUsers();
        } else {
            setMessage({ type: 'error', text: 'Error: ' + result.error });
        }
        setCreating(false);
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen pt-24 px-6 pb-12">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-primary" />
                            </div>
                            <h1 className="text-3xl font-display font-bold">Gestión de Usuarios</h1>
                        </div>
                        <Button onClick={() => setShowCreate(!showCreate)}>
                            <UserPlus className="w-5 h-5" /> Nuevo Usuario
                        </Button>
                    </div>

                    <AnimatePresence>
                        {showCreate && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-8"
                            >
                                <GlassCard>
                                    <h2 className="text-xl font-bold mb-4">Registrar Nuevo Usuario</h2>
                                    <form onSubmit={handleCreateUser} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Nombre Completo</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={displayName}
                                                    onChange={e => setDisplayName(e.target.value)}
                                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white"
                                                    placeholder="Juan Pérez"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">DNI / Documento</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={dni}
                                                    onChange={e => {
                                                        const val = e.target.value.replace(/\D/g, '');
                                                        if (val.length <= 8) setDni(val);
                                                    }}
                                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white"
                                                    placeholder="8 dígitos"
                                                    minLength={8}
                                                    maxLength={8}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
                                                <input
                                                    type="tel"
                                                    value={phoneNumber}
                                                    onChange={e => setPhoneNumber(e.target.value)}
                                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white"
                                                    placeholder="+51 999 999 999"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Correo Electrónico</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white"
                                                    placeholder="usuario@ejemplo.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Contraseña</label>
                                                <input
                                                    type="password"
                                                    required
                                                    minLength={6}
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white"
                                                    placeholder="Mínimo 6 caracteres"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Rol</label>
                                            <select
                                                value={role}
                                                onChange={e => setRole(e.target.value as 'admin' | 'client')}
                                                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white"
                                            >
                                                <option value="client">Cliente</option>
                                                <option value="admin">Administrador</option>
                                            </select>
                                        </div>

                                        {message && (
                                            <div className={`p-3 rounded-lg text-sm text-center ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {message.text}
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-3">
                                            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancelar</Button>
                                            <Button type="submit" loading={creating}>Crear Usuario</Button>
                                        </div>
                                    </form>
                                </GlassCard>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <GlassCard>
                        {loading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-gray-400 border-b border-white/10">
                                        <th className="pb-4 pl-4">Usuario</th>
                                        <th className="pb-4">Datos</th>
                                        <th className="pb-4">Correo</th>
                                        <th className="pb-4">Rol</th>
                                        <th className="pb-4">UID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                            <td className="py-4 pl-4">
                                                <div className="font-medium text-white">{u.displayName || 'Sin Nombre'}</div>
                                                <div className="text-xs text-gray-500">{u.dni || 'Sin DNI'}</div>
                                            </td>
                                            <td className="py-4 text-sm text-gray-400">{u.phoneNumber || '-'}</td>
                                            <td className="py-4 text-gray-400">{u.email}</td>
                                            <td className="py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-gray-500/20 text-gray-400'}`}>
                                                    {u.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-4 text-xs font-mono text-gray-600">{u.id}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {!loading && users.length === 0 && (
                            <p className="text-center text-gray-500 py-8">No hay usuarios registrados en Firestore.</p>
                        )}
                    </GlassCard>
                </div>
            </div>
        </>
    );
}
