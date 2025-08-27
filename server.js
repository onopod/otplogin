const http = require('http');

const otpStore = new Map(); // phone -> { code, expiresAt }
const verifiedPhones = new Set();
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

async function handler(req, res) {
  if (req.method === 'POST' && req.url === '/api/send-otp') {
    const { phone } = await readBody(req);
    const code = generateCode();
    otpStore.set(phone, { code, expiresAt: Date.now() + OTP_TTL_MS });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'sent' }));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/verify-otp') {
    const { phone, code } = await readBody(req);
    const entry = otpStore.get(phone);
    if (!entry || entry.expiresAt < Date.now()) {
      otpStore.delete(phone);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'expired_or_not_found' }));
      return;
    }
    if (entry.code !== code) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'invalid' }));
      return;
    }
    otpStore.delete(phone);
    verifiedPhones.add(phone);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'verified' }));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/register') {
    const { phone } = await readBody(req);
    const status = verifiedPhones.has(phone) ? 'registered' : 'not_verified';
    if (status === 'registered') {
      verifiedPhones.delete(phone);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
}

function createServer() {
  return http.createServer((req, res) => {
    handler(req, res).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'internal_error' }));
    });
  });
}

if (require.main === module) {
  const server = createServer();
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = { createServer, otpStore, verifiedPhones, OTP_TTL_MS };
