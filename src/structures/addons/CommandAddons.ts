import {
    Message,
    Interaction,
    MessageOptions,
    InteractionReplyOptions,
    CommandInteraction,
    User,
    GuildMember,
} from 'discord.js';

export class CommandContext  {
    type: 'interaction' | 'message';
    subject?: CommandInteraction | Message;
    user?: User;
    member?: GuildMember;

    /**
     * Command context for getting usage information and replying.
     * 
     * @param payload
     */
    constructor(payload: Interaction | CommandInteraction | Message) {
        this.type = payload instanceof Message ? 'message' : 'interaction';
        this.subject = payload instanceof Interaction ? payload as CommandInteraction : payload;
        this.user = payload instanceof Message ? payload.author : payload.user;
        this.member = payload.member as GuildMember;
    }

    /**
     * Send a mesasge in the channel of the command message, or directly reply to a command interaction.
     * 
     * @param payload
     */
    reply(payload: string | MessageOptions | InteractionReplyOptions) {
        if(this.subject instanceof CommandInteraction) {
            return this.subject.reply(payload);
        } else {
            return this.subject.channel.send(payload);
        }
    }
}