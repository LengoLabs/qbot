import { Client } from 'discord.js';
import { BotConfig, CommandExport } from './types';
import { Command } from './Command';
import { config } from '../config';
import { readdirSync } from 'fs';
import { discordClient } from '../main';

class QbotClient extends Client {
    config: BotConfig;
    commands: Command[];

    constructor() {
        super({
            intents: [
                'GUILDS',
                'GUILD_MESSAGES',
                'GUILD_MESSAGE_REACTIONS',
            ]
        })
        this.config = config;
        this.commands = this.loadCommands();
    }

    /**
     * Load all commands into the commands object of QbotClient.
     */
    loadCommands() {
        const rawModules = readdirSync('./src/commands');
        let commands = [];
        rawModules.forEach((module) => {
            const rawCommands = readdirSync(`./src/commands/${module}`);
            rawCommands.forEach(async (cmdName) => {
                const { default: command }: CommandExport = await import(`../commands/${module}/${cmdName}`);
                commands.push(command);
            });
        });
        (async () => {
            const slashCommands = commands.map((cmd) => cmd.generateAPICommand());
            console.log(await discordClient.application.commands.fetch());
            // if(JSON.stringify(slashCommands) === JSON.stringify(await discordClient.application.commands.fetch())) {
            //     console.log('theyre the same');
            // } else {
            //     console.log('theyre not the same');
            // }
            discordClient.application.commands.set(slashCommands);
        });
        return commands;
    }
}

export { QbotClient };