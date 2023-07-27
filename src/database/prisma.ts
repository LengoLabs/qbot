import { PrismaClient } from '@prisma/client';
import { DatabaseProvider } from '../structures/DatabaseProvider';
import { DatabaseUser } from '../structures/types';
require('dotenv').config();

class PrismaProvider extends DatabaseProvider {
    db: PrismaClient;

    constructor() {
        super();
        this.db = new PrismaClient();
    }

    async findUser(robloxId: string): Promise<DatabaseUser> {
        let userData = await this.db.user.findUnique({ where: { robloxId } });
        if(!userData) userData = await this.db.user.create({ data: { robloxId } });
        return userData;
    }

    async findSuspendedUsers(): Promise<DatabaseUser[]> {
        return await this.db.user.findMany({ where: { suspendedUntil: { not: null } } });
    }

    async findBannedUsers(): Promise<DatabaseUser[]> {
        return await this.db.user.findMany({ where: { isBanned: true } });
    }

    async updateUser(robloxId: string, data: any) {
        let userData = await this.db.user.findUnique({ where: { robloxId } });
        if(!userData) userData = await this.db.user.create({ data: { robloxId } });

        const newData: DatabaseUser = userData;
        Object.keys(data).forEach((key) => newData[key] = data[key]);
        return await this.db.user.update({ where: { robloxId }, data: userData });
    }
}

export { PrismaProvider };
