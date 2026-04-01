const http = require('http');

async function doRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({
                status: res.statusCode,
                headers: res.headers,
                body: body ? JSON.parse(body) : null
            }));
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function seed() {
    console.log('Registering user...');
    const register = await doRequest({
        hostname: 'localhost', port: 3001, path: '/auth/register', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { email: 'visual_admin@qa.local', password: 'ValidPassword123!', name: 'Visual QA Admin' });

    let cookies = register.headers['set-cookie'];
    let authCookie = cookies ? cookies[0].split(';')[0] : '';
    console.log('Cookie obtained:', authCookie ? 'YES' : 'NO');

    console.log('Creating Product...');
    const prod = await doRequest({
        hostname: 'localhost', port: 3001, path: '/api/products', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': authCookie }
    }, { sku: 'VISUAL-123', name: 'Zebra Label Roll', price: 100, stock: 50 });

    console.log('Creating Order...');
    const ord = await doRequest({
        hostname: 'localhost', port: 3001, path: '/api/orders', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': authCookie }
    }, {
        orderNumber: 'VISUAL-ORD-01', sourcePlugin: 'manual', status: 'NEW', total: 200,
        customerEmail: 'customer@zebra.local', customerName: 'Zebra Customer',
        items: [{ productId: prod.body.id, productName: 'Zebra Label Roll', quantity: 2, unitPrice: 100 }]
    });

    console.log('Seeding Complete.', ord.body.id);
}
seed().catch(console.error);
