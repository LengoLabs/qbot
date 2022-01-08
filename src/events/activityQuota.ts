import { DatabaseUser } from '../structures/types';
import { provider } from '../database/router';
import { robloxGroup } from '../main';
import { config } from '../config';

const checkQuota = async () => {
    const users = await provider.findUser()
}