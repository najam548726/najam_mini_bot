const config = require('../config');
const startTime = Date.now();

function runtime() {
  const ms = Date.now() - startTime;
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000);
  return `${h}h ${m}m ${s}s`;
}

module.exports = {
  ping: async (sock, msg, from) => {
    const t = Date.now();
    await sock.sendMessage(from, { text: `🏓 *Pong!*  ⚡ ${Date.now() - t}ms` }, { quoted: msg });
  },

  alive: async (sock, msg, from) => {
    const text = `╔═══════════════════════╗
║  ✨ *${config.botName}* ✨
╚═══════════════════════╝

╭━━〔 👤 ɪɴғᴏ 〕━━╮
┃ 👑 ᴏᴡɴᴇʀ : ${config.ownerName}
┃ 📞 ᴄᴏɴᴛᴀᴄᴛ : ${config.displayNumber}
┃ 🏷️ ᴛᴇᴀᴍ : ${config.teamName}
╰━━━━━━━━━━━━━━━╯

╭━━〔 ⚙️ sʏsᴛᴇᴍ 〕━━╮
┃ 📱 ʙᴀɪʟᴇʏs : ᴍᴜʟᴛɪ ᴅᴇᴠɪᴄᴇ
┃ ⚙️ ᴛʏᴘᴇ : ɴᴏᴅᴇᴊs
┃ 📦 ᴠᴇʀsɪᴏɴ : ${config.version}
┃ ⏳ ʀᴜɴᴛɪᴍᴇ : ${runtime()}
┃ 💾 ʀᴀᴍ : ${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)}MB
╰━━━━━━━━━━━━━━━╯

╭━━〔 🔑 ᴄᴏɴғɪɢ 〕━━╮
┃ 🔑 ᴘʀᴇғɪx : ${config.prefix}
┃ 🛡️ ᴍᴏᴅᴇ : ${config.mode}
┃ 🟢 sᴛᴀᴛᴜs : *ᴏɴʟɪɴᴇ*
╰━━━━━━━━━━━━━━━╯

> _Powered by ${config.ownerName}_ 💫`;

    try {
      await sock.sendMessage(from, { image: { url: config.botImage }, caption: text }, { quoted: msg });
    } catch {
      await sock.sendMessage(from, { text }, { quoted: msg });
    }
  },

  menu: async (sock, msg, from) => {
    const p = config.prefix;
    const text = `╔═══════════════════════╗
║  ✨ *${config.botName}* ✨
╚═══════════════════════╝

╭━━〔 👤 ᴜsᴇʀ 〕━━╮
┃ 👑 ᴏᴡɴᴇʀ : ${config.ownerName}
┃ 🏷️ ᴛᴇᴀᴍ : ${config.teamName}
┃ 📅 ᴅᴀᴛᴇ : ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
┃ ⏳ ʀᴜɴᴛɪᴍᴇ : ${runtime()}
┃ 📦 ᴠᴇʀsɪᴏɴ : ${config.version}
╰━━━━━━━━━━━━━━━╯

╭━━〔 🏠 ᴍᴀɪɴ 〕━━╮
┃ ⬡ ${p}menu
┃ ⬡ ${p}alive
┃ ⬡ ${p}ping
┃ ⬡ ${p}owner
┃ ⬡ ${p}repo
╰━━━━━━━━━━━━━━━╯

╭━━〔 👑 ᴏᴡɴᴇʀ 〕━━╮
┃ ⬡ ${p}vv
┃ ⬡ ${p}block
┃ ⬡ ${p}unblock
┃ ⬡ ${p}setpp
┃ ⬡ ${p}setname
┃ ⬡ ${p}setbio
╰━━━━━━━━━━━━━━━╯

╭━━〔 👥 ɢʀᴏᴜᴘ 〕━━╮
┃ ⬡ ${p}kick
┃ ⬡ ${p}add
┃ ⬡ ${p}promote
┃ ⬡ ${p}demote
┃ ⬡ ${p}mute
┃ ⬡ ${p}unmute
┃ ⬡ ${p}tagall
┃ ⬡ ${p}link
┃ ⬡ ${p}revoke
╰━━━━━━━━━━━━━━━╯

╭━━〔 🎮 ғᴜɴ 〕━━╮
┃ ⬡ ${p}joke
┃ ⬡ ${p}quote
┃ ⬡ ${p}8ball
┃ ⬡ ${p}dice
┃ ⬡ ${p}coin
┃ ⬡ ${p}truth
┃ ⬡ ${p}dare
╰━━━━━━━━━━━━━━━╯

╭━━〔 🎨 ᴛᴏᴏʟs 〕━━╮
┃ ⬡ ${p}sticker
┃ ⬡ ${p}vv
╰━━━━━━━━━━━━━━━╯

✨ _Powered by ${config.ownerName}_ ✨`;

    try {
      await sock.sendMessage(from, { image: { url: config.botImage }, caption: text }, { quoted: msg });
    } catch {
      await sock.sendMessage(from, { text }, { quoted: msg });
    }
  },

  owner: async (sock, msg, from) => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${config.ownerName}
TEL;type=CELL;type=VOICE;waid=${config.ownerNumber}:${config.displayNumber}
END:VCARD`;
    await sock.sendMessage(from, {
      contacts: { displayName: config.ownerName, contacts: [{ vcard }] }
    }, { quoted: msg });
  },

  repo: async (sock, msg, from) => {
    await sock.sendMessage(from, {
      text: `📦 *ʀᴇᴘᴏ*\n\n👤 ${config.ownerName}\n📞 ${config.displayNumber}\n🏷️ ${config.teamName}\n\n_GitHub repo coming soon..._`
    }, { quoted: msg });
  },

  sticker: async (sock, msg, from) => {
    const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted?.imageMessage) return sock.sendMessage(from, { text: '❌ Image reply karo' }, { quoted: msg });
    try {
      const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
      const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
      let buffer = Buffer.from([]);
      for await (const c of stream) buffer = Buffer.concat([buffer, c]);
      await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
    } catch (e) {
      await sock.sendMessage(from, { text: `❌ ${e.message}` }, { quoted: msg });
    }
  }
};