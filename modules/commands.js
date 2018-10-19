﻿const fs = require('fs-extra');
const rp = require('request-promise');

module.exports = (Discord, client, config) => {

    var e621 = tags => {
        var options = {
            'uri': 'https://e621.net/post/index.json',
            'method': 'POST',
            'json': true,
            'headers': {
                "User-Agent": "node-e621/1.0 "
            },
            'body': {
                tags,
                'limit': 200,
            },
        };
        return rp(options).then(e621data => e621data[Math.floor(Math.random() * e621data.length)]);
    };

    client.commandMap.set('e621', {
        func(message) {
            var e621Request;
            e621(message.content.replace(config.prefix + "e621 ", "")).then(data => {
                e621Request = data;
                const embed = new Discord.MessageEmbed()
                    .setColor(config.embedColor)
                    .setTitle('Result:')
                    .setDescription(`\`${e621Request.tags}\``)
                    .setImage(e621Request.file_url)
                    .setURL(`https://e621.net/post/show/${e621Request.id}`)
                    .setFooter(e621Request.author);
                message.channel.send(embed);
            });
        },
        check(message) {
            if (message.channel.type === 'text' && !message.channel.nsfw) {
                var embed = new Discord.MessageEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('This can only be run in NSFW channels ore direct messages!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false;
            } else {
                return true;
            }
        },
    });

    client.commandMap.set('ping', {
        func(message) {
            const pong = client.ping;
            const embed = new Discord.MessageEmbed()
                .setColor(config.embedColor)
                .setDescription(`Pong! ${pong}ms`)
                .setFooter('Average of last 3 pings');
            message.channel.send(embed);
        },
        check() {
            return true;
        },
    });

    client.commandMap.set('eval', {
        func(message) {
            try {
                var evalStr = eval(message.content.replace(config.prefix + "eval ", ""));
                var embed = new Discord.MessageEmbed()
                    .setTitle("Result:")
                    .setDescription(evalStr)
                    .setColor(config.embedColor);
                message.channel.send(embed);
            } catch (err) {
                var embed = new Discord.MessageEmbed()
                    .setTitle("Error:")
                    .setDescription(err.stack)
                    .setColor(config.errorColor);
                message.channel.send(embed);
            }
        },
        check(message) {
            if (message.author.id !== client.owner.id) {
                var embed = new Discord.MessageEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('That command is restricted to the bot owner!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false;
            } else {
                return true;
            }
        }
    });

    client.commandMap.set('stop', {
        func() {
            var embed = new Discord.MessageEmbed()
                .setTitle("Stopping bot!")
                .setColor(config.errorColor);
            client.owner.send(embed);
            process.exit();
        },
        check(message) {
            if (message.author.id !== client.owner.id) {
                var embed = new Discord.MessageEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('That command is restricted to the bot owner!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false;
            } else {
                return true;
            }
        }
    });

    client.commandMap.set('prefix', {
        func(message) {
            config.prefix = message.content.replace(config.prefix + "prefix ", "");
            fs.writeJsonSync('./config.json', config);
            var embed = new Discord.MessageEmbed()
                .setTitle(`\u2705 Prefix changed to ${config.prefix}`)
                .setColor(config.embedColor);
            message.channel.send(embed);
        },
        check(message) {
            if (message.author.id !== client.owner.id) {
                var embed = new Discord.MessageEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('That command is restricted to the bot owner!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false;
            } else {
                return true;
            }
        }
    });

    client.commandMap.set('prune', {
        func(message) {
            var deleteAmmount = parseInt(message.content.replace(config.prefix + "prune ", "")) || 100;
            if (deleteAmmount > 100 || deleteAmmount < 2) {
                var embed = new Discord.MessageEmbed()
                    .setDescription('Number must be between 2 and 100')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return;
            }
            message.channel.bulkDelete(deleteAmmount).then(messages => {
                deleteAmmount = messages.array().length;
                var embed = new Discord.MessageEmbed()
                    .setTitle(`\u2705 Deleted ${deleteAmmount} messages!`)
                    .setColor(config.embedColor);
                message.channel.send(embed).then(response => {
                    response.delete(3000);
                });
            });
        },
        check(message) {
            if (message.channel.type !== "text") {
                var embed = new Discord.MessageEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('This can only run in a server!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false;
            } else if (!message.channel.permissionsFor(message.member).has('MANAGE_MESSAGES')) {
                var embed = new Discord.MessageEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('You must be able to delete messages here!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false;
            } else if (!message.channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES')) {
                var embed = new Discord.MessageEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('I don\'t have permission to do that here!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false;
            } else {
                return true;
            }
        }
    });

    client.commandMap.set('ban', {
        func(message) {
            var banUser = message.mentions.users.first();
            client.banned.push(banUser.id);
            fs.writeJsonSync('./bannedusers.json', client.banned);
            var embed = new Discord.MessageEmbed()
                .setDescription(`Banned ${banUser}`)
                .setColor(config.errorColor);
            message.channel.send(embed);
        },
        check(message) {
            if (message.author.id !== client.owner.id) {
                var embed = new Discord.MessageEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('That command is restricted to the bot owner!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false;
            } else {
                return true;
            }
        }
    });

    client.commandMap.set('unban', {
        func(message) {
            var banUser = message.mentions.users.first();
            client.banned = client.banned.filter(element => element !== banUser.id);
            fs.writeJsonSync('./bannedusers.json', client.banned);
            var embed = new Discord.MessageEmbed()
                .setDescription(`Unbanned ${banUser}`)
                .setColor(config.errorColor);
            message.channel.send(embed);
        },
        check(message) {
            if (message.author.id !== client.owner.id) {
                var embed = new Discord.MessageEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('That command is restricted to the bot owner!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false;
            } else {
                return true;
            }
        }
    });
};