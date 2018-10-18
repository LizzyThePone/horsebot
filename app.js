'use strict';

const Discord = require('discord.js');
const client = new Discord.Client();
const chalk = require('chalk');
const fs = require('fs-extra');
client.commandMap = new Map();
var config;

fs.exists('./config.json').then(exists => {
    if (!exists) {
        fs.ensureFileSync('./config.json');
        console.log('Created config.json');
        var defaultConfig = fs.readJsonSync('./default_config.json');
        fs.writeJsonSync('./config.json', defaultConfig);
        console.log('Wrote default_config.json to config.json');
        console.log('Add your token into that file now');
    } else {
        var configFile = fs.readJsonSync('./config.json');
        console.log('Config loaded!');
        config = configFile;
        client.login(config.token);
    }
});

fs.exists('./bannedusers.json').then(exists => {
    if (!exists) {
        fs.ensureFileSync('./bannedusers.json');
        console.log('Created bannedusers.json');
        client.banned = [];
        fs.writeJsonSync('./bannedusers.json', client.banned);
    } else {
        client.banned = fs.readJsonSync('./bannedusers.json');
        console.log('Bans loaded!');
    }
});

var logCommand = message => {
    var denied = message.denied ? "DENIED" : "ALLOWED";
    console.log(chalk.hex(config.lineColor)('-----------------------------'));
    console.log(chalk.red(`${denied}\nCommand: ${chalk.blue(message.commandName)}\nUser: ${chalk.blue(message.author.tag)}\nChannel: ${chalk.blue(message.channel.name || '[DM]')}\nTime: ${chalk.blue(new Date().toString())}`));
    console.log(chalk.hex(config.lineColor)('-----------------------------\n'));
};

client.on('ready', () => {
    console.log(chalk.hex(config.lineColor)('-----------------------------'));
    console.log(chalk.hex(config.readyColor)(`Bot started as ${chalk.blue(client.user.tag)}`));
    client.fetchApplication().then(app => {
        client.owner = app.owner;
        console.log(chalk.hex(config.readyColor)(`Owner set to ${chalk.blue(client.owner.tag)}`));
        console.log(chalk.hex(config.lineColor)('-----------------------------\n'));
        require('./commands')(Discord, client, config);
    });
});

client.on('message', message => {
    if (!message.content.startsWith(config.prefix)) return;
    message.commandName = message.content.toLocaleLowerCase().split(' ')[0].slice(config.prefix.length);
    var command = client.commandMap.get(message.commandName);
    if (command) {
        if (client.banned.find(element => element === message.author.id)) {
            var embed = new Discord.MessageEmbed()
                .setTitle("You are banned by the bot owner.")
                .setColor(config.errorColor);
            message.channel.send(embed);
            message.denied = true;
            logCommand(message);
            return;
        }
        if (command.check) {
            if (command.check(message) !== true) {
                message.denied = true;
                logCommand(message);
                return;
            }
        }
        command.func(message);
        message.denied = false;
        logCommand(message);
    }
});