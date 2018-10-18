const fs = require('fs-extra');
module.exports = (Discord, client, config, owner) => {

    var commandMap = new Map();

    commandMap.set('ping', {
        func(message){
            const pong = client.ping
            const embed = new Discord.MessageEmbed()
                .setColor(config.embedColor)
                .setDescription(`Pong! ${pong}ms`)
                .setFooter('Average of last 3 pings');
            message.channel.send(embed);
        },
        check(message){
            return true
        },
    })

    commandMap.set('eval', {
        func(message){
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
        check(message){
            if (message.author.id !== owner.id) {
                var embed = new Discord.MessageEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('That command is restricted to the bot owner!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false
            } else {
                return true
            }
        }
    })

    commandMap.set('prefix', {
        func(message){
            config.prefix = message.content.replace(config.prefix + "prefix ", "");
            fs.writeJsonSync('./config.json', config)
            var embed = new Discord.MessageEmbed()
                .setTitle(`\u2705 Prefix changed to ${config.prefix}`)
                .setColor(config.embedColor);
            message.channel.send(embed);
        },
        check(message){
            if (message.author.id !== owner.id) {
                var embed = new Discord.MessageEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('That command is restricted to the bot owner!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false
            } else {
                return true
            }
        }
    })

    commandMap.set('prune', {
        func(message){
            var deleteAmmount = parseInt(message.content.replace(config.prefix + "prune ", "")) || 100;
            if (deleteAmmount > 100 || deleteAmmount < 2) {
                var embed = new Discord.MessageEmbed()
                    .setDescription('Number must be between 2 and 100')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return
            }
            message.channel.bulkDelete(deleteAmmount).then(messages => {
                deleteAmmount = messages.array().length;
                var embed = new Discord.MessageEmbed()
                    .setTitle(`\u2705 Deleted ${deleteAmmount} messages!`)
                    .setColor(config.embedColor);
                message.channel.send(embed).then(response => {
                    response.delete(3000);
                });
            })
        },
        check(message){
            if (message.channel.type !== "text") {
                var embed = new Discord.MessageEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('This can only run in a server!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false
            } else if (!message.channel.permissionsFor(message.member).has('MANAGE_MESSAGES')) {
                var embed = new Discord.MessageEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('You must be able to delete messages here!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false
            } else if (!message.channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES')) {
                var embed = new Discord.MessageEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('I don\'t have permission to do that here!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false
            } else {
                return true
            }
        }
    })

    return commandMap
}