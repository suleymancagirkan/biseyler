const Discord = require('discord.js')
const db = require('quick.db')
const { no, igne, yes } = require('../emoji.json');
exports.run = async (client, message, args) => { 

  if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send(`${no} **Bu komutu kullanabilmek için** "\`Yönetici\`" **yetkisine sahip olmalısın.**`);
let logk = message.mentions.channels.first();
let logkanal = await db.fetch(`levellog_${message.guild.id}`)  
  if (args[0] === "sıfırla" || args[0] === "kapat") {
    if(!logkanal) return message.channel.send(`${igne} **Level Log Kanalı Zaten ayarlı değil**`);
    db.delete(`levellog_${message.guild.id}`)
   message.channel.send(`${yes} **Level Log Kanalı başarıyla sıfırlandı.**`);
    return
  } 
if (!logk) return message.channel.send(`${igne} **Bir level log kanalı belirtmelisin.**`);
db.set(`levellog_${message.guild.id}`, logk.id)
message.channel.send(`**${yes} Level log kanalı başarıyla ${logk} olarak ayarlandı.**`);
};
exports.config = {
  name: "levellog",
  guildOnly: false,
  aliases: ["level-log"],
};