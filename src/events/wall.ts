import { config } from '../config';
import { robloxClient } from '../main';

const checkWallForAds = async (group) => {
    setTimeout(checkWallForAds, 30000);
    
    try {
        const posts = await group.getWallPosts({ limit: 100, sortOrder: 'Desc' });
        posts.data?.forEach((post: any, index) => {
            setTimeout(async () => {
                if(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/gm.test(post.body)) {
                    await group.deleteWallPost(post.id);
                }
            }, 1000 * index);
        });
    } catch (err) {
        console.error(err);
    }
}

export { checkWallForAds };
