import { AutocompleteInteraction, APIApplicationCommandOptionChoice } from 'discord.js';
import { getLinkedRobloxUser } from '../handlers/accountLinks';
import { robloxClient, robloxGroup } from '../main';

const handleRobloxUser = async (interaction: AutocompleteInteraction, option: APIApplicationCommandOptionChoice) => {
    if(!option.value) return;
    try {
        const discordUsers = await interaction.guild.members.search({
            query: option.value as string,
            limit: 5,
        });
        const robloxQuery = await robloxClient.getUsersByUsernames([ option.value as string ]);
        const linkedRobloxUsersPromise = new Promise((resolve, reject) => {
            let linkedRobloxUsers = [];
            let userIndex = 0;
            if(discordUsers.size === 0) return resolve([]);
            discordUsers.forEach(async (member) => {
                if(userIndex >= 3) return;
                userIndex += 1;
                const linkedRobloxUser = await getLinkedRobloxUser(member.id);
                if(!linkedRobloxUser) return;
                linkedRobloxUsers.push({
                    name: `💬 @${member.user.username}: ${linkedRobloxUser.name} (${linkedRobloxUser.id})`,
                    value: linkedRobloxUser.id.toString(),
                });
                if(userIndex === discordUsers.size) return resolve(linkedRobloxUsers);
            });
        });
        linkedRobloxUsersPromise.then(async (linkedRobloxUsers: { name: string; value: string; }[]) => {
            if(robloxQuery.length === 0) {
                if(linkedRobloxUsers.length === 0) return;
                await interaction.respond([
                    ... linkedRobloxUsers
                ]);
            } else {
                const robloxUser = await robloxQuery[0].getUser();
                await interaction.respond([
                    {
                        name: `🎮 ${robloxUser.name} (${robloxUser.id})`,
                        value: robloxUser.id.toString(),
                    },
                    ... linkedRobloxUsers
                ]);
            }
        });
    } catch (err) {};
}

export { handleRobloxUser };
