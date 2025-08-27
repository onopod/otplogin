const http = require('http');
const crypto = require('crypto');

const otpStore = new Map(); // phone -> { code, expiresAt }
const verifiedPhones = new Set();
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

function generateCode() {
  // Generate a 6-digit OTP using cryptographically secure random number
  return String(crypto.randomInt(100000, 1000000));
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
    // Validate phone parameter
    if (!phone || typeof phone !== 'string' || !/^\+?\d{10,15}$/.test(phone)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'invalid_phone_format' }));
      return;
    }
    const code = generateCode();
    otpStore.set(phone, { code, expiresAt: Date.now() + OTP_TTL_MS });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'sent' }));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/verify-otp') {
    const { phone, code } = await readBody(req);
    // Validate phone and code parameters
    if (
      typeof phone !== 'string' ||
      !/^\+?\d{10,15}$/.test(phone) ||
      typeof code !== 'string' ||
      !/^\d{6}$/.test(code)
    ) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'invalid_input' }));
      return;
    }
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
    const { phone, username, password } = await readBody(req);
    // Validate required fields
    if (!phone || typeof phone !== 'string' || !username || typeof username !== 'string' || !password || typeof password !== 'string' || username.trim() === '' || password.trim() === '') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'missing_or_invalid_fields' }));
      return;
    }
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