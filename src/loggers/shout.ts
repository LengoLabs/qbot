import { TextChannel } from 'discord.js';
import { discordClient, robloxClient } from '../main';
import { config } from '../config';
import { getShoutLogEmbed } from '../handlers/locale';
let firstShout = true;
let lastShout: string;

const recordShout = async () => {
    const group = await robloxClient.getGroup(config.groupId);
    const logChannel = await discordClient.channels.fetch(config.logChannels.shout) as TextChannel;
    if(firstShout) {
        firstShout = false;
    } else {
        if(group.shout !== null && lastShout !== group.shout.content) {
            logChannel.send({ embeds: [ await getShoutLogEmbed(group.shout) ] });
        }
    }
    setTimeout(recordShout, 30 * 1000);
    if(!group.shout) {
        lastShout = null;
    } else {
        lastShout = group.shout.content;
    }
}

export { recordShout };