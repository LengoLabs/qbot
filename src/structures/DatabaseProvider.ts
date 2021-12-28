abstract class DatabaseProvider {
    abstract findUser(query: any);
    abstract findSuspendedUsers();
    abstract updateUser(query: any, data: any);
}

export { DatabaseProvider };