const { MessageEmbed } = require('discord.js');
const Discord = require('discord.js');
const Beautify = require('beautify');
const config = require('../Config.json');

exports.run = async (client, message, args) => {
  if (message.author.bot) return;
    let prefix = config.Prefix;
    if(!message.content.startsWith(prefix)) return;
  
  if (message.author.id !== "852596827713962066" && message.author.id !== "745286954752671744") {
    return message.channel.send("Bu Komut Yalnızca Sahibine Özeldir!")
  }
  
  if (!args[0]) {
    message.channel.send("_**BİR ŞEY**_ Lütfen değerlendirmeniz gerekiyor!")
  }
  
  try {
    if (args.join(" ").toLowerCase().includes("token")) {
      return;
    }
    
    const toEval = args.join(" ");
    const evaluated = eval(toEval);
    
    let embed = new Discord.MessageEmbed()
    .setTitle("Eval")
    .addField("ToEvaluate", `\`\`\`js\n${Beautify(args.join(" "), { format: "js" })}\n\`\`\``)
    .addField("Evaluated", evaluated)
    .addField("Type of:", typeof(evaluated))
    .setTimestamp()
    .setFooter(`${message.author.tag}`, client.user.displayAvatarURL())
    message.channel.send(embed);
    
  } catch (e) {
    let errorembed = new Discord.MessageEmbed()
    .addField("Error!")
    .setDescription(e)
    .setTimestamp()
    .setFooter(`${message.author.tag}`, client.user.displayAvatarURL())
    message.channel.send(errorembed);
  }
}
exports.config = {
  name: "eval",
  guildOnly: true,
  aliases: [],
};
