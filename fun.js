const jokes = [
  "Teacher: Homework kahan hai?\nStudent: Sir, WiFi down tha 😂",
  "Doctor: Roz 5 baje utho.\nPatient: Doctor sahab, main 5 baje tak sota hun 😴",
  "Biwi: Mujhe kitna pyar karte ho?\nShohar: Itna ke mobile bhi tang kar deta hai 📱",
  "Boss: Tum late kyun aaye?\nEmployee: Sir, neend puri nahi hui thi 😅"
];

const quotes = [
  "Kamyabi ka raaz mehnat aur sabr hai.",
  "Jo apne aap par bharosa rakhta hai, wo haar nahi sakta.",
  "Zindagi ek safar hai, har din naya sabak.",
  "Muskurane wale ke paas duniya bhar ki khushi hoti hai.",
  "Waqt se pehle aur naseeb se zyada kisi ko kuch nahi milta."
];

const truths = [
  "Tumhari sab se badi sharam ki baat kya hai?",
  "Kis se pehli baar pyar hua tha?",
  "Aakhri baar kab jhoot bola tha?",
  "Tumhare phone mein sab se zyada kisse ki pics hain?"
];

const dares = [
  "Apni crush ka naam batao!",
  "Ek minute tak baby voice mein baat karo!",
  "Apni latest photo sab ko bhejo!",
  "Kisi bhi group member ko 'I love you' bolo!"
];

function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

module.exports = {
  joke: async (sock, msg, from) => {
    await sock.sendMessage(from, { text: `😂 *ᴊᴏᴋᴇ*\n\n${pick(jokes)}` }, { quoted: msg });
  },
  quote: async (sock, msg, from) => {
    await sock.sendMessage(from, { text: `💭 *ǫᴜᴏᴛᴇ*\n\n${pick(quotes)}` }, { quoted: msg });
  },
  '8ball': async (sock, msg, from, sender, args) => {
    if (!args.length) return sock.sendMessage(from, { text: '❓ Sawal likho!' }, { quoted: msg });
    const a = ['Haan bilkul ✅', 'Nahi ❌', 'Shayad 🤔', 'Pakka 💯', 'Mujhe nahi pata 🤷', 'Bilkul nahi 🚫', 'Try karo 😉'];
    await sock.sendMessage(from, { text: `🎱 *sᴀᴡᴀʟ:* ${args.join(' ')}\n*ᴊᴀᴡᴀʙ:* ${pick(a)}` }, { quoted: msg });
  },
  dice: async (sock, msg, from) => {
    await sock.sendMessage(from, { text: `🎲 ᴅɪᴄᴇ: *${Math.floor(Math.random() * 6) + 1}*` }, { quoted: msg });
  },
  coin: async (sock, msg, from) => {
    await sock.sendMessage(from, { text: `🪙 ${Math.random() < 0.5 ? 'ʜᴇᴀᴅs' : 'ᴛᴀɪʟs'}` }, { quoted: msg });
  },
  truth: async (sock, msg, from) => {
    await sock.sendMessage(from, { text: `💬 *ᴛʀᴜᴛʜ*\n\n${pick(truths)}` }, { quoted: msg });
  },
  dare: async (sock, msg, from) => {
    await sock.sendMessage(from, { text: `🔥 *ᴅᴀʀᴇ*\n\n${pick(dares)}` }, { quoted: msg });
  }
};