import { TextChannel } from 'discord.js';
import { discordClient, robloxClient } from '../main';
import { config } from '../config';
import { getShoutLogEmbed } from '../handlers/locale';
import { Group } from 'bloxy/dist/structures';

let firstShout = true;
let lastShout: string;

const recordShout = async (group: Group) => {
    try {
        const logChannel = await discordClient.channels.fetch(config.logChannels.shout) as TextChannel;

        if(firstShout) firstShout = false;
        if(!firstShout && group.shout !== null && lastShout !== group.shout.content && logChannel) logChannel.send({ embeds: [ await getShoutLogEmbed(group.shout) ] });

        setTimeout(() => recordShout(group), 60 * 1000);
        if(group.shout?.content) lastShout = group.shout?.content;
    } catch (err) {
        console.error(err);
    }
}

export { recordShout };
