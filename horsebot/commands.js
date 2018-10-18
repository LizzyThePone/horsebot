module.exports = (_D, _c, config) => {

    var commandMap = new Map()

    commandMap.set('ping', {
        func: m => {
            const pong = _c.ping
            const e = new _D.MessageEmbed()
                .setColor(config.embedColor)
                .setDescription(`Pong! ${pong}ms`)
                .setFooter('Average of last 3 pings')
            m.channel.send(e)
        },
        check: m => {
            return true
        },
    })

    commandMap.set('eval', {
        func: m => {
            try {
                var evalStr = eval(m.content.replace(config.prefix + "eval ", ""));
                var e = new _D.MessageEmbed()
                    .setTitle("Result:")
                    .setDescription(evalStr)
                    .setColor(config.embedColor);
                m.channel.send(e);
            } catch (e) {
                var e = new _D.MessageEmbed()
                    .setTitle("Error:")
                    .setDescription(e.stack)
                    .setColor(config.errorColor);
                m.channel.send(e);
            }
        },
        check: m => {
            if (m.author.id !== config.owner.id) {
                var e = new _D.MessageEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('That command is restricted to the bot owner!')
                    .setColor(config.errorColor);
                m.channel.send(e);
                return false
            } else {
                return true
            }
        }
    })

    commandMap.set('prefix', {
        func: m => {
            config.prefix = m.content.replace(config.prefix + "prefix ", "");
            var e = new _D.MessageEmbed()
                .setTitle(`\u2705 Prefix changed to ${config.prefix}`)
                .setColor(config.embedColor);
            m.channel.send(e);
        },
        check: m => {
            if (m.author.id !== config.owner.id) {
                var e = new _D.MessageEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('That command is restricted to the bot owner!')
                    .setColor(config.errorColor);
                m.channel.send(e);
                return false
            } else {
                return true
            }
        }
    })

    commandMap.set('prune', {
        func: m => {
            var deleteAmmount = parseInt(m.content.replace(config.prefix + "prune ", "")) || 100;
            if (deleteAmmount > 100 || deleteAmmount < 2) {
                var e = new _D.MessageEmbed()
                    .setDescription('Number must be between 2 and 100')
                    .setColor(config.errorColor);
                m.channel.send(e);
                return
            }
            m.channel.bulkDelete(deleteAmmount).then(messages => {
                deleteAmmount = messages.array().length
                var e = new _D.MessageEmbed()
                    .setTitle(`\u2705 Deleted ${deleteAmmount} messages!`)
                    .setColor(config.embedColor);
                m.channel.send(e).then(response => {
                    response.delete(3000);
                });
            })
        },
        check: m => {
            if (m.channel.type !== "text") {
                var e = new _D.MessageEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('This can only run in a server!')
                    .setColor(config.errorColor);
                m.channel.send(e);
                return false
            } else if (!m.channel.permissionsFor(m.member).has('MANAGE_MESSAGES')) {
                var e = new _D.MessageEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('You must be able to delete messages here!')
                    .setColor(config.errorColor);
                m.channel.send(e);
                return false
            } else if (!m.channel.permissionsFor(m.guild.me).has('MANAGE_MESSAGES')) {
                var e = new _D.MessageEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('I don\'t have permission to do that here!')
                    .setColor(config.errorColor);
                m.channel.send(e);
                return false
            } else {
                return true
            }
        }
    })

    return commandMap
}