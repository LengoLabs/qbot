module.exports = {
    groupId: 3281575,
    maximumRank: 255,
    prefix: 'q!',
    logChannelId: '746108849551048788',
    shoutChannelId: '746108849551048788',
    auditLogChannelId: '746108849551048788',
    colors: {
        info: '#5b57d9',
        error: '#de554e',
        neutral: '#f2f255',
        success: '#43d177'
    },
    verificationChecks: true,
    firedRank: 1,
    xpRankup: {
        enabled: true,
        roles: [
            {
                rank: 2,
                xpNeeded: 10
            }
        ]
    },
    memberCount: {
        enabled: false,
        groupIconURL: '',
        channelId: '',
        milestones: []
    },
    antiAbuse: {
        enabled: true,
        bypassRank: 255,
        duration: 120,
        threshold: 1,
        actionRank: null,
        actionLogChannel: '746108849551048788'
    }
}
