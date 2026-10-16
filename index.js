const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');
const config = require('./config');
const handleCommand = require('./handler');
const { saveMessage, handleAntiDelete } = require('./antidelete');

const store = makeInMemoryStore({ logger: pino({ level: 'silent' }) });
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state,
    browser: ['Njm-Mini', 'Chrome', '1.0.0'],
    getMessage: async (key) => {
      const msg = await store.loadMessage(key.remoteJid, key.id);
      return msg?.message || { conversation: 'Njm Mini Bot' };
    }
  });

  store.bind(sock.ev);
  sock.ev.on('creds.update', saveCreds);

  // ---------- PAIRING CODE ----------
  if (!sock.authState.creds.registered) {
    console.log('\n╔══════════════════════════════╗');
    console.log('║   🔑 NJM-MINI PAIRING CODE   ║');
    console.log('╚══════════════════════════════╝\n');

    let phoneNumber = await question('📞 Apna WhatsApp number likho (bina + ke)\n👉 Example: 923480772867\n\n👉 Number: ');
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

    if (phoneNumber.length < 10) {
      console.log('\n❌ Galat number! Dobara chalao.');
      process.exit(1);
    }

    try {
      const code = await sock.requestPairingCode(phoneNumber);
      const formatted = code?.match(/.{1,4}/g)?.join('-') || code;

      console.log('\n╔══════════════════════════════╗');
      console.log('║      ✅ PAIRING CODE          ║');
      console.log('╚══════════════════════════════╝\n');
      console.log(`   🔑  ${formatted}\n`);
      console.log('╔══════════════════════════════╗');
      console.log('║  📱 WhatsApp kholo           ║');
      console.log('║  ⚙️  Settings                 ║');
      console.log('║  🔗 Linked Devices            ║');
      console.log('║  ➕ Link a Device             ║');
      console.log('║  🔢 Link with phone number    ║');
      console.log('║  ✍️  Code daalo               ║');
      console.log('╚══════════════════════════════╝\n');
    } catch (err) {
      console.log('\n❌ Pairing error:', err.message);
      process.exit(1);
    }
  }

  // ---------- CONNECTION ----------
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const code = (lastDisconnect?.error)?.output?.statusCode;
      const reconnect = code !== DisconnectReason.loggedOut;
      console.log('❌ Disconnected. Reconnect:', reconnect);
      if (reconnect) setTimeout(() => startBot(), 3000);
    } else if (connection === 'open') {
      console.log(`\n╔══════════════════════════════╗`);
      console.log(`║  ✅ ${config.botName} ONLINE       ║`);
      console.log(`╚══════════════════════════════╝`);
      console.log(`👑 Owner: ${config.ownerName}`);
      console.log(`📞 Number: ${config.displayNumber}`);
      console.log(`🔑 Prefix: ${config.prefix}\n`);
      if (config.alwaysOnline) sock.sendPresenceUpdate('available');
    }
  });

  // ---------- ALWAYS ONLINE ----------
  if (config.alwaysOnline) {
    setInterval(() => sock.sendPresenceUpdate('available').catch(() => {}), 30000);
  }

  // ---------- MESSAGES ----------
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    const msg = messages[0];
    if (!msg.message) return;
    const from = msg.key.remoteJid;

    // Status Handler
    if (from === 'status@broadcast') {
      try {
        if (config.autoStatusView) await sock.readMessages([msg.key]);
        if (config.autoStatusReact) {
          const sender = msg.key.participant || msg.participant;
          if (sender) {
            await sock.sendMessage(from, {
              react: { text: config.statusEmoji, key: msg.key }
            });
          }
        }
      } catch (e) { console.log('Status err:', e.message); }
      return;
    }

    if (config.antiDelete) await saveMessage(sock, msg);

    if (config.autoRead && type === 'notify') {
      await sock.readMessages([msg.key]).catch(() => {});
    }

    if (type === 'notify' && !msg.key.fromMe) {
      await handleCommand(sock, msg, store).catch(e => console.log('Cmd err:', e.message));
    }
  });

  // ---------- ANTI-DELETE ----------
  sock.ev.on('messages.update', async (updates) => {
    if (!config.antiDelete) return;
    for (const u of updates) {
      if (u.update?.message === null) {
        await handleAntiDelete(sock, u.key).catch(() => {});
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message?.protocolMessage) return;
    if (m.message.protocolMessage.type === 0 && config.antiDelete) {
      await handleAntiDelete(sock, m.message.protocolMessage.key).catch(() => {});
    }
  });

  return sock;
}

startBot();