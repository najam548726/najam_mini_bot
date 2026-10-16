const config = require('../config');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

function isOwner(sender) {
  return sender.includes(config.ownerNumber);
}

module.exports = {
  vv: async (sock, msg, from) => {
    const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) return sock.sendMessage(from, { text: '❌ View-once message reply karo' }, { quoted: msg });

    const mtype = Object.keys(quoted)[0];
    if (!['imageMessage', 'videoMessage', 'audioMessage'].includes(mtype)) {
      return sock.sendMessage(from, { text: '❌ Ye view-once media nahi hai' }, { quoted: msg });
    }

    try {
      const stream = await downloadContentFromMessage(quoted[mtype], mtype.replace('Message', ''));
      let buffer = Buffer.from([]);
      for await (const c of stream) buffer = Buffer.concat([buffer, c]);
      const sendType = mtype.replace('Message', '').toLowerCase();
      await sock.sendMessage(from, {
        [sendType]: buffer,
        caption: `👁️ *ᴠɪᴇᴡ ᴏɴᴄᴇ ʀᴇᴠᴇᴀʟᴇᴅ*\n\n👑 By: ${config.ownerName}`
      }, { quoted: msg });
    } catch (e) {
      await sock.sendMessage(from, { text: `❌ ${e.message}` }, { quoted: msg });
    }
  },

  block: async (sock, msg, from, sender, args) => {
    if (!isOwner(sender)) return sock.sendMessage(from, { text: '❌ Owner only' }, { quoted: msg });
    const target = msg.message.extendedTextMessage?.contextInfo?.participant
      || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);
    if (!target) return;
    await sock.updateBlockStatus(target, 'block');
    await sock.sendMessage(from, { text: `✅ Blocked: ${target.split('@')[0]}` }, { quoted: msg });
  },

  unblock: async (sock, msg, from, sender, args) => {
    if (!isOwner(sender)) return;
    const target = msg.message.extendedTextMessage?.contextInfo?.participant
      || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);
    if (!target) return;
    await sock.updateBlockStatus(target, 'unblock');
    await sock.sendMessage(from, { text: `✅ Unblocked` }, { quoted: msg });
  },

  setpp: async (sock, msg, from, sender) => {
    if (!isOwner(sender)) return;
    const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted?.imageMessage) return sock.sendMessage(from, { text: '❌ Image reply karo' }, { quoted: msg });
    try {
      const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
      let buffer = Buffer.from([]);
      for await (const c of stream) buffer = Buffer.concat([buffer, c]);
      await sock.updateProfilePicture(sock.user.id, buffer);
      await sock.sendMessage(from, { text: '✅ Profile pic updated' }, { quoted: msg });
    } catch (e) {
      await sock.sendMessage(from, { text: `❌ ${e.message}` }, { quoted: msg });
    }
  },

  setname: async (sock, msg, from, sender, args) => {
    if (!isOwner(sender) || !args.length) return;
    try {
      await sock.updateProfileName(args.join(' '));
      await sock.sendMessage(from, { text: `✅ Name set` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(from, { text: `❌ ${e.message}` }, { quoted: msg }); }
  },

  setbio: async (sock, msg, from, sender, args) => {
    if (!isOwner(sender) || !args.length) return;
    try {
      await sock.updateProfileStatus(args.join(' '));
      await sock.sendMessage(from, { text: `✅ Bio updated` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(from, { text: `❌ ${e.message}` }, { quoted: msg }); }
  }
};