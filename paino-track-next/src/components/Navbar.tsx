'use client';

import Link from 'next/link';
import { ShieldCheck, LogOut, User, Users, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from './Button';

export default function Navbar() {
    const { user, role, logout } = useAuth();

    return (
        <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-black/50 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/40 transition-all" />
                        <ShieldCheck className="w-8 h-8 text-primary relative z-10" />
                    </div>
                    <span className="text-xl font-display font-bold tracking-wide">
                        PAINO<span className="text-primary">TRACK</span>
                    </span>
                </Link>
                {user ? (
                    <div className="flex items-center gap-6">
                        {/* Admin Links */}
                        {role === 'admin' && (
                            <>
                                <Link href="/admin/users" className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                    <Users className="w-4 h-4" /> <span className="hidden md:inline">Usuarios</span>
                                </Link>
                                <Link href="/admin/tramites/new" className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> <span className="hidden md:inline">Nuevo Trámite</span>
                                </Link>
                                <Link href="/admin" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors border border-primary/20 px-3 py-1 rounded-full bg-primary/10">
                                    Panel Admin
                                </Link>
                            </>
                        )}

                        {/* Client Link (Implicit via "PainoTrack" logo, but we can add 'Mis Tramites' if needed, though user wanted clean) */}
                        {/* Keeping it clean for clients as requested "solo quiero ser más directo" */}

                        <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                            <span className="text-xs text-gray-500 hidden md:block">{user.email}</span>
                            <Button
                                variant="secondary"
                                className="!px-3 !py-1.5 !text-xs h-8"
                                onClick={() => logout()}
                            >
                                <LogOut className="w-3 h-3" /> <span className="hidden md:inline">Salir</span>
                            </Button>
                        </div>
                    </div>
                ) : (
                    // Should not be reachable typically if pages are protected, but kept for login page header
                    <Link href="/login" className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5">
                        <User className="w-4 h-4" /> Iniciar Sesión
                    </Link>
                )}
            </div>
        </nav>
    );
}
