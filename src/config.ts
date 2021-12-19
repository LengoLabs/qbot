import { BotConfig } from './structures/types'; 

export const config: BotConfig = {
    groupId: 3281575,
    slashCommands: true,
    legacyCommands: {
        enabled: true,
        prefixes: ['q!'],
    },
    permissions: {
        ranking: '830194496238387221',
    },
    logChannels: {
        actions: '922189549738786816',
    },
    verificationChecks: true,
    firedRank: 1,
}