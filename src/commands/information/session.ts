import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { discordClient, robloxGroup } from '../../main';
import { checkIconUrl, quoteIconUrl, mainColor } from '../../handlers/locale';
import { config } from '../../config';
import { TextChannel } from 'discord.js';

class SessionCommand extends Command {
    constructor() {
        super({
            trigger: 'session',
            description: 'Announces a session in both this server and the group.',
            type: 'ChatInput',
            module: 'sessions',
            permissions: [
                {
                    type: 'role',
                    ids: config.permissions.users,
                    value: true,
                }
            ],
            args: [],
        });
    }

    async run(ctx: CommandContext) {
        // Sending message to the specific Discord channel
        const channel = await discordClient.channels.fetch('[CHANNEL ID GOES HERE]') as TextChannel;
        channel.send({
            embeds: [
                {
                    author: {
                        name: 'Shift Announcement',
                        icon_url: quoteIconUrl,
                    },
                    description: 'Discord text here',
                    color: parseInt(mainColor.substring(1), 16),
                }
            ],
            allowedMentions: {
                parse: ['roles']
            }
        });

        // Updating the Roblox group shout
        robloxGroup.updateShout('Roblox shout text here');

        // Sending a confirmation message back to the user
        return ctx.reply({
            embeds: [
                {
                    author: {
                        name: 'Success!',
                        icon_url: checkIconUrl,
                    },
                    description: 'This has been posted as a group shout and a message in the shift announcements ( <#CHANNEL ID GOES HERE> ) channel.',
                    color: parseInt(checkIconUrl.substring(1), 16),
                }
            ]
        });
    }
}

export default SessionCommand;
