const Discord = require("discord.js");
const SQLite = require("better-sqlite3");
const { no, igne, yes } = require('../emoji.json');
const sql = new SQLite('./mainDB.sqlite')
const client = new Discord.Client();


  exports.run = async (client, message, args) => {
      
    const currentPage = parseInt(args[0]) || 1;
    const top10 = sql.prepare("SELECT * FROM levels WHERE guild = ? ORDER BY totalXP DESC;").all(message.guild.id);
    if(parseFloat(args[0])  > Math.ceil(top10.length / 10)) {
      return message.reply(`${no} Geçersiz sayfa numarası! Yalnızca ${Math.ceil(top10.length / 10)} sayfa var`)
    }
        const embed = new Discord.MessageEmbed()
        .setTitle(`${message.guild.name} Sıralaması`)
        .setColor("0x36393E")
        .setTimestamp()
        .setDescription(`Sıralamadaki En İyi 10 Kişi`);


      if(top10.length < 1) {
          embed.setDescription(`${no} Skor tablosunda kullanıcı yok!`)
        }
      var state = {
        'querySet': top10,
        'page': currentPage,
        'rows': 10
      }

      buildTable()

      function pagination(querySet, page, rows) {
        var trimStart = (page - 1) * rows
        var trimEnd = trimStart + rows

        var trimmedData = querySet.slice(trimStart, trimEnd)
      
        var pages = Math.ceil(querySet.length / rows)

        return{
          'querySet':trimmedData,
          'pages':pages
        }
      }
      
      function buildTable() {
        var pagesData = pagination(state.querySet, state.page, state.rows)
        var myList = pagesData.querySet
      for(var i = 1 in myList) {
           let nextXP = myList[i].level * 2 * 250 + 250
           let totalXP = myList[i].totalXP
          let rank = top10.sort((a, b) => {
            return b.totalXP - a.totalXP
          });
          let ranking = rank.map(x => x.totalXP).indexOf(totalXP) + 1
        let users;
        if(typeof message.client.users.cache.get(myList[i].user) == "undefined") {
        users = `<@!${myList[i].user}>`
        } else {
        users = message.client.users.cache.get(myList[i].user).tag
        }
        embed.addFields({ name: `#${ranking}. ${users}`, value: `> **Level**: \`${myList[i].level}\`\n> **XP**: \`${myList[i].xp} / ${nextXP}\`` });
      }
      embed.setFooter(`Sayfa ${currentPage} / ${Math.ceil(top10.length / 10)}`)
    }
      return message.channel.send({embed});

    }
exports.config = {
  name: "sıralama",
  guildOnly: false,
  aliases: ["levelsıralama","level-sıralama"],
};