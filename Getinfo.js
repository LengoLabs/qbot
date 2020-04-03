exports.run = async (client, message, args, level) => {
  const roblox = require("noblox.js");

  let username = args[0];
  if (!username)
    return message.channel.send({
      embed: {
        description:
          `You did not provide the \`username\` argument.\n` +
          `\n` +
          `Usage: ${client.config.prefix}getinfo <username>`,
        author: {
          name: message.author.tag,
          icon_url: message.author.displayAvatarURL()
        },
        color: 13632027
      }
    });

  roblox.getIdFromUsername(username).then(function(id) {
      roblox.getRankNameInGroup(client.config.groupId, id).then(function(rank) {
        roblox.getRankInGroup(client.config.groupId, id).then(function(ranknumber) {
          let ranknumberset = ranknumber;
          let rankname = rank;
          message.channel.send(`${username}:${id}`);
          message.channel.send({
            embed: {
              description: `[Profile Link](https://www.roblox.com/users/${id}/profile)`,
              author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL()
              },
              color: 8311585,
              fields: [
                {
                  name: `Username`,
                  value: username,
                  inline: false
                },
                {
                  name: `ID`,
                  value: id,
                  inline: false
                },
                {
                  name: `Group Rank`,
                  value: `${rankname} **(${ranknumberset})**`,
                  inline: false
                }
              ],
              thumbnail: {
                url: `https://assetgame.roblox.com/Thumbs/Avatar.ashx?userid=${id}`
              }
            }
          });
        });
      });
    })
    .catch(function(err) {
      return message.channel.send({
        embed: {
          description:
            `I couldn't find that user!` + `\n` + `You provided: ${username}`,
          author: {
            name: message.author.tag,
            icon_url: message.author.displayAvatarURL()
          },
          color: 13632027
        }
      });
    });
};
