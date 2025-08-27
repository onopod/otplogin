import test from 'node:test';
import assert from 'node:assert';
import { createServer, otpStore, verifiedPhones } from '../server.js';

const phone = '+819012345678';

function startServer() {
  return new Promise(resolve => {
    const server = createServer();
    const listener = server.listen(0, () => {
      const { port } = listener.address();
      resolve({ server, port });
    });
  });
}

async function post(port, path, body) {
  const res = await fetch(`http://localhost:${port}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

test('OTP flow end-to-end', async (t) => {
  const { server, port } = await startServer();

  // send OTP
  let data = await post(port, '/api/send-otp', { phone });
  assert.deepStrictEqual(data, { status: 'sent' });
  let entry = otpStore.get(phone);
  assert.ok(entry);

  // wrong code
  data = await post(port, '/api/verify-otp', { phone, code: '000000' });
  assert.deepStrictEqual(data, { status: 'invalid' });

  // expired code
  entry.expiresAt = Date.now() - 1000;
  data = await post(port, '/api/verify-otp', { phone, code: entry.code });
  assert.deepStrictEqual(data, { status: 'expired_or_not_found' });

  // resend OTP
  data = await post(port, '/api/send-otp', { phone });
  assert.deepStrictEqual(data, { status: 'sent' });
  entry = otpStore.get(phone);

  // correct code
  data = await post(port, '/api/verify-otp', { phone, code: entry.code });
  assert.deepStrictEqual(data, { status: 'verified' });
  assert.ok(verifiedPhones.has(phone));

  // register without verification
  data = await post(port, '/api/register', { phone: '+811234567890', username: 'x', password: 'y' });
  assert.deepStrictEqual(data, { status: 'not_verified' });

  // register after verification
  data = await post(port, '/api/register', { phone, username: 'taro', password: 'pass' });
  assert.deepStrictEqual(data, { status: 'registered' });
  assert.ok(!verifiedPhones.has(phone));

  server.close();
});
