import fetch from 'node-fetch'; // Requires node-fetch if not on Node 18+. Checking node version first? Assuming Node 18+ for simpler "fetch" or using built-in.
// Node 18 has global fetch.

const API_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@test.com';
const USER_EMAIL = 'user@test.com';
const PASSWORD = 'password123';

let userToken = '';
let adminToken = '';

async function login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error(`Login failed for ${email}: ${res.statusText}`);
    const data = await res.json();
    return data.token;
}

// Helper to pause
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function runTests() {
    console.log('Starting Verification Suite...');

    try {
        // 1. Authenticate
        console.log('1. Authenticating users...');
        userToken = await login(USER_EMAIL, PASSWORD);
        adminToken = await login(ADMIN_EMAIL, PASSWORD);
        console.log('✅ Authentication successful');

        // 2. Test 1 Shipment Registration
        console.log('2. Testing Single Shipment Registration...');
        const shipmentData = {
            origin: 'Madrid',
            destination: 'Malabo',
            recipient: { name: 'Juan Perez', phone: '123456789' },
            weight: 5,
            price: 50,
            description: 'Test Shipment 1'
        };

        const res1 = await fetch(`${API_URL}/shipments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify(shipmentData)
        });

        if (res1.status !== 201) throw new Error(`Failed to create shipment: ${res1.status}`);
        const shipment1 = await res1.json();
        console.log(`✅ Shipment created: ${shipment1.trackingNumber}`);
        const transactionId = shipment1.transactionId;

        // 3. Test Invoice Generation (Receipt)
        console.log('3. Verifying Invoice Generation...');
        if (!transactionId) throw new Error('No transaction ID returned with shipment');

        const receiptRes = await fetch(`${API_URL}/transactions/${transactionId}/receipt`, {
            headers: { 'Authorization': `Bearer ${userToken}` } // Assuming endpoint might be protected? The code showed it wasn't but "mine" was. Receipt endpoint: router.get('/:id/receipt', ...) -> No protect?
            // Actually receipt endpoint didn't have protect middleware in the file I read.
        });

        if (receiptRes.status !== 200) throw new Error(`Failed to get receipt: ${receiptRes.status}`);
        const contentType = receiptRes.headers.get('content-type');
        if (!contentType.includes('application/pdf')) throw new Error(`Invalid content type for receipt: ${contentType}`);
        console.log('✅ Invoice PDF generated successfully');

        // 4. Test 3 Simultaneous Registrations
        console.log('4. Testing 3 Simultaneous Shipments...');
        const promises = [1, 2, 3].map(i => {
            return fetch(`${API_URL}/shipments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({
                    ...shipmentData,
                    description: `Simultaneous Shipment ${i}`,
                    price: 10 + i
                })
            }).then(r => r.json());
        });

        const results = await Promise.all(promises);
        if (results.some(r => !r.trackingNumber)) throw new Error('One of the simultaneous shipments failed');
        console.log(`✅ 3 Shipments created: ${results.map(r => r.trackingNumber).join(', ')}`);

        // 5. Verify Only Admin Can Mark Delivered
        console.log('5. Verifying Admin Privileges...');
        const targetShipmentId = shipment1._id;

        // Try as User
        const userUpdateRes = await fetch(`${API_URL}/shipments/${targetShipmentId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ status: 'Entregado' })
        });

        if (userUpdateRes.status !== 403) {
            console.error('User update response:', userUpdateRes.status);
            throw new Error('User was able to update status (should be 403)');
        }
        console.log('✅ User blocked from updating status');

        // Try as Admin
        const adminUpdateRes = await fetch(`${API_URL}/shipments/${targetShipmentId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({ status: 'Entregado' })
        });

        if (adminUpdateRes.status !== 200) throw new Error(`Admin failed to update status: ${adminUpdateRes.status}`);
        const updatedShipment = await adminUpdateRes.json();
        if (updatedShipment.status !== 'Entregado') throw new Error('Status not updated');
        console.log('✅ Admin successfully updated status');

        // 6. Verify Accounting Report
        console.log('6. Verifying Accounting Report Generation...');
        const reportRes = await fetch(`${API_URL}/reports/accounting`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        if (reportRes.status !== 200) throw new Error(`Failed to get report: ${reportRes.status}`);
        const reportText = await reportRes.text();
        if (!reportText.includes('FECHA;TIPO OPERACION')) throw new Error('Invalid CSV format');
        console.log('✅ Accounting report generated');

        console.log('\n🎉 ALL AUTOMATED TESTS PASSED 🎉');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        process.exit(1);
    }
}

runTests();
