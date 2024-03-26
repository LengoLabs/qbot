import { PrismaClient } from '@prisma/client';
import { DatabaseProvider } from '../structures/DatabaseProvider';
import { DatabaseUser, SuspendedUser, XPUser } from '../structures/types';
require('dotenv').config();

class PrismaProvider extends DatabaseProvider {
    db: PrismaClient;

    constructor() {
        super();
        this.db = new PrismaClient();
    }

    async findUser(robloxId: string): Promise<DatabaseUser> {
        let userData = await this.db.user.findUnique({ where: { robloxId } });
        if (!userData) userData = await this.db.user.create({ data: { robloxId } });
        return userData;
    }

    async findSuspendedUser(robloxId: string, groupId: number): Promise<SuspendedUser> {
        let userData = await this.db.suspensions.findUnique({ where: { robloxId: robloxId, groupId: groupId  } });
        if (!userData) userData = await this.db.suspensions.create({ data: { robloxId: robloxId, groupId: groupId  } });
        return userData;
    }

    async findXPUser(robloxId: string, groupId: number): Promise<XPUser> {
        let userData = await this.db.xp.findUnique({ where: { robloxId: robloxId, groupId: groupId  } });
        if (!userData) userData = await this.db.xp.create({ data: { robloxId: robloxId, groupId: groupId  } });
        return userData;
    }

    async findSuspendedUsers(groupId: number | null): Promise<SuspendedUser[]> {
        if (groupId == null) return await this.db.suspensions.findMany({ where: { suspendedUntil: { not: null } } });
        return await this.db.suspensions.findMany({ where: { groupId: groupId, suspendedUntil: { not: null } } });
    }

    async findBannedUsers(): Promise<DatabaseUser[]> {
        return await this.db.user.findMany({ where: { isBanned: true } });
    }

    async updateUser(robloxId: string, data: any) {
        let userData = await this.db.user.findUnique({ where: { robloxId } });
        if (!userData) userData = await this.db.user.create({ data: { robloxId } });

        const newData: DatabaseUser = userData;
        Object.keys(data).forEach((key) => newData[key] = data[key]);
        return await this.db.user.update({ where: { robloxId }, data: userData });
    }

    async updateUserXP(robloxId: string, groupId: number, data: any) {
        let userData = await this.db.xp.findUnique({ where: { robloxId: robloxId, groupId: groupId } });
        if (!userData) userData = await this.db.xp.create({ data: { robloxId: robloxId, groupId: groupId } });

        const newData: XPUser = userData;
        Object.keys(data).forEach((key) => newData[key] = data[key]);
        return await this.db.xp.update({ where: { robloxId: robloxId, groupId: groupId }, data: userData });
    }

    async updateUserSuspension(robloxId: string, groupId: number, data: any) {
        let userData = await this.db.suspensions.findUnique({ where: { robloxId: robloxId, groupId: groupId } });
        if (!userData) userData = await this.db.suspensions.create({ data: { robloxId: robloxId, groupId: groupId } });

        const newData: SuspendedUser = userData;
        Object.keys(data).forEach((key) => newData[key] = data[key]);
        return await this.db.suspensions.update({ where: { robloxId: robloxId, groupId: groupId }, data: userData });
    }
}

export { PrismaProvider };