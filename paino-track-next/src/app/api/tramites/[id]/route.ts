import { NextResponse } from 'next/server';
import { TramiteService, TramiteStatus } from '@/lib/db';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const WEBHOOK_URL = 'https://jgcamiloaga.app.n8n.cloud/webhook/18168330-d16a-4b0d-9ab7-9302424194de';

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

        let clientData = null;
        try {
            const tramiteDoc = await getDoc(doc(db, 'tramites', id));

            if (tramiteDoc.exists()) {
                const tramiteData = tramiteDoc.data();
                let phoneNumber = '';

                if (tramiteData.dni) {
                    const usersRef = collection(db, 'users');
                    const q = query(usersRef, where('dni', '==', tramiteData.dni));
                    const userSnap = await getDocs(q);

                    if (!userSnap.empty) {
                        const userData = userSnap.docs[0].data();
                        phoneNumber = userData.phoneNumber || '';
                    }
                }

                clientData = {
                    name: tramiteData.clientName,
                    phone: phoneNumber,
                    code: tramiteData.code,
                    type: tramiteData.type
                };
            }
        } catch (error) {
            console.error('Error fetching client data:', error);
        }

        return NextResponse.json({ success: true, clientData });
    } catch (error) {
        console.error("Update Error:", error);
        return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
    }
}
