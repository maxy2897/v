// using global fetch

const API_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@test.com';
const PASSWORD = 'password123';

async function login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error(`Login failed: ${res.statusText}`);
    return (await res.json()).token;
}

async function verifyFilters() {
    console.log('Starting Filter Verification...');

    try {
        const token = await login(ADMIN_EMAIL, PASSWORD);
        console.log('✅ Admin Logged In');

        // Create Shipment 1 (Pendiente)
        const s1 = await fetch(`${API_URL}/shipments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                origin: 'FilterTest1', destination: 'Malabo', recipient: { name: 'R1' }, weight: 1, price: 10
            })
        }).then(r => r.json());

        // Create Shipment 2 (to be Entregado)
        const s2 = await fetch(`${API_URL}/shipments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                origin: 'FilterTest2', destination: 'Malabo', recipient: { name: 'R2' }, weight: 1, price: 10
            })
        }).then(r => r.json());

        // Update s2 to Entregado
        await fetch(`${API_URL}/shipments/${s2._id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status: 'Entregado' })
        });
        console.log('✅ Created 2 shipments, updated one to Entregado');

        // Test Filter: Entregado
        const resEntregado = await fetch(`${API_URL}/shipments?status=Entregado`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const delivered = await resEntregado.json();
        const hasS2 = delivered.some(s => s._id === s2._id);
        const hasS1 = delivered.some(s => s._id === s1._id);

        if (hasS2 && !hasS1) {
            console.log(`✅ Filter "Entregado" works: Found ${delivered.length} delivered shipments (Success)`);
        } else {
            console.error(`❌ Filter "Entregado" Failed. Found S2: ${hasS2}, Found S1: ${hasS1}`);
            process.exit(1);
        }

        // Test Filter: Pendiente
        const resPendiente = await fetch(`${API_URL}/shipments?status=Pendiente`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const pending = await resPendiente.json();
        const hasS2_p = pending.some(s => s._id === s2._id);
        const hasS1_p = pending.some(s => s._id === s1._id);

        if (hasS1_p && !hasS2_p) {
            console.log(`✅ Filter "Pendiente" works: Found ${pending.length} pending shipments (Success)`);
        } else {
            console.error(`❌ Filter "Pendiente" Failed. Found S2: ${hasS2_p}, Found S1: ${hasS1_p}`);
            process.exit(1);
        }

    } catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    }
}

verifyFilters();
