const fs = require('fs-extra');
const path = require('path');
const config = require('./config');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const DB_PATH = path.join(__dirname, 'antidelete.json');
let db = {};
if (fs.existsSync(DB_PATH)) { try { db = fs.readJsonSync(DB_PATH); } catch {} }
function saveDB() { fs.writeJsonSync(DB_PATH, db, { spaces: 2 }); }

async function saveMessage(sock, msg) {
  const id = msg.key.id;
  const from = msg.key.remoteJid;
  if (!msg.message) return;
  if (from === 'status@broadcast') return;
  if (msg.message.reactionMessage) return;

  db[id] = {
    from,
    sender: msg.key.participant || msg.key.remoteJid,
    pushName: msg.pushName || 'User',
    message: msg.message,
    time: Date.now()
  };

  const now = Date.now();
  for (const k of Object.keys(db)) {
    if (now - db[k].time > 2 * 60 * 60 * 1000) delete db[k];
  }
  saveDB();
}

async function handleAntiDelete(sock, key) {
  const data = db[key.id];
  if (!data) return;
  const { from, sender, pushName, message } = data;
  const isGroup = from.endsWith('@g.us');

  let type = 'Unknown', content = '';
  if (message.conversation) { type = 'Text'; content = message.conversation; }
  else if (message.extendedTextMessage) { type = 'Text'; content = message.extendedTextMessage.text; }
  else if (message.imageMessage) { type = 'Image'; content = message.imageMessage.caption || ''; }
  else if (message.videoMessage) { type = 'Video'; content = message.videoMessage.caption || ''; }
  else if (message.audioMessage) type = 'Audio';
  else if (message.stickerMessage) type = 'Sticker';
  else if (message.documentMessage) { type = 'Document'; content = message.documentMessage.fileName || ''; }

  const report =
`╔═══════════════════╗
║ 🚨 ANTI-DELETE 🚨 ║
╚═══════════════════╝

👤 ᴜsᴇʀ : ${pushName}
📞 ɴᴜᴍʙᴇʀ : ${sender.split('@')[0]}
📍 ᴄʜᴀᴛ : ${isGroup ? 'ɢʀᴏᴜᴘ' : 'ᴘʀɪᴠᴀᴛᴇ'}
📂 ᴛʏᴘᴇ : ${type}
${content ? `📝 ᴍsɢ : ${content}` : ''}

⚠️ Ye message delete hua tha!`;

  try {
    await sock.sendMessage(config.ownerNumber + '@s.whatsapp.net', {
      text: report, mentions: [sender]
    });

    const mtype = Object.keys(message)[0];
    if (['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage'].includes(mtype)) {
      const stream = await downloadContentFromMessage(message[mtype], mtype.replace('Message', ''));
      let buffer = Buffer.from([]);
      for await (const c of stream) buffer = Buffer.concat([buffer, c]);
      const sendType = mtype.replace('Message', '').toLowerCase();
      await sock.sendMessage(config.ownerNumber + '@s.whatsapp.net', {
        [sendType]: buffer, caption: `🚨 Deleted ${type} from ${pushName}`
      });
    }
  } catch (e) { console.log('AD err:', e.message); }

  delete db[key.id];
  saveDB();
}

module.exports = { saveMessage, handleAntiDelete };