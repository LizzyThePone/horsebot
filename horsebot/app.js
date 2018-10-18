'use strict';

const Discord = require('discord.js');
const client = new Discord.Client();
const chalk = require('chalk');
const fs = require('fs-extra');
var config, commandMap;

fs.exists('./config.json').then(exists => {
    if (!exists) {
        fs.ensureFileSync('./config.json')
        console.log('Created config.json')
        var defaultConfig = fs.readJsonSync('./default_config.json')
        fs.writeJsonSync('./config.json', defaultConfig);
        console.log('Wrote default_config.json to config.json');
        console.log('Add your token into that file now');
    } else {
        var configFile = fs.readJsonSync('./config.json')
        console.log('Config loaded!')
        config = configFile
        client.login(config.token)
    }
})

var logCommand = m => {
    var denied = m.denied ? "DENIED" : "ALLOWED"
    console.log(chalk.hex(config.lineColor)('-----------------------------'))
    console.log(chalk.red(`${denied}\nCommand: ${chalk.blue(m.content.toLocaleLowerCase().slice(config.prefix.length))}\nUser: ${chalk.blue(m.author.tag)}\nChannel: ${chalk.blue(m.channel.name || '[DM]')}\nTime: ${chalk.blue(new Date().toString())}`));
    console.log(chalk.hex(config.lineColor)('-----------------------------\n'))
}

client.on('ready', () => {
    console.log(chalk.hex(config.lineColor)('-----------------------------'))
    console.log(chalk.hex(config.readyColor)(`Bot started as ${chalk.blue(client.user.tag)}`));
    client.fetchApplication().then(app => {
        config.owner = app.owner;
        console.log(chalk.hex(config.readyColor)(`Owner set to ${chalk.blue(config.owner.tag)}`));
        console.log(chalk.hex(config.lineColor)('-----------------------------\n'))
        commandMap = require('./commands')(Discord, client, config);
    });
});

client.on('message', message => {
    if (!message.content.startsWith(config.prefix)) return 
    var commandName = message.content.toLocaleLowerCase().split(' ')[0].slice(config.prefix.length)
    var command = commandMap.get(commandName)
    if (command) {
        if (command.check) {
            if (command.check(message) !== true) {
                message.denied = true
                logCommand(message)
                return
            }
        }
        command.func(message);
        message.denied = false
        logCommand(message)
    }
});