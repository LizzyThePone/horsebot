const rp = require('request-promise');
const isurl = require('is-url');

module.exports = (Discord, client, config) => {

    const {PlayerManager} = require("discord.js-lavalink");

    const nodes = [
        {
            "host": "localhost",
            "port": 2333,
            "region": "asia",
            "password": "youshallnotpass"
        }
    ];
    var manager = new PlayerManager(client, nodes, {
        "user": client.user.id,
        "shards": 0
    });

    var getSongs = string => {
        var options = {
            'uri': `http://localhost:2333/loadtracks?identifier=${string}`,
            'method': 'GET',
            'headers': {
                "Authorization": "youshallnotpass"
            },
        };
        return rp(options).then(data => {
            console.log(data);
            return JSON.parse(data);
        });
    };

    var play = async (guild, channel) => {

        if (guild.queue.length === 0) {
            manager.leave(guild.id);
            return;
        }
        guild.player = await manager.join({
            'guild': guild.id,
            'channel': channel.id,
            'host': "localhost"
        });
        var track = guild.queue[0];
        await guild.player.volume(guild.volume || 50);
        await guild.player.play(track.track);
        await guild.player.once("error", error => console.error(error));
        await guild.player.once("end", () => {
            guild.queue.shift();
            play(guild, guild.player.channel);
        });
    };

    client.commandMap.set('play', {
        func(message) {
            var searchString = message.content.replace(config.prefix + "play ", "");
            if (isurl(searchString)) {
                getSongs(searchString).then(data => {
                    if (data.loadType === 'NO_MATCHES') {
                        var embed = new Discord.RichEmbed()
                            .setTitle("No songs found!")
                            .setColor(config.errorColor);
                        message.channel.send(embed);
                        return;
                    }
                    if (!message.guild.queue) {
                        message.guild.queue = [];
                    }
                    if (data.loadType === 'TRACK_LOADED') {
                        var embed = new Discord.RichEmbed()
                            .setTitle(data.tracks[0].info.title)
                            .setDescription('Track queued!')
                            .setURL(searchString)
                            .setColor(config.errorColor);
                        message.channel.send(embed).then(response => {
                            response.delete(60000);
                        });
                        if (message.guild.queue.length === 0) {
                            message.guild.queue.push(data.tracks[0]);
                            play(message.guild, message.member.voiceChannel);
                        } else {
                            message.guild.queue.push(data.tracks[0]);
                        }
                    }
                    if (data.loadType === 'PLAYLIST_LOADED') {
                        var embed = new Discord.RichEmbed()
                            .setTitle(data.playlistInfo.name)
                            .setDescription('Playlist loaded!')
                            .setURL(searchString)
                            .setColor(config.errorColor);
                        message.channel.send(embed).then(response => {
                            response.delete(60000);
                        });
                        if (message.guild.queue.length <= 0) {
                            message.guild.queue = message.guild.queue.concat(data.tracks);
                            play(message.guild, message.member.voiceChannel);
                        } else {
                            message.guild.queue = message.guild.queue.concat(data.tracks);
                        }
                    }
                });
            } else {
                getSongs('ytsearch:' + searchString).then(data => {
                    if (data.loadType === 'NO_MATCHES') {
                        var embed = new Discord.RichEmbed()
                            .setTitle("No songs found!")
                            .setColor(config.errorColor);
                        message.channel.send(embed);
                        return;
                    }
                    if (!message.guild.queue) {
                        message.guild.queue = [];
                    }
                    message.guild.queue.push(data.tracks[0]);
                    if (message.guild.queue.length === 1) {
                        play(message.guild, message.member.voiceChannel);
                    }
                });
            }
        },
        check(message) {
            if (!message.member.voiceChannel) {
                const embed = new Discord.RichEmbed()
                    .setColor(config.errorColor)
                    .setTitle('You must be in a voice channel!');
                message.channel.send(embed);
                return false;
            } else {
                return true;
            }
        },
    });

    client.commandMap.set('skip', {
        func(message) {
            message.guild.player.stop();
        },
        check(message) {
            if (!message.member.voiceChannel) {
                const embed = new Discord.RichEmbed()
                    .setColor(config.errorColor)
                    .setTitle('You must be in a voice channel!');
                message.channel.send(embed);
                return false;
            } else if (!message.guild.player || message.guild.queue.length <= 0) {
                const embed = new Discord.RichEmbed()
                    .setColor(config.errorColor)
                    .setTitle('Nothing is playing!');
                message.channel.send(embed);
                return false;
            } else {
                return true;
            }
        },
    });

    client.commandMap.set('stop', {
        func(message) {
            message.guild.queue = [];
            message.guild.player.stop();
        },
        check(message) {
            if (!message.member.voiceChannel) {
                const embed = new Discord.RichEmbed()
                    .setColor(config.errorColor)
                    .setTitle('You must be in a voice channel!');
                message.channel.send(embed);
                return false;
            } else if (!message.guild.player || message.guild.queue.length <= 0) {
                const embed = new Discord.RichEmbed()
                    .setColor(config.errorColor)
                    .setTitle('Nothing is playing!');
                message.channel.send(embed);
                return false;
            } else {
                return true;
            }
        },
    });

    client.commandMap.set('volume', {
        func(message) {
            var volume = parseInt(message.content.replace(config.prefix + "volume ", ""));
            if (isNaN(volume)) {
                var embed = new Discord.RichEmbed()
                    .setDescription('Must be a number!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return;
            }
            if (volume > 100 || volume < 2) {
                var embed = new Discord.RichEmbed()
                    .setDescription('Number must be between 2 and 100')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return;
            }
            var barf = (volume / 20).round()
            var embed = new Discord.RichEmbed()
                .setTitle(`Set volume to ${volume}`)
                .setDescription(`[${'#'.repeat(barf)}${'='.repeat(20 - barf)}]`)
                .setColor(config.embedColor);
            message.channel.send(embed);
            message.guild.volume = volume;
            message.guild.player.volume(volume);
        },
        check(message) {
            if (!message.member.voiceChannel) {
                const embed = new Discord.RichEmbed()
                    .setColor(config.errorColor)
                    .setTitle('You must be in a voice channel!');
                message.channel.send(embed);
                return false;
            } else if (!message.guild.player || message.guild.queue.length <= 0) {
                const embed = new Discord.RichEmbed()
                    .setColor(config.errorColor)
                    .setTitle('Nothing is playing!');
                message.channel.send(embed);
                return false;
            } else {
                return true;
            }
        },
    });
};