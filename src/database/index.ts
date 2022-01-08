import { DatabaseProvider } from '../structures/DatabaseProvider';
import { MongoDBProvider } from './mongodb';
import { config } from '../config';

let provider = new MongoDBProvider();

export { provider };