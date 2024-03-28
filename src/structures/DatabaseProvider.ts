abstract class DatabaseProvider {
    abstract findUser(query: any);
    abstract findSuspendedUser(robloxId: string, groupId: number);
    abstract findXPUser(robloxId: string, groupId: number);
    abstract findSuspendedUsers(groupId: number|null);
    abstract findBannedUsers();
    abstract updateUser(query: any, data: any);
    abstract updateUserXP(robloxId: string, groupId: number, data: any);
    abstract updateUserSuspension(robloxId: string, groupId: number, data: any);
}

export { DatabaseProvider };