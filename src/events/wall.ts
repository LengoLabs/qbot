import { config } from '../config';
import { robloxClient } from '../main';

const checkWallForAds = async () => {
    try {
        const group = await robloxClient.getGroup(config.groupId);
        const posts = await group.getWallPosts({ limit: 100 });
        posts.data.forEach((post) => {
            if(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/gm.test(post.content)) {
                group.deleteWallPost(post.id);
            }
        });
    } catch (err) {
        console.error(err);
    }
}

export { checkWallForAds };
