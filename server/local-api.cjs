const { randomBytes, scryptSync, timingSafeEqual } = require('node:crypto');
const { existsSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');
const jsonServer = require('json-server');

const accountsPath = process.env.NOXWAY_ACCOUNTS_FILE || join(__dirname, 'accounts.local.json');
if (!existsSync(accountsPath)) {
  writeFileSync(accountsPath, '{"accounts":[]}', { mode: 0o600 });
}

const accounts = jsonServer.router(accountsPath).db.get('accounts');
const demo = jsonServer.router(join(__dirname, '..', 'db.json'));
const server = jsonServer.create();
const sessions = new Map();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sessionDuration = 8 * 60 * 60 * 1000;

server.use(jsonServer.defaults());
server.use(jsonServer.bodyParser);

const clean = (value, limit = 150) => typeof value === 'string' ? value.trim().slice(0, limit) : '';
const normalizeEmail = (email) => clean(email, 254).toLowerCase();
const initials = (name) => name.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();

server.post('/auth/register', (req, res) => {
  const { fullName, email, password, shiftType } = req.body ?? {};
  const name = clean(fullName);
  const address = normalizeEmail(email);
  if (!name || !emailPattern.test(address) || typeof password !== 'string' ||
      password.length < 8 || password.length > 128 || !['day', 'night', 'rotating'].includes(shiftType)) {
    return res.status(400).json({ message: 'Revisa tu nombre, correo, turno y contraseña.' });
  }
  if (accounts.find({ email: address }).value()) {
    return res.status(409).json({ message: 'Ya hay una cuenta con ese correo.' });
  }

  const salt = randomBytes(16).toString('hex');
  const passwordHash = scryptSync(password, salt, 64).toString('hex');
  const id = (accounts.maxBy('id').value()?.id ?? 0) + 1;
  accounts.push({
    id, email: address, salt, passwordHash,
    profile: {
      id, fullName: name, email: address, avatar: initials(name), shiftType,
      role: 'Trabajador', phone: '', schedule: '', transport: '', district: '',
      privacyGpsActiveOnly: true, privacyEncryptedHistory: false, privacyAnonymousRatings: false,
      memberSince: 'Cuenta local de prueba',
    },
  }).write();
  return res.status(201).end();
});

server.post('/auth/login', (req, res) => {
  const { email, password } = req.body ?? {};
  const account = accounts.find({ email: normalizeEmail(email) }).value();
  if (!account || typeof password !== 'string' || password.length > 128 ||
      !timingSafeEqual(scryptSync(password, account.salt, 64), Buffer.from(account.passwordHash, 'hex'))) {
    return res.status(401).json({ message: 'El correo o la contraseña son incorrectos.' });
  }
  const now = Date.now();
  for (const [key, session] of sessions) {
    if (session.expiresAt <= now) sessions.delete(key);
  }
  const token = randomBytes(32).toString('base64url');
  sessions.set(token, { accountId: account.id, expiresAt: now + sessionDuration });
  return res.json({ token, profile: account.profile });
});

server.use('/me', (req, res, next) => {
  const token = req.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1];
  const session = sessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return res.status(401).json({ message: 'Vuelve a iniciar sesión.' });
  }
  res.locals.token = token;
  res.locals.account = accounts.find({ id: session.accountId });
  return next();
});

server.get('/me/profile', (_req, res) => res.json(res.locals.account.value().profile));

server.patch('/me/profile', (req, res) => {
  const profile = res.locals.account.value().profile;
  const body = req.body ?? {};
  const fullName = clean(body.fullName);
  if (!fullName || !['day', 'night', 'rotating'].includes(body.shiftType)) {
    return res.status(400).json({ message: 'El nombre y el tipo de turno son obligatorios.' });
  }

  const updated = { ...profile, fullName, avatar: initials(fullName), shiftType: body.shiftType };
  for (const field of ['phone', 'schedule', 'transport', 'district']) {
    updated[field] = clean(body[field]);
  }
  for (const field of ['privacyGpsActiveOnly', 'privacyEncryptedHistory', 'privacyAnonymousRatings']) {
    updated[field] = body[field] === true;
  }
  res.locals.account.assign({ profile: updated }).write();
  return res.json(updated);
});

server.get('/me/journeys', (_req, res) => {
  return res.json(res.locals.account.value().journeys ?? []);
});

server.post('/me/journeys', (req, res) => {
  const account = res.locals.account;
  const journeys = account.value().journeys ?? [];
  if (journeys.some((journey) => !journey.finishedAt)) {
    return res.status(409).json({ message: 'Finaliza el trayecto activo antes de iniciar otro.' });
  }
  const origin = clean(req.body?.origin);
  const destination = clean(req.body?.destination);
  if (!origin || !destination) {
    return res.status(400).json({ message: 'Indica el origen y el destino.' });
  }
  const journey = {
    id: randomBytes(12).toString('hex'), origin, destination,
    startedAt: new Date().toISOString(), finishedAt: null,
  };
  account.assign({ journeys: [journey, ...journeys] }).write();
  return res.status(201).json(journey);
});

server.patch('/me/journeys/:id/finish', (req, res) => {
  const account = res.locals.account;
  const journeys = account.value().journeys ?? [];
  const current = journeys.find((journey) => journey.id === req.params.id);
  if (!current) return res.sendStatus(404);
  if (current.finishedAt) return res.json(current);

  const finished = { ...current, finishedAt: new Date().toISOString() };
  account.assign({
    journeys: journeys.map((journey) => journey.id === finished.id ? finished : journey),
  }).write();
  return res.json(finished);
});

server.post('/me/logout', (_req, res) => {
  sessions.delete(res.locals.token);
  return res.status(204).end();
});

server.use((req, res, next) => req.method === 'GET' ? next() : res.sendStatus(404));
server.use(demo);
const port = process.env.NOXWAY_API_PORT || 3000;
server.listen(Number(port), '127.0.0.1', () => console.log(`Noxway API local en http://localhost:${port}`));
