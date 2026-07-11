import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log("\n🔒 Iniciando Análisis Estático de Seguridad (Secret & Configuration Scanner)...");

// Reglas de búsqueda para posibles secretos
const SECRET_PATTERNS = [
    { name: "Firebase API Key", regex: /AIzaSy[A-Za-z0-9_-]{35}/ },
    { name: "Posible Clave Privada / Secreto", regex: /(?:secret|passwd|password|private_key|token|auth_key)\s*[:=]\s*['"`][A-Za-z0-9_+/=-]{12,}['"`]/i }
];

// Archivos excluidos
const IGNORED_PATHS = [
    'node_modules',
    '.next',
    'package-lock.json',
    '.git',
    'scripts' // No auto-escanear el script de escaneo
];

let failed = false;

// 1. Verificar que .env.local esté en .gitignore
const gitignorePath = path.join(rootDir, '.gitignore');
if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    if (!gitignoreContent.includes('.env.local') && !gitignoreContent.includes('.env*')) {
        console.log("❌ [FALLIDO] .env.local o .env* no están especificados en tu archivo .gitignore. Esto puede causar fugas accidentales de credenciales en GitHub.");
        failed = true;
    } else {
        console.log("✅ [OK] .env.local está correctamente protegido en .gitignore (mediante regla .env.local o .env*).");
    }
} else {
    console.log("⚠️  [ADVERTENCIA] No se encontró el archivo .gitignore en la raíz.");
}

// 2. Escanear recursivamente archivos en busca de llaves en duro
function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const relativePath = path.relative(rootDir, fullPath);
        
        // Omitir carpetas ignoradas
        if (IGNORED_PATHS.some(ignored => relativePath.startsWith(ignored) || file === ignored)) {
            return;
        }
        
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scanDirectory(fullPath);
        } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.json'))) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            
            SECRET_PATTERNS.forEach(pattern => {
                const match = content.match(pattern.regex);
                if (match) {
                    // Omitir si es una referencia a process.env
                    if (!match[0].includes('process.env')) {
                        console.log(`❌ [FUGA DE SECRETO DETECTADA] Archivo: ${relativePath}`);
                        console.log(`   Tipo de Alerta: ${pattern.name}`);
                        console.log(`   Texto sospechoso: "${match[0].substring(0, 30)}..."`);
                        failed = true;
                    }
                }
            });
        }
    });
}

try {
    scanDirectory(rootDir);
    
    if (failed) {
        console.log("\n❌ Error: El Análisis Estático de Seguridad falló. Por favor corrige las vulnerabilidades detectadas.");
        process.exit(1);
    } else {
        console.log("✅ APROBADO: No se encontraron credenciales en duro en el código y las configuraciones son seguras.");
        process.exit(0);
    }
} catch (error) {
    console.error("❌ Error durante el escaneo de seguridad estático:", error);
    process.exit(1);
}
