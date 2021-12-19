import { BotConfig } from './structures/types'; 

export const config: BotConfig = {
    groupId: 0,
    slashCommands: true,
    legacyCommands: {
        enabled: true,
        prefixes: ['q!'],
    },
    permissions: {
        ranking: '',
    },
    logChannels: {
        actions: '',
    }
}