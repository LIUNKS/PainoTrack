import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, addDoc, collection, Timestamp } from 'firebase/firestore';

// 1. Leer y parsear el archivo .env.local manualmente para extraer credenciales
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');

if (!fs.existsSync(envPath)) {
    console.error("❌ Error: No se encontró el archivo .env.local en la raíz del proyecto.");
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const config = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
        }
        config[key] = val.trim();
    }
});

const firebaseConfig = {
    apiKey: config.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: config.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: config.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: config.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: config.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: config.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log("ℹ️ Inicializando Firebase con el proyecto:", firebaseConfig.projectId);

// 2. Inicializar la app de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Helper para crear un usuario (en Auth y Firestore)
async function registerUser(email, password, role, displayName, dni, phoneNumber) {
    let uid;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        uid = userCredential.user.uid;
        console.log(`✅ [AUTH] Creado: ${email}`);
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log(`ℹ️ [AUTH] El usuario ${email} ya existe. Obteniendo UID...`);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            uid = userCredential.user.uid;
        } else {
            console.error(`❌ [AUTH] Error con ${email}:`, error.message);
            throw error;
        }
    }

    // Crear/actualizar perfil en la colección de Firestore 'users'
    await setDoc(doc(db, 'users', uid), {
        email,
        role,
        displayName: displayName || '',
        dni: dni || '',
        phoneNumber: phoneNumber || '',
        createdAt: new Date().toISOString()
    });
    console.log(`✅ [FIRESTORE] Perfil guardado para: ${email}`);
    return { uid, dni, displayName };
}

// Helper para crear un trámite
async function createTramite(dni, clientName, type, status, history) {
    const code = `PN-${Math.floor(100000 + Math.random() * 900000)}`;
    const tramiteData = {
        code,
        dni,
        clientName,
        type,
        status,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        history: history.map(h => ({
            status: h.status,
            observation: h.observation || '',
            timestamp: Timestamp.now()
        }))
    };

    const docRef = await addDoc(collection(db, 'tramites'), tramiteData);
    console.log(`✅ [FIRESTORE] Trámite creado: ${code} (${type}) -> ID: ${docRef.id}`);
}

async function seed() {
    try {
        console.log("\n🚀 Iniciando el poblado (seeding) de la base de datos...\n");

        // 1. Crear Administradores
        console.log("--- 🔑 Creando Cuentas Administrativas ---");
        await registerUser(
            'admin@painotrack.com',
            'admin123',
            'admin',
            'Administrador PainoTrack',
            '00000001',
            '+51999999999'
        );

        // 2. Crear Clientes
        console.log("\n--- 👥 Creando Cuentas de Clientes ---");
        const juan = await registerUser(
            'juan.perez@example.com',
            'juan123',
            'client',
            'Juan Pérez',
            '12345678',
            '+51987654321'
        );

        const maria = await registerUser(
            'maria.gomez@example.com',
            'maria123',
            'client',
            'María Gómez',
            '87654321',
            '+51955555555'
        );

        // 3. Crear Trámites de Muestra
        console.log("\n--- 📄 Creando Trámites de Muestra ---");

        // Trámites de Juan Pérez
        await createTramite(
            juan.dni,
            juan.displayName,
            'Escritura',
            'Finalizado',
            [
                { status: 'Recibido', observation: 'Documentos recibidos en ventanilla.' },
                { status: 'En Redacción', observation: 'Minuta redactada por el abogado.' },
                { status: 'Pendiente de Firma', observation: 'Firma completada por ambas partes.' },
                { status: 'En Registros', observation: 'Enviado a SUNARP.' },
                { status: 'Finalizado', observation: 'Inscripción registral exitosa.' }
            ]
        );

        await createTramite(
            juan.dni,
            juan.displayName,
            'Poder',
            'Pendiente de Firma',
            [
                { status: 'Recibido', observation: 'Poder fuera de registro solicitado.' },
                { status: 'En Redacción', observation: 'Preparando la plantilla del poder.' },
                { status: 'Pendiente de Firma', observation: 'Esperando la firma del otorgante.' }
            ]
        );

        // Trámites de María Gómez
        await createTramite(
            maria.dni,
            maria.displayName,
            'Vehicular',
            'Recibido',
            [
                { status: 'Recibido', observation: 'Solicitud de transferencia vehicular ingresada.' }
            ]
        );

        await createTramite(
            maria.dni,
            maria.displayName,
            'Constitución',
            'Observado',
            [
                { status: 'Recibido', observation: 'Reserva de nombre de empresa ingresada.' },
                { status: 'En Redacción', observation: 'Elaborando estatutos de la empresa.' },
                { status: 'Observado', observation: 'El objeto social tiene observaciones por SUNARP.' }
            ]
        );

        console.log("\n🎉 ¡Base de datos poblada exitosamente!");
        console.log("\n==================================================");
        console.log("   🔑 CREDENCIALES DE ACCESO GENERADAS:");
        console.log("==================================================");
        console.log("   [Administrador]");
        console.log("   Correo:    admin@painotrack.com");
        console.log("   Clave:     admin123");
        console.log("   DNI:       00000001");
        console.log("--------------------------------------------------");
        console.log("   [Cliente 1]");
        console.log("   Correo:    juan.perez@example.com");
        console.log("   Clave:     juan123");
        console.log("   DNI:       12345678");
        console.log("--------------------------------------------------");
        console.log("   [Cliente 2]");
        console.log("   Correo:    maria.gomez@example.com");
        console.log("   Clave:     maria123");
        console.log("   DNI:       87654321");
        console.log("==================================================\n");

        process.exit(0);
    } catch (error) {
        console.error("\n❌ Error durante el poblado de la base de datos:", error);
        process.exit(1);
    }
}

seed();
