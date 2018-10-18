'use strict';

const _D = require('discord.js');
const _c = new _D.Client();
const chalk = require('chalk');
const fs = require('fs-extra');
var config, commandMap;

fs.exists('./config.json').then(exists => {
    if (!exists) {
        fs.ensureFile('./config.json').then(() => {
            console.log('Created config.json')
            fs.readJson('./default_config.json').then(defaultConfig => {
                fs.writeJson('./config.json', defaultConfig).then(() => {
                    console.log('Wrote default_config.json to config.json')
                    console.log('Add your token into that file now')
                    fs.readJson('./config.json').then(configFile => {
                        config = configFile
                    })
                })
            })
        })
    } else {
        fs.readJson('./config.json').then(configFile => {
            console.log('Config loaded!')
            config = configFile
            _c.login(config.token)
        })
    }
})


var logCommand = m => {
    var denied
    if (m.denied === true) {
        denied = "DENIED"
    } else {
        denied = "ALLOWED"
    }
    console.log(chalk.hex(config.lineColor)('-----------------------------'))
    console.log(chalk.red(`${denied}\nCommand: ${chalk.blue(m.content.toLocaleLowerCase().slice(config.prefix.length))}\nUser: ${chalk.blue(m.author.tag)}\nChannel: ${chalk.blue(m.channel.name || '[DM]')}\nTime: ${chalk.blue(new Date().toString())}`));
    console.log(chalk.hex(config.lineColor)('-----------------------------\n'))
}

_c.on('ready', () => {
    console.log(chalk.hex(config.lineColor)('-----------------------------'))
    console.log(chalk.hex(config.readyColor)(`Bot started as ${chalk.blue(_c.user.tag)}`));
    _c.fetchApplication().then(app => {
        config.owner = app.owner;
        console.log(chalk.hex(config.readyColor)(`Owner set to ${chalk.blue(config.owner.tag)}`));
        console.log(chalk.hex(config.lineColor)('-----------------------------\n'))
        commandMap = require('./commands')(_D, _c, config);
    });
});

_c.on('message', m => {
    if (!m.content.startsWith(config.prefix)) return 
    var commandName = m.content.toLocaleLowerCase().split(' ')[0].slice(config.prefix.length)
    var command = commandMap[commandName] 
    if (command) {
        if (command.check) {
            if (command.check(m) !== true) {
                m.denied = true
                logCommand(m)
                return
            }
        }
        command.func(m);
        m.denied = false
        logCommand(m)
    }
});