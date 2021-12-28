import { discordClient, robloxGroup } from '../main';
import { getWallPostEmbed } from '../handlers/locale';
import { config } from '../config';
import { TextChannel } from 'discord.js';

let lastRecordedDate: Date;

const recordGroupWallPosts = async () => {
    try {
        const groupWall = await robloxGroup.getWallPosts({});
        const postChannel = await discordClient.channels.cache.get(config.logChannels.wall) as TextChannel;
        const posts = groupWall.data.sort((a, b) => {
            return new Date(a.created).getTime() < new Date(b.created).getTime() ? 1 : -1;
        });
        const mostRecentDate = new Date(posts[0].created);
        if(lastRecordedDate) {
            posts.forEach(async (post) => {
                const postCreationDate = new Date(post.created);
                if(postCreationDate.getTime() > lastRecordedDate.getTime()) {
                    postChannel.send({ embeds: [ await getWallPostEmbed(post) ] });
                }
            });
            lastRecordedDate = mostRecentDate;
        } else {
            lastRecordedDate = mostRecentDate;
        }
    } catch (err) {
        console.error(err);
    }
    setTimeout(recordGroupWallPosts, 30000);
}

export { recordGroupWallPosts };