import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { CommandArgument } from '../../structures/types';

class HelloCommand extends Command {
    constructor() {
        super({
            name: 'hello',
            description: 'This is an amazing command',
            type: 'ChatInput',
        });
    }

    run = (ctx, args) => {
        console.log('Command "hello" has been triggered.');
        return;
    }
}

export default HelloCommand;