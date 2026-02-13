import { NextResponse } from 'next/server';
import { TramiteService } from '@/lib/db';
import { TramiteStatus } from '@/lib/db';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { status, observation } = body;

        if (!status) {
            return NextResponse.json({ error: 'Estado requerido' }, { status: 400 });
        }

        await TramiteService.updateStatus(id, status as TramiteStatus, observation);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update Error:", error);
        return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
    }
}
