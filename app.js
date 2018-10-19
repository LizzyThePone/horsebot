'use strict';

const Discord = require('discord.js');
const client = new Discord.Client();
const chalk = require('chalk');
const fs = require('fs-extra');
client.commandMap = new Map();
var configLocation = './config/config.json';
var defaultConfigLocation = './config/default_config.json';
var bansLocation = './config/bannedusers.json';
var config;

fs.exists(configLocation).then(exists => {
    if (!exists) {
        fs.ensureFileSync(configLocation);
        console.log('Created config.json');
        var defaultConfig = fs.readJsonSync(defaultConfigLocation);
        fs.writeJsonSync(configLocation, defaultConfig);
        console.log('Wrote default_config.json to config.json');
        console.log('Add your token into that file now');
    } else {
        var configFile = fs.readJsonSync(configLocation);
        console.log('Config loaded!');
        config = configFile;
        client.login(config.token);
    }
});

fs.exists(bansLocation).then(exists => {
    if (!exists) {
        fs.ensureFileSync(bansLocation);
        console.log('Created bannedusers.json');
        client.banned = [];
        fs.writeJsonSync(bansLocation, client.banned);
    } else {
        client.banned = fs.readJsonSync(bansLocation);
        console.log('Bans loaded!');
    }
});

var logCommand = message => {
    var denied = message.denied ? "DENIED" : "ALLOWED";
    console.log(chalk.hex(config.lineColor)('-----------------------------'));
    console.log(chalk.red(`${denied}\nCommand: ${chalk.blue(message.commandName)}\nUser: ${chalk.blue(message.author.tag)}\n${message.guild ? `Server: (${chalk.blue(message.guild.id)}) ${chalk.blue(message.guild.name)}\n` : ""}Channel: ${chalk.blue(message.channel.name || '[DM]')}\nTime: ${chalk.blue(new Date().toString())}`));
    console.log(chalk.hex(config.lineColor)('-----------------------------\n'));
};

client.on('ready', () => {
    console.log(chalk.hex(config.lineColor)('-----------------------------'));
    console.log(chalk.hex(config.readyColor)(`Bot started as ${chalk.blue(client.user.tag)}`));
    client.fetchApplication().then(app => {
        process.on('uncaughtException', exception => {
            var embed = new Discord.MessageEmbed()
                .setTitle("Error:")
                .setDescription(exception.stack)
                .setColor(config.errorColor);
            app.owner.send(embed);
        });
        client.owner = app.owner;
        console.log(chalk.hex(config.readyColor)(`Owner set to ${chalk.blue(client.owner.tag)}`));
        console.log(chalk.hex(config.lineColor)('-----------------------------\n'));
        require('./modules/commands')(Discord, client, config);
        var embed = new Discord.MessageEmbed()
            .setDescription(`Started at ${new Date()}`)
            .setColor(config.embedColor);
        app.owner.send(embed);
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