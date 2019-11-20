const Discord = require("discord.js");
const fs = require("fs");
const bot = new Discord.Client();
const {
    bot_token,
    prefix
} = require("./config.json");
var blacklist = require("./blacklist_database.json");
bot.on('ready', async () => {
    console.log('im ready');
})

bot.on("message", async message => {
    var args = message.content.slice(prefix.length).trim().split(/ +/g);
    if (!message.content.startsWith(prefix)) return;
    var mn = message.content.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    var cmd = args[0].toString();
    var cmd = cmd.toLocaleLowerCase();
    var sender = {
        user: message.author,
        member: message.member
    }
    if (!blacklist[message.guild.id]) {
        blacklist[message.guild.id] = {
            blacklists: []
        }
        fs.writeFile('./blacklist_database.json', JSON.stringify(blacklist, null, 2), (err) => {
            if (err) console.log(err)
        })
    }
    save = function() {
        fs.writeFile('./blacklist_database.json', JSON.stringify(blacklist, null, 2), (err) => {
            if (err) console.log(err)
        })
    }

    try {
        if (cmd === "blacklist") {
            if (!message.member.hasPermission("ADMINISTRATOR")) {
                return message.channel.send({
                    "embed": {
                        "color": 13632027,
                        "author": {
                            "name": message.author.tag + " - คุณไม่สามารถใช้คำสั่งนี้ได้",
                            "icon_url": "https://cdn.discordapp.com/emojis/472690244421025792.png?v=1"
                        }
                    }
                })
            }
            if (!mn[1]) return;
            if (mn[1] == "add") {
                message.channel.send({
                    "embed": {
                        "color": 13632027,
                        "author": {
                            "name": message.author.tag + " - เพิ่ม " + mn[2] + " เข้า blacklist แล้ว!",
                            "icon_url": "https://cdn.discordapp.com/emojis/645018207329189922.gif?v=1"
                        }
                    }
                })
                blacklist[message.guild.id].blacklists.push(mn[2]);
                save();
                if (message.guild.member(mn[2])) {
                    message.channel.send({
                        "embed": {
                            "color": 13632027,
                            "author": {
                                "name": message.guild.member(mn[2]).user.tag + " - ถูกแบนเรียบร้อยแล้ว -> Reason:Blacklist",
                                "icon_url": "https://cdn.discordapp.com/emojis/645018207329189922.gif?v=1"
                            }
                        }
                    }).then(() => {
                        setTimeout(function() {
                            message.guild.member(mn[2]).ban({
                                reason: "Blacklist"
                            })
                        }, 1500)
                    })
                }
                else {
                    return;
                }
            }
            if (mn[1] == "remove") {
                message.channel.send({
                    "embed": {
                        "color": 13632027,
                        "author": {
                            "name": message.author.tag + " - ลบ " + mn[2] + " ออกจาก blacklist แล้ว!",
                            "icon_url": "https://cdn.discordapp.com/emojis/645018207329189922.gif?v=1"
                        }
                    }
                })
                blacklist[message.guild.id].blacklists = blacklist[message.guild.id].blacklists.filter(x => !x.includes(mn[2]));
                save();
            }
            if (mn[1] == "clear") {
                message.channel.send({
                    "embed": {
                        "color": 13632027,
                        "author": {
                            "name": message.author.tag + " - Clear Blacklist แล้ว!",
                            "icon_url": "https://cdn.discordapp.com/emojis/645018207329189922.gif?v=1"
                        }
                    }
                })
                blacklist[message.guild.id].blacklists = [];
                save();
            }
            if (mn[1] == "list") {
                x = [];
                for (i in blacklist[message.guild.id].blacklists) {
                    x.push("#" + i + " -> " + blacklist[message.guild.id].blacklists[i]);
                }
                if (blacklist[message.guild.id].blacklists.length > 0) {
                    message.channel.send({
                        "embed": {
                            "color": 13632027,
                            "author": {
                                "name": "กำลังค้นหาข้อมูล",
                                "icon_url": "https://images-ext-2.discordapp.net/external/nBIWy79cvlkO2cyPpZ4WhIN3Wt0WLSmbkLiCguWICnM/https/discordemoji.com/assets/emoji/8104LoadingEmote.gif"
                            }
                        }
                    }).then((msg) => {
                        setTimeout(function() {
                            msg.edit({
                                "embed": {
                                    "description": "```" + x.join('\n') + "```",
                                    "color": 13632027,
                                    "timestamp": new Date(),
                                    "footer": {
                                        "text": message.author.tag
                                    },
                                    "thumbnail": {
                                        "url": message.author.avatarURL()
                                    },
                                    "author": {
                                        "name": "List of blacklist",
                                        "icon_url": "https://cdn.discordapp.com/emojis/393548363879940108.gif?v=1"
                                    }
                                }
                            })
                        }, 2000)
                    })
                }
                else {
                    message.channel.send({
                        "embed": {
                            "color": 13632027,
                            "author": {
                                "name": message.author.tag + " - ไม่พบข้อมูล Blacklist",
                                "icon_url": "https://cdn.discordapp.com/emojis/624375952696410112.gif?v=1"
                            }
                        }
                    })
                    return;
                }
            }
        }
    }
    catch (err) {
        return console.log(err);
    }
    finally {

    }
});

bot.on("guildMemberAdd", async member => {

    if (blacklist[member.guild.id].blacklists.includes(member.user.id)) {
        member.guild.member(member.user.id).ban({
            reason: "Blacklist"
        })
    }
    else {
        return;
    }

});

bot.login(bot_token)