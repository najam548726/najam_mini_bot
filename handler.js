const config = require('./config');
const general = require('./commands/general');
const owner = require('./commands/owner');
const group = require('./commands/group');
const fun = require('./commands/fun');

const commands = { ...general, ...owner, ...group, ...fun };

module.exports = async (sock, msg, store) => {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');

  const body =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    msg.message.imageMessage?.caption ||
    msg.message.videoMessage?.caption || '';

  if (!body.startsWith(config.prefix)) return;

  const args = body.slice(config.prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  if (!commands[cmd]) return;

  try {
    await commands[cmd](sock, msg, from, sender, args, isGroup, store);
  } catch (e) {
    console.log(`[${cmd}] error:`, e.message);
    await sock.sendMessage(from, { text: `❌ Error: ${e.message}` }, { quoted: msg });
  }
};