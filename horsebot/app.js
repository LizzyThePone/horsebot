'use strict';

const _D = require('discord.js');
const _c = new _D.Client();
const chalk = require('chalk');
const commandMap = new Map();
var queue = new Map();
var prefix = ']';
var embedColor = 0x00a1ff;
var errorColor = 0xff0000;
var lineColor = 0xb942f4;
var readyColor = 0x41f489;
var owner;

var logCommand = m => {
    var denied
    if (m.denied === true) {
        denied = "DENIED"
    } else {
        denied = "ALLOWED"
    }
    console.log(chalk.hex(lineColor)('-----------------------------'))
    console.log(chalk.red(`${denied}\nCommand: ${chalk.blue(m.content.toLocaleLowerCase().slice(prefix.length))}\nUser: ${chalk.blue(m.author.tag)}\nChannel: ${chalk.blue(m.channel.name || '[DM]')}\nTime: ${chalk.blue(new Date().toString())}`));
    console.log(chalk.hex(lineColor)('-----------------------------\n'))
}

commandMap['ping'] = {
    func: m => {
        const pong = _c.ping
        const e = new _D.MessageEmbed()
            .setColor(embedColor)
            .setDescription(`Pong! ${pong}ms`)
            .setFooter('Average of last 3 pings')
        m.channel.send(e)
    },
    check: m => {
        return true
    },
}

commandMap['eval'] = {
    func: m => {
        try {
            var evalStr = eval(m.content.replace(prefix + "eval ", ""));
            var e = new _D.MessageEmbed()
                .setTitle("Result:")
                .setDescription(evalStr)
                .setColor(embedColor);
            m.channel.send(e);
        } catch (e) {
            var e = new _D.MessageEmbed()
                .setTitle("Error:")
                .setDescription(e.stack)
                .setColor(errorColor);
            m.channel.send(e);
        }
    },
    check: m => {
        if (m.author.id !== owner.id) {
            var e = new _D.MessageEmbed()
                .setTitle("Unable to run:")
                .setDescription('That command is restricted to the bot owner!')
                .setColor(errorColor);
            m.channel.send(e);
            return false
        } else {
            return true
        }
    }
}

commandMap["prefix"] = {
    func: m => {
        prefix = m.content.replace(prefix + "prefix ", "");
        var e = new _D.MessageEmbed()
            .setTitle(`\u2705 Prefix changed to ${prefix}`)
            .setColor(embedColor);
        m.channel.send(e);
    },
    check: m => {
        if (m.author.id !== owner.id) {
            var e = new _D.MessageEmbed()
                .setTitle("Unable to run:")
                .setDescription('That command is restricted to the bot owner!')
                .setColor(errorColor);
            m.channel.send(e);
            return false
        } else {
            return true
        }
    }
}

commandMap['prune'] = {
    func: m => {
        var deleteAmmount = parseInt(m.content.replace(prefix + "prune ", "")) || 100;
        if (deleteAmmount > 100 || deleteAmmount < 2) {
            var e = new _D.MessageEmbed()
                .setDescription('Number must be between 2 and 100')
                .setColor(errorColor);
            m.channel.send(e);
            return
        }
        m.channel.bulkDelete(deleteAmmount).then(messages => {
            deleteAmmount = messages.array().length
            var e = new _D.MessageEmbed()
                .setTitle(`\u2705 Deleted ${deleteAmmount} messages!`)
                .setColor(embedColor);
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
                .setColor(errorColor);
            m.channel.send(e);
            return false
        } else if (!m.channel.permissionsFor(m.member).has('MANAGE_MESSAGES')) {
            var e = new _D.MessageEmbed()
                .setTitle("Unable to run:")
                .setDescription('You must be able to delete messages here!')
                .setColor(errorColor);
            m.channel.send(e);
            return false
        } else if (!m.channel.permissionsFor(m.guild.me).has('MANAGE_MESSAGES')) {
            var e = new _D.MessageEmbed()
                .setTitle("Unable to run:")
                .setDescription('I don\'t have permission to do that here!')
                .setColor(errorColor);
            m.channel.send(e);
            return false
        } else {
            return true
        }
    }
}

_c.on('ready', () => {
    console.log(chalk.hex(lineColor)('-----------------------------'))
    console.log(chalk.hex(readyColor)(`Bot started as ${chalk.blue(_c.user.tag)}`));
    _c.fetchApplication().then(app => {
        owner = app.owner;
        console.log(chalk.hex(readyColor)(`Owner set to ${chalk.blue(owner.tag)}`));
        console.log(chalk.hex(lineColor)('-----------------------------\n'))
    });
});

_c.on('message', m => {
    if (!m.content.startsWith(prefix)) return 
    if (commandMap[m.content.toLocaleLowerCase().split(' ')[0].slice(prefix.length)].check) {
        if (commandMap[m.content.toLocaleLowerCase().split(' ')[0].slice(prefix.length)].check(m) !== true) {
            m.denied = true
            logCommand(m)
            return
        }
    }
    if (commandMap[m.content.toLocaleLowerCase().split(' ')[0].slice(prefix.length)]) {
        commandMap[m.content.toLocaleLowerCase().split(' ')[0].slice(prefix.length)].func(m);
        m.denied = false
        logCommand(m)
    }
});

_c.login('');