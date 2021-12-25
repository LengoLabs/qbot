import { DatabaseProvider } from '../structures/DatabaseProvider';
import { DatabaseUser } from '../structures/types';
import { Sequelize, Model, DataTypes, Op } from 'sequelize';
import { config } from '../config';

class User extends Model {};

class SQLiteProvider {
    sql: Sequelize;

    constructor() {
        this.sql = new Sequelize({
            dialect: 'sqlite',
            storage: '../../.data/sql/database.sqlite',
            logging: false
        });
        User.init({
            robloxId: DataTypes.STRING,
            xp: DataTypes.NUMBER,
            suspendedUntil: DataTypes.DATE,
            unsuspendRank: DataTypes.NUMBER,
        }, { sequelize: this.sql });
        this.sql.sync();
    }

    async findUser(robloxId: string): Promise<DatabaseUser> {
        const [ userData ] = await User.findOrCreate({ where: { robloxId }, defaults: { robloxId, xp: 0 } });
        return userData.toJSON();
    }

    async findSuspendedUsers(): Promise<User[]> {
        return await User.findAll({
            where: {
                suspendedUntil: { [Op.ne]: null }
            }
        });
    }

    async updateUser(robloxId: string, data: any) {
        await User.update(data, { where: { robloxId } });
    }
}

export { SQLiteProvider, User };