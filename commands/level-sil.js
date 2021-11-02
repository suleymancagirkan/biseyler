const Discord = require("discord.js");
const SQlite = require("better-sqlite3");
const { no, igne, yes } = require('../emoji.json');
const sql = new SQlite('./mainDB.sqlite');
const client = new Discord.Client();

exports.run = async (client, message, args) => {

        let userArray = message.content.split(" ");
        let userArgs = userArray.slice(1);
        let user = message.mentions.members.first() || message.guild.members.cache.get(userArgs[0]) || message.guild.members.cache.find(x => x.user.username.toLowerCase() === userArgs.slice(0).join(" ") || x.user.username === userArgs[0])

        if(!message.member.hasPermission("MANAGE_GUILD")) return message.reply(`${no} Bu komutu kullanma izniniz yok!`);

        const levelArgs = parseInt(args[1])

        client.getScore = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
        client.setScore = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (@id, @user, @guild, @xp, @level, @totalXP);");
        if(!user) {
            return message.reply(`${igne} Lütfen bir kullanıcıdan bahsedin!`)
        } else {
            if(isNaN(levelArgs) || levelArgs < 1) {
                return message.reply(`${igne} Lütfen geçerli bir numara girin!`)
            } else {
                let score = client.getScore.get(user.id, message.guild.id);
                if(!score) {
                    score = {
                        id: `${message.guild.id}-${user.id}`,
                        user: user.id,
                        guild: message.guild.id,
                        xp: 0,
                        level: 0,
                        totalXP: 0
                    }
                }
                if(score.level - levelArgs < 1) {
                    return message.reply(`${no} Bu kullanıcıdan seviyeleri kaldıramazsınız!`)
                }    
 		score.level -= levelArgs
                const newTotalXP = levelArgs - 1
                let embed = new Discord.MessageEmbed()
                .setTitle(`Başarılı!`)
                .setDescription(`${yes} ${levelArgs} düzeyini ${user.toString()} kişisinden başarıyla kaldırdım!`)
                .setColor("0x36393E");
                score.totalXP -= newTotalXP * 2 * 250 + 250
                client.setScore.run(score)
                return message.channel.send(embed)
            }
        }
    }
exports.config = {
  name: "levelsil",
  guildOnly: false,
  aliases: ["level-sil"],
};