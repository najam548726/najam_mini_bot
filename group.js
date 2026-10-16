const config = require('../config');

async function isAdmin(sock, from, sender) {
  try {
    const meta = await sock.groupMetadata(from);
    const p = meta.participants.find(x => x.id === sender);
    return p?.admin === 'admin' || p?.admin === 'superadmin';
  } catch { return false; }
}

module.exports = {
  kick: async (sock, msg, from, sender, args, isGroup) => {
    if (!isGroup || !await isAdmin(sock, from, sender)) return;
    const target = msg.message.extendedTextMessage?.contextInfo?.participant;
    if (!target) return;
    await sock.groupParticipantsUpdate(from, [target], 'remove');
    await sock.sendMessage(from, { text: `✅ Kicked` }, { quoted: msg });
  },

  add: async (sock, msg, from, sender, args, isGroup) => {
    if (!isGroup || !await isAdmin(sock, from, sender) || !args[0]) return;
    const num = args[0].replace(/\D/g, '') + '@s.whatsapp.net';
    await sock.groupParticipantsUpdate(from, [num], 'add');
    await sock.sendMessage(from, { text: `✅ Added` }, { quoted: msg });
  },

  promote: async (sock, msg, from, sender, args, isGroup) => {
    if (!isGroup || !await isAdmin(sock, from, sender)) return;
    const target = msg.message.extendedTextMessage?.contextInfo?.participant;
    if (!target) return;
    await sock.groupParticipantsUpdate(from, [target], 'promote');
    await sock.sendMessage(from, { text: `✅ Promoted` }, { quoted: msg });
  },

  demote: async (sock, msg, from, sender, args, isGroup) => {
    if (!isGroup || !await isAdmin(sock, from, sender)) return;
    const target = msg.message.extendedTextMessage?.contextInfo?.participant;
    if (!target) return;
    await sock.groupParticipantsUpdate(from, [target], 'demote');
    await sock.sendMessage(from, { text: `✅ Demoted` }, { quoted: msg });
  },

  mute: async (sock, msg, from, sender, args, isGroup) => {
    if (!isGroup || !await isAdmin(sock, from, sender)) return;
    await sock.groupSettingUpdate(from, 'announcement');
    await sock.sendMessage(from, { text: '🔇 Muted' }, { quoted: msg });
  },

  unmute: async (sock, msg, from, sender, args, isGroup) => {
    if (!isGroup || !await isAdmin(sock, from, sender)) return;
    await sock.groupSettingUpdate(from, 'not_announcement');
    await sock.sendMessage(from, { text: '🔊 Unmuted' }, { quoted: msg });
  },

  tagall: async (sock, msg, from, sender, args, isGroup) => {
    if (!isGroup || !await isAdmin(sock, from, sender)) return;
    const meta = await sock.groupMetadata(from);
    const mentions = meta.participants.map(p => p.id);
    const txt = args.length ? args.join(' ') : 'Attention everyone!';
    let list = `╔═══ ✨ ᴛᴀɢ ᴀʟʟ ✨ ═══╗\n\n${txt}\n\n`;
    meta.participants.forEach((p, i) => { list += `${i + 1}. @${p.id.split('@')[0]}\n`; });
    list += `\n╚═════════════════╝`;
    await sock.sendMessage(from, { text: list, mentions }, { quoted: msg });
  },

  link: async (sock, msg, from, sender, args, isGroup) => {
    if (!isGroup || !await isAdmin(sock, from, sender)) return;
    const code = await sock.groupInviteCode(from);
    await sock.sendMessage(from, { text: `🔗 https://chat.whatsapp.com/${code}` }, { quoted: msg });
  },

  revoke: async (sock, msg, from, sender, args, isGroup) => {
    if (!isGroup || !await isAdmin(sock, from, sender)) return;
    await sock.groupRevokeInvite(from);
    await sock.sendMessage(from, { text: '✅ Link reset' }, { quoted: msg });
  }
};