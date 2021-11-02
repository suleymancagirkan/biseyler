const { MessageEmbed } = require('discord.js');
const settings = require("../config.js");
const db = require("quick.db");

exports.run = async (client, message, args) => {

    if (!message.member.roles.cache.has(settings.yoneticiROL) && !message.member.roles.cache.has(settings.leadROL) && !message.member.hasPermission("ADMINISTRATOR")) return;

    let beta = new MessageEmbed().setColor('#f1f1f1').setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }));

    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
    let user = message.guild.member(member)
    if(!user) return message.channel.send(beta.setDescription(`<@!${message.author.id}> bir kullanıcı belirtiniz.`));
    let betasebep = args.splice(1).join(" ");
    if(!betasebep) return message.channel.send(beta.setDescription(`<@!${message.author.id}> bir kullanıcı sebep belirtiniz.`));

    client.channels.cache.get(settings.LogChannelID).send(`<@!${user.id}>`);
    client.channels.cache.get(settings.LogChannelID).send(beta.setDescription(`❌ | <@!${user.id}> **Yetkili başvurunuz \`${betasebep}\` nedeniyle ${message.author} tarafından reddedildi.**`))

};

exports.config = {
  name: "reddet",
  guildOnly: false,
  aliases: ["reddet"],
};