import { Sequelize, Model, DataTypes } from 'sequelize';
import { config } from '../config';

class User extends Model {};

class SQLiteProvider {
    sql: Sequelize;

    constructor() {
        this.sql = new Sequelize('./sql/data.sql');
        User.init({
            discordId: DataTypes.STRING,
            xp: DataTypes.NUMBER,
            suspendedUntil: DataTypes.DATE,
        }, { sequelize: this.sql });
    }

    async findUser(discordId: string) {
        return await User.findOrCreate({ where: { discordId }, defaults: { discordId, xp: 0 } });
    }

    async updateUser(discordId: string, data: any) {
        return await User.update(data, { where: { discordId } });
    }
}

export { SQLiteProvider };