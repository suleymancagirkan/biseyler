const { MessageEmbed } = require('discord.js');
const settings = require("../config.js");
const db = require("quick.db");

exports.run = async (client, message, args) => {

    if (!message.member.roles.cache.has(settings.yoneticiROL) && !message.member.roles.cache.has(settings.leadROL) && !message.member.hasPermission("ADMINISTRATOR")) return;

    let beta = new MessageEmbed().setColor('#f1f1f1').setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }));

    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
    let user = message.guild.member(member)
    if(!user) return message.channel.send(beta.setDescription(`<@!${message.author.id}> bir kullanıcı belirtiniz.`));
    let isim = args[1];
    if (!isim) return message.channel.send(beta.setDescription(`<@!${message.author.id}> kullanıcının adını belirtiniz.`));

    user.setNickname(isim)
    client.channels.cache.get(settings.LogChannelID).send(`<@!${user.id}>`);
    client.channels.cache.get(settings.LogChannelID).send(beta.setDescription(`✅ | <@!${user.id}> **Yetkili başvurunuz başarıyla onaylandı ve rolleriniz verildi.**`))


    user.roles.add(settings.enAltYetkiliRol)
};

exports.config = {
  name: "onayla",
  guildOnly: false,
  aliases: ["onay"],
};