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
        shout: '',
    },
    database: {
        enabled: true,
        type: 'sqlite',
    },
    maximumRank: 255,
    verificationChecks: true,
    firedRank: 1,
    suspendedRank: 1,
}