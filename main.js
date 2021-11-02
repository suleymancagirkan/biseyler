const Discord = require("discord.js")    
const client = new Discord.Client();      
const ayar = require("./config.js") 
const a = require("./config.js") 
const fs = require("fs");
const db = require("quick.db");                
require('./util/Loader.js')(client);    


const ms = require('ms');
require("http").createServer((_, res) => res.end("Alive!")).listen(8080)

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();  
fs.readdir('./commands/', (err, files) => { 
  if (err) console.error(err);               
  console.log(`${files.length} komut yüklenecek.`); 
  files.forEach(f => {                    
    let props = require(`./commands/${f}`);
    console.log(`${props.config.name} komutu yüklendi.`); 
    client.commands.set(props.config.name, props);
    props.config.aliases.forEach(alias => {       
      client.aliases.set(alias, props.config.name);
    });
  });
})

client.login(process.env.token);

client.on("guildMemberAdd", member => {
if (db.fetch(`jailli.${member.id}`)) {
member.guild.channels.cache.get(ayar.jailLog).send(new Discord.MessageEmbed().setFooter("Süleyman ❤ Atomicode").setColor("010000").setTimestamp().setDescription(`
${client.emojis.cache.get(ayar.no)} ${member} ( \`${member.id}\` ) isimli kullanıcı jailli iken çıkıp girdiği için tekrar jaillendi!
`))
member.roles.set([a.jailRolu]);
}
})

client.on("guildMemberAdd", member => {
  if (db.fetch(`muteli.${member.id}`)) {
  member.guild.channels.cache.get(ayar.muteLog).send(new Discord.MessageEmbed().setFooter("Süleyman ❤ Atomicode").setColor("010000").setTimestamp().setDescription(`
  ${client.emojis.cache.get(ayar.no)} ${member} ( \`${member.id}\` ) isimli kullanıcı muteli iken çıkıp girdiği için tekrar mutelendi!
  `))
  member.roles.add(a.muteRolu);
  }
  })



////////////////////////


const config = require("./Config.json");

  function guvenli(kisiID) {
    let uye = client.guilds.cache.get(config.guildID).members.cache.get(kisiID);
    let clientsafe = config.whitelist || [];
    if (!uye || uye.id === client.user.id || uye.id === config.OwnerID || uye.id === uye.guild.owner.id || clientsafe.some(client => uye.id === client || uye.roles.cache.has(client))) return true
  else return false};

  const yetkiPermleri = ["ADMINISTRATOR", "MANAGE_ROLES", "MANAGE_CHANNELS", "MANAGE_GUILD", "BAN_MEMBERS", "KICK_MEMBERS", "MANAGE_NICKNAMES", "MANAGE_EMOJIS", "MANAGE_WEBHOOKS"];
  function cezalandir(kisiID, tur) {
    let userID = client.guilds.cache.get(config.guildID).members.cache.get(kisiID);
    if (!userID) return;
    if (tur == "jail") return userID.roles.cache.has(config.boosterRole) ? userID.roles.set([config.boosterRole, config.jailRole]) : userID.roles.set([config.jailRole]);
    if (tur == "ban") return userID.ban({ reason: "CodeLand Koruma Sistemi" }).catch()};

//-                                                                        ROL KORUMA                                                                        -\\

client.on("roleCreate", async role => {
  let entry = await role.guild.fetchAuditLogs({type: 'ROLE_CREATE'}).then(audit => audit.entries.first());
  if (!entry || !entry.executor || Date.now()-entry.createdTimestamp > 5000 || guvenli(entry.executor.id) || !config.roleProtection) return;
  role.delete({ reason: "CodeLand Koruma Sistemi" });
  cezalandir(entry.executor.id, "jail");
  let user = client.users.cache.get(entry.executor.id)
  let logKanali = client.channels.cache.get(config.logChannelID);
  if (logKanali) { logKanali.send(new Discord.MessageEmbed().setThumbnail(user.displayAvatarURL({dynamic:true})).setColor("BLUE").setTitle('Sunucuda izinsiz bir rol oluşturuldu!').setDescription(`${entry.executor} adlı yetkili tarafından sunucuda izinsiz bir rol oluşturuldu! \n\nSunucuda rolü oluşturan yetkilinin rolleri alındı ve cezalı rolü verildi!`).setFooter(`CodeLand Koruma Sistemi`).setTimestamp())}});

client.on("roleDelete", async role => {
  let entry = await role.guild.fetchAuditLogs({type: 'ROLE_DELETE'}).then(audit => audit.entries.first());
  if (!entry || !entry.executor || Date.now()-entry.createdTimestamp > 5000 || guvenli(entry.executor.id) || !config.roleProtection) return;
  cezalandir(entry.executor.id, "jail");
  let user = client.users.cache.get(entry.executor.id)
  let yeniRol = await role.guild.roles.create({
  data: {
    name: role.name,
    color: role.hexColor,
    hoist: role.hoist,
    position: role.position,
    permissions: role.permissions,
    mentionable: role.mentionable},
    reason: "Rol Silindiği İçin Tekrar Oluşturuldu!"});
  let logKanali = client.channels.cache.get(config.logChannelID);
  if (logKanali) { logKanali.send(new Discord.MessageEmbed().setThumbnail(user.displayAvatarURL({dynamic:true})).setColor("BLUE").setTitle('Sunucuda bir rol izinsiz silindi!').setDescription(`${entry.executor} adlı yetkili tarafından **${role.name}** isimli rol silindi, silen kişi banlandı! \nRol tekrar oluşturuldu.`).setFooter(`CodeLand Koruma Sistemi`).setTimestamp())}});

client.on("roleUpdate", async (oldRole, newRole) => {
  let entry = await newRole.guild.fetchAuditLogs({type: 'ROLE_UPDATE'}).then(audit => audit.entries.first());
  if (!entry || !entry.executor || !newRole.guild.roles.cache.has(newRole.id) || Date.now()-entry.createdTimestamp > 5000 || guvenli(entry.executor.id) || !config.roleProtection) return;
  cezalandir(entry.executor.id, "jail");
  let user = client.users.cache.get(entry.executor.id)
  if (yetkiPermleri.some(p => !oldRole.permissions.has(p) && newRole.permissions.has(p))) {
  newRole.setPermissions(oldRole.permissions);
  newRole.guild.roles.cache.filter(r => !r.managed && (r.permissions.has("ADMINISTRATOR") || r.permissions.has("MANAGE_ROLES") || r.permissions.has("MANAGE_GUILD"))).forEach(r => r.setPermissions(36818497));
};
  newRole.edit({
    name: oldRole.name,
    color: oldRole.hexColor,
    hoist: oldRole.hoist,
    permissions: oldRole.permissions,
    mentionable: oldRole.mentionable});
 let logKanali = client.channels.cache.get(config.logChannelID);
 if (logKanali) { logKanali.send(new Discord.MessageEmbed().setThumbnail(user.displayAvatarURL({dynamic:true})).setColor("BLUE").setTitle('Sunucuda izinsiz bir rol güncellendi!').setDescription(`${entry.executor} adlı yetkili tarafından **${oldRole.name}** isimli rol izinsiz güncellendi! \n\nGüncelleyen yetkilinin rolleri alındı ve cezalı rol verildi! \n\nRol eski haline getirildi!`).setFooter(`CodeLand Koruma Sistemi`).setTimestamp())}});

//-                                                                        KANAL KORUMA                                                                        -\\

client.on("channelCreate", async channel => {
  let entry = await channel.guild.fetchAuditLogs({type: 'CHANNEL_CREATE'}).then(audit => audit.entries.first());
  if (!entry || !entry.executor || Date.now()-entry.createdTimestamp > 5000 || guvenli(entry.executor.id) || !config.channelProtection) return;
  channel.delete({reason: "CodeLand Koruma Sistemi"});
  let user = client.users.cache.get(entry.executor.id)
  cezalandir(entry.executor.id, "jail");
  let logKanali = client.channels.cache.get(config.logChannelID);
  if (logKanali) { logKanali.send(new Discord.MessageEmbed().setThumbnail(user.displayAvatarURL({dynamic:true})).setColor("BLUE").setTitle('Sunucuda bir kanal izinsiz oluşturuldu!').setDescription(`${entry.executor} adlı yetkili tarafından sunucuda izinsiz kanal oluşturuldu! Oluşturan yetkilinin rolleri alındı ve jaile atıldı! \nOluşturulan Kanal Silindi.`).setFooter(`CodeLand Koruma Sistemi`).setTimestamp().setThumbnail(user.displayAvatarURL({dynamic: true })))}});

client.on("channelDelete", async channel => {
  let entry = await channel.guild.fetchAuditLogs({type: 'CHANNEL_DELETE'}).then(audit => audit.entries.first());
  if (!entry || !entry.executor || Date.now()-entry.createdTimestamp > 5000 || guvenli(entry.executor.id) || !config.channelProtection) return;
  cezalandir(entry.executor.id, "jail");
  let user = client.users.cache.get(entry.executor.id)
  await channel.clone({ reason: "CodeLand Koruma Sistemi" }).then(async kanal => {
  if (channel.parentID != null) await kanal.setParent(channel.parentID);
  await kanal.setPosition(channel.position);
  if (channel.type == "category") await channel.guild.channels.cache.filter(k => k.parentID == channel.id).forEach(x => x.setParent(kanal.id));});
  let logKanali = client.channels.cache.get(config.logChannelID);
  if (logKanali) { logKanali.send(new Discord.MessageEmbed().setThumbnail(user.displayAvatarURL({dynamic:true})).setColor("BLUE").setTitle('İzinsiz bir kanal silindi!').setDescription(`${entry.executor} adlı yetkili tarafından **${channel.name}** isimli kanal silindi! Silen yetkilinin rolleri alındı ve jaile atıldı! \nSilinen kanal tekrar oluşturuldu.`).setFooter(`CodeLand Koruma Sistemi`).setTimestamp())}});

client.on("channelUpdate", async (oldChannel, newChannel) => {
  let entry = await client.guilds.cache.get(newChannel.guild.id).fetchAuditLogs({ type: 'CHANNEL_UPDATE' }).then(audit => audit.entries.first())
  if (Date.now()-entry.createdTimestamp > 5000) {
  entry = await client.guilds.cache.get(newChannel.guild.id).fetchAuditLogs({ type: 'CHANNEL_OVERWRITE_UPDATE' }).then(audit => audit.entries.first())}
  if (!entry || !entry.executor || Date.now()-entry.createdTimestamp > 5000 || guvenli(entry.executor.id) || !config.channelProtection) return;
  let user = client.users.cache.get(entry.executor.id)
  cezalandir(entry.executor.id, "jail"); 
  if (newChannel.type !== "category" && newChannel.parentID !== oldChannel.parentID) newChannel.setParent(oldChannel.parentID);
  if (newChannel.type === "category") {newChannel.edit({name: oldChannel.name})} else if (newChannel.type === "text") {newChannel.edit({name: oldChannel.name, topic: oldChannel.topic, nsfw: oldChannel.nsfw, rateLimitPerUser: oldChannel.rateLimitPerUser})} else if (newChannel.type === "voice") {newChannel.edit({name: oldChannel.name, bitrate: oldChannel.bitrate, userLimit: oldChannel.userLimit,})}; oldChannel.permissionOverwrites.forEach(perm => {let thisPermOverwrites = {}; perm.allow.toArray().forEach(p => {thisPermOverwrites[p] = true;}); perm.deny.toArray().forEach(p => {thisPermOverwrites[p] = false;}); newChannel.createOverwrite(perm.id, thisPermOverwrites)});
  let logKanali = client.channels.cache.get(config.logChannelID);
  if (logKanali) { logKanali.send(new Discord.MessageEmbed().setThumbnail(user.displayAvatarURL({dynamic:true})).setColor("BLUE").setTitle('İzinsiz bir kanal güncellendi!').setDescription(`${entry.executor} adlı yetkili tarafından **${newChannel.name}** isimli kanal güncellendi! Güncellenyen yetkilinin rolleri alındı ve jaile atıldı! \nKanal eski haline getirildi.`).setFooter(`CodeLand Koruma Sistemi`).setTimestamp())}});

//-                                                                        SUNUCU KORUMA                                                                        -\\

client.on("guildUpdate", async (oldGuild, newGuild) => {
  let entry = await newGuild.fetchAuditLogs({type: 'GUILD_UPDATE'}).then(audit => audit.entries.first());
  if (!entry || !entry.executor || Date.now()-entry.createdTimestamp > 5000 || guvenli(entry.executor.id) || !config.serverProtection) return;
  cezalandir(entry.executor.id, "jail");
  let user = client.users.cache.get(entry.executor.id)
  if (newGuild.name !== oldGuild.name) newGuild.setName(oldGuild.name);
  if (newGuild.iconURL({dynamic: true, size: 2048}) !== oldGuild.iconURL({dynamic: true, size: 2048})) newGuild.setIcon(oldGuild.iconURL({dynamic: true, size: 2048}));
  let logKanali = client.channels.cache.get(config.logChannelID);
  if (logKanali) { logKanali.send(new Discord.MessageEmbed().setThumbnail(user.displayAvatarURL({dynamic:true})).setColor("BLUE").setTitle('Sunucu izinsiz güncellendi!').setDescription(`${entry.executor} adlı yetkili tarafından Sunucu izinsiz güncellendi! \nGüncelleyen yetkili sunucudan yasaklandı ve sunucu eski haline getirildi.`).setFooter(`CodeLand Koruma Sistemi`).setTimestamp())}});

client.on("guildMemberRemove", async member => {
  let entry = await member.guild.fetchAuditLogs({type: 'MEMBER_KICK'}).then(audit => audit.entries.first());
  if (!entry || !entry.executor || Date.now()-entry.createdTimestamp > 5000 || guvenli(entry.executor.id) || !config.kickProtection) return;
  cezalandir(entry.executor.id, "jail");
  let user = client.users.cache.get(entry.executor.id)
  let logKanali = client.channels.cache.get(config.logChannelID);
  if (logKanali) { logKanali.send(new Discord.MessageEmbed().setThumbnail(user.displayAvatarURL({dynamic: true })).setColor("BLUE").setTitle('Bir kullanıcı izinsiz sunucudan atıldı!').setDescription(`${member} adlı üye, ${entry.executor} adlı yetkili tarafından sunucudan izinsiz atıldı! \n\nKullanıcıyı sunucudan atan yetkilinin yetkileri alındı ve cezalı rolü verildi!.`).setFooter(`CodeLand Koruma Sistemi`).setTimestamp())}});

client.on("guildBanAdd", async (guild, user) => {
  let entry = await guild.fetchAuditLogs({type: 'MEMBER_BAN_ADD'}).then(audit => audit.entries.first());
  if (!entry || !entry.executor || guvenli(entry.executor.id) || !config.banProtection) return;
  cezalandir(entry.executor.id, "jail");
  guild.members.unban(user.id, "İzinsiz banlandığı için ban geri açıldı!").catch(console.error);
  let logKanali = client.channels.cache.get(config.logChannelID);
  if (logKanali) { logKanali.send(new Discord.MessageEmbed().setThumbnail(user.displayAvatarURL({dynamic:true})).setColor("BLUE").setTitle('Bir kullanıcı izinsiz sunucudan yasaklandı!').setDescription(`${user} adlı üye, ${entry.executor} adlı yetkili tarafından sunucudan izinsiz yasaklandı! \n\n Kullanıcıyı sunucudan yasaklayan yetkilinin rolleri alındı ve cezalı rolü verildi!.`).setFooter(`CodeLand Koruma Sistemi`).setTimestamp())}});

client.on("guildMemberAdd", async member => {
  let entry = await member.guild.fetchAuditLogs({type: 'BOT_ADD'}).then(audit => audit.entries.first());
  if (!member.user.bot || !entry || !entry.executor || Date.now()-entry.createdTimestamp > 5000 || guvenli(entry.executor.id) || !config.botProtection) return;
  cezalandir(entry.executor.id, "jail");
  cezalandir(member.id, "ban");
  let user = client.users.cache.get(entry.executor.id)
  let logKanali = client.channels.cache.get(config.logChannelID);
  if (logKanali) { logKanali.send(new Discord.MessageEmbed().setThumbnail(user.displayAvatarURL({dynamic:true})).setColor("BLUE").setTitle('Sunucuya izinsiz bir bot eklendi!').setDescription(`${member} adlı botu, ${entry.executor} adlı yetkili tarafından sunucuya izinsiz eklendi! \n\nEkleyen yetkili ve bot sunucudan yasaklandı.`).setFooter(`CodeLand Koruma Sistemi`).setTimestamp())}});

client.on("guildMemberUpdate", async (oldMember, newMember) => {
  if (newMember.roles.cache.size > oldMember.roles.cache.size) {
  let entry = await newMember.guild.fetchAuditLogs({type: 'MEMBER_ROLE_UPDATE'}).then(audit => audit.entries.first());
  if (!entry || !entry.executor || Date.now()-entry.createdTimestamp > 5000 || guvenli(entry.executor.id) || !config.rightClickProtection) return;
  if (yetkiPermleri.some(p => !oldMember.hasPermission(p) && newMember.hasPermission(p))) {
  cezalandir(entry.executor.id, "jail");
  let user = client.users.cache.get(entry.executor.id)
  let logKanali = client.channels.cache.get(config.logChannelID);
  if (logKanali) { logKanali.send(new Discord.MessageEmbed().setThumbnail(user.displayAvatarURL({dynamic:true})).setColor("BLUE").setTitle('Sunucuda izinsiz yetki yükseltildi').setDescription(`${newMember} adlı üyeye ${entry.executor} isimli yetkili tarafından sunucuda izinsiz yetki verildi! \nYetki veren yetkili sunucudan yasaklandı ve verilen yetki geri alındı!`).setFooter(`CodeLand Koruma Sistemi`).setTimestamp())}}}});

///LEVEL


const { rocket } = require('./emoji.json');


const talkedRecently = new Map();
const SQLite = require("better-sqlite3")
const sql = new SQLite('./mainDB.sqlite')  

const { join } = require("path")
const { readdirSync } = require("fs");

const levelTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'levels';").get();
  if (!levelTable['count(*)']) {
    sql.prepare("CREATE TABLE levels (id TEXT PRIMARY KEY, user TEXT, guild TEXT, xp INTEGER, level INTEGER, totalXP INTEGER);").run();
  }

  client.getLevel = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
  client.setLevel = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (@id, @user, @guild, @xp, @level, @totalXP);");
// Role table for levels
  const roleTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'roles';").get();
  if (!roleTable['count(*)']) {
    sql.prepare("CREATE TABLE roles (guildID TEXT, roleID TEXT, level INTEGER);").run();
  }
// XP Messages 
client.on("message", message => {
  if (message.author.bot) return;
  if (!message.guild) return;
        // get level and set level
        const level = client.getLevel.get(message.author.id, message.guild.id) 
        if(!level) {
          let insertLevel = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (?,?,?,?,?,?);");
          insertLevel.run(`${message.author.id}-${message.guild.id}`, message.author.id, message.guild.id, 0, 0, 0)
          return;
        }
      
        const lvl = level.level;

      // xp system
        const generatedXp = Math.floor(Math.random() * 16);
        const nextXP = level.level * 2 * 250 + 250
        // message content or characters length has to be more than 4 characters also cooldown
      if(talkedRecently.get(message.author.id)) {
        return;
      } else { // cooldown is 10 seconds
            level.xp += generatedXp;
            level.totalXP += generatedXp;
            

      // level up!

        
        
        if(level.xp >= nextXP) {
                level.xp = 0;
                level.level += 1;
          
                     let levellogs = db.get(`levellog_${message.guild.id}`)
    const levellogkanal = message.guild.channels.cache.find(kanal => kanal.id === levellogs);    
if (!levellogkanal) return; 
          
        let embed = new Discord.MessageEmbed()
              .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
              .setDescription(`${rocket} **Tebrikler** ${message.author}! Artık "\`${level.level}\`" Levelsiniz`)
              .setColor("0x36393E")
              .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
              .setTimestamp();
        // using try catch if bot have perms to send EMBED_LINKS      
        try {
        levellogkanal.send(embed);
        } catch (err) {
          levellogkanal.send(`${rocket} **Tebrikler** ${message.author}! Artık "\`${level.level}\`" Levelsiniz`)
        }
      };
      client.setLevel.run(level);
          // level up, time to add level roles
            const member = message.member;
            let Roles = sql.prepare("SELECT * FROM roles WHERE guildID = ? AND level = ?")
            
            let roles = Roles.get(message.guild.id, lvl)
            if(!roles) return;
            if(lvl >= roles.level) {
            if(roles) {
            if (member.roles.cache.get(roles.roleID)) {
              return;
            }
               if(!message.guild.me.hasPermission("MANAGE_ROLES")) {
                 return
               }
             member.roles.add(roles.roleID);
            }}
      }})