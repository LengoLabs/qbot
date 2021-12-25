import { DatabaseUser } from '../structures/types';
import { User } from '../database/sqlite';
import { provider } from '../database/router';

const checkSuspensions = async () => {
    const suspensions = await provider.findSuspendedUsers();
    suspensions.forEach((suspension) => {
        if(suspension.suspendedUntil.getTime() < new Date().getTime()) console.log('yo')
    });
}

export { checkSuspensions };