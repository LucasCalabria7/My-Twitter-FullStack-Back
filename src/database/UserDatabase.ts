import { UserDB } from "../interfaces/interfaces";
import { BaseDatabase } from "./BaseDatabase";

export class UserDatabase extends BaseDatabase {
    public static TABLE_USERS = "users";

    public create = async (userDB: UserDB) => {
        await BaseDatabase.connection(UserDatabase.TABLE_USERS).insert(userDB);
    };

    public findByEmail = async (email: string) => {
        const result: UserDB[] = await BaseDatabase.connection(
            UserDatabase.TABLE_USERS
        )
            .select()
            .where({ email });
        return result[0];
    };
}