import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function Navbar() {
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
                <div className="hidden md:flex gap-8 items-center">
                    <Link href="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Client Portal</Link>
                    <Link href="/admin" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Admin Access</Link>
                </div>
            </div>
        </nav>
    );
}
