const Discord = require("discord.js");
const config = require('../Config.json') 
const prefix = config.Prefix;
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');
const { no, igne, yes } = require('../emoji.json');
const client = new Discord.Client();

exports.run = async (client, message, args) => {

        if(!message.guild.me.hasPermission("MANAGE_ROLES")) return message.reply(`${no} Rolleri Yönet Yetkisine Sahip Değilim!`);
        if(!message.member.hasPermission("MANAGE_ROLES") || !message.member.hasPermission("MANAGE_GUILD")) return message.reply(`${no} Bu Komudu Kullanmak İçin Gerekli İzinlere Sahip Değilsin!`);


        if(!args.length) {
            let embed = new Discord.MessageEmbed()
            .setTitle(`Seviye Rol Menüsü`)
            .setDescription(`Kullanıcı belirli bir seviyeye yükseldiğinde rolü ödüllendirir`)
            .addFields({ name: `${prefix}level-rol ekle <level> <@role>`, value: `Belirli bir seviyeye geldiklerinde kullanıcıya verilecek rolü belirler..`})
            .addFields({ name: `${prefix}level-rol sil <level>`, value: `Belirtilen düzeydeki rol kümesini kaldırır.`})
            .addFields({ name: `${prefix}level-rol göster`, value: `Seviyelere ayarlanmış tüm rolleri gösterir.`})
            .setColor("0x36393E");

        return message.channel.send(embed);
        }

        const method = args[0]
        const levelArgs = parseInt(args[1])
        args.shift()
        args.shift()
        const roleName = args.join(' ')

        const role = message.guild.roles.cache.find(r => (r.name === roleName.toString()) || (r.id === roleName.toString().replace(/[^\w\s]/gi, '')));
        client.getRole = sql.prepare("SELECT * FROM roles WHERE guildID = ? AND roleID = ? AND level = ?");
        client.setRole = sql.prepare("INSERT OR REPLACE INTO roles (guildID, roleID, level) VALUES (@guildID, @roleID, @level);");

        if(method === 'ekle' || method === 'add') {
            if(isNaN(levelArgs) && !levelArgs || levelArgs < 1) {
                return message.reply(`${igne} Lütfen ayarlamak için bir seviye sağlayın.`);
            } else {
                if(!role) {
                    return message.reply(`${igne} Belirlemek için bir rol sağlamadınız!`);
                } else {
                let Role = client.getRole.get(message.guild.id, role.id, levelArgs) 
                if(!Role) {
                    Role = {
                    guildID: message.guild.id,
                    roleID: role.id,
                    level: levelArgs
                    }
                    client.setRole.run(Role)
                    let embed = new Discord.MessageEmbed()
                    .setTitle(`Rol ayarlama başarılı!`)
                    .setDescription(`${yes} ${role}, ${levelArgs} seviyesi için ayarlandı`)
                    .setColor("0x36393E");
                     return message.channel.send(embed);
                 } else if(Role){
                    client.deleteLevel = sql.prepare(`DELETE FROM roles WHERE guildID = ? AND roleID = ? AND level = ?`)
                    client.deleteLevel.run(message.guild.id, role.id, levelArgs);
                    client.updateLevel = sql.prepare(`INSERT INTO roles(guildID, roleID, level) VALUES(?,?,?)`)
                    client.updateLevel.run(message.guild.id, role.id, levelArgs)
                     let embed = new Discord.MessageEmbed()
                     .setTitle(`Rol ayarlama başarılı!`)
                     .setDescription(`${yes} ${role}, ${levelArgs} seviyesi için güncellendi`)
                     .setColor("0x36393E");
                      return message.channel.send(embed);
                 }
                }
            }
        }

        if(method === 'göster' || method === 'show') {
            const allRoles = sql.prepare(`SELECT * FROM roles WHERE guildID = ?`).all(message.guild.id)
            if(!allRoles) {
                return message.reply(`${no} Belirlenmiş rol yok!`)
            } else {
                let embed = new Discord.MessageEmbed()
                .setTitle(`${message.guild.name} Roles Level`)
                .setDescription(`${igne} \`${prefix}level-rol\` daha fazla bilgi için`)
                .setColor("0x36393E");
                for(const data of allRoles) {
                    let LevelSet = data.level;
                    let RolesSet = data.roleID;
                 embed.addFields({ name: `\u200b`, value: `**Level ${LevelSet}**: <@&${RolesSet}>` }); 
                }
                return message.channel.send({embed});
            }
        }

        client.getLevel = sql.prepare(`SELECT * FROM roles WHERE guildID = ? AND level = ?`)
        const levels = client.getLevel.get(message.guild.id, levelArgs)

        if(method === 'sil' || method === 'remove') {
            if(isNaN(levelArgs) && !levelArgs || levelArgs < 1) {
                return message.reply(`${igne} Lütfen kaldırılacak bir seviye belirtin.`);
            } else {
                if(!levels) {
                    return message.reply(`${no} Bu geçerli bir seviye değil!`);
                } else {
                    client.deleteLevel = sql.prepare(`DELETE FROM roles WHERE guildID = ? AND level = ?`)
                    client.deleteLevel.run(message.guild.id, levelArgs);
                    let embed = new Discord.MessageEmbed()
                    .setTitle(`Rol başarıyla belirlendi!`)
                    .setDescription(`${yes} ${levelArgs} seviyesi için rol ödülleri kaldırıldı.`)
                    .setColor("0x36393E");
                     return message.channel.send(embed);
                }
            }
        }

    }
exports.config = {
  name: "levelrol",
  guildOnly: false,
  aliases: ["level-rol"],
};