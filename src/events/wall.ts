import { Group as RobloxGroup } from "bloxy/dist/structures";

const checkWallForAds = async (group: RobloxGroup) => {
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
