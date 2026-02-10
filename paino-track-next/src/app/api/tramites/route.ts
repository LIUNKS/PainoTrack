import { NextResponse } from 'next/server';
import { TramiteService } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    try {
        if (query) {
            const tramite = await TramiteService.getByCodeOrDni(query);
            if (!tramite) {
                return NextResponse.json({ error: 'Trámite no encontrado' }, { status: 404 });
            }
            return NextResponse.json(tramite);
        }

        const tramites = await TramiteService.getAll();
        return NextResponse.json(tramites);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.dni || !body.clientName || !body.type) {
            return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
        }

        const newTramite = await TramiteService.create({
            dni: body.dni,
            clientName: body.clientName,
            type: body.type,
            status: 'Recibido'
        });

        return NextResponse.json(newTramite, { status: 201 });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
    }
}
