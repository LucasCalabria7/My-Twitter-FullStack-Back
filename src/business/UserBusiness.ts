import { UserDatabase } from "../database/UserDatabase";
import { LoginInputDTO, LoginOutputDTO, SignupInputDTO, SignupOutputDTO } from "../DTOs/DTOs";
import { TokenPayload, UserDB, ROLES } from "../interfaces/interfaces";
import { User } from "../models/User";
import { HashManager } from "../services/HashManager";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";

export class UserBusiness {
    constructor(
        private userDataBase: UserDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager,
        private hashManager: HashManager
    ) { }
    public signup = async (input: SignupInputDTO) => {
        const { name, email, password } = input;

        if (typeof name !== "string") {
            throw new Error("Name should be a string");
        }

        if (typeof email !== "string") {
            throw new Error("Email should be a string");
        }

        if (typeof password !== "string") {
            throw new Error("Password must be a string");
        }

        const id = this.idGenerator.generate();
        const hashedPassword = await this.hashManager.hash(password);
        const newUser = new User(
            id,
            name,
            email,
            hashedPassword,
            ROLES.USER,
            new Date().toISOString()
        );
        const userDB = newUser.toDBModel();

        await this.userDataBase.create(userDB);

        const payload: TokenPayload = {
            id: newUser.getId(),
            name: newUser.getName(),
            role: newUser.getRole(),
        };

        const token = this.tokenManager.createToken(payload);

        const output: SignupOutputDTO = {
            token,
        };
        return output;
    };
    public login = async (input: LoginInputDTO) => {
        const { email, password } = input;

        if (typeof email !== "string") {
            throw new Error("Email should be a string");
        }

        if (typeof password !== "string") {
            throw new Error("Password should be a string");
        }

        const userDB: UserDB | undefined = await this.userDataBase.findByEmail(email);

        if (!userDB) {
            throw new Error("Email not found");
        }

        const user = new User(
            userDB.id,
            userDB.name,
            userDB.email,
            userDB.password,
            userDB.role,
            userDB.created_at
        );

        const isPasswordCorrect = await this.hashManager.compare(
            password,
            user.getPassword()
        );

        if (!isPasswordCorrect) {
            throw new Error("'password' incorreto");
        }

        const payload: TokenPayload = {
            id: user.getId(),
            name: user.getName(),
            role: user.getRole(),
        };
        const token = this.tokenManager.createToken(payload);
        const output: LoginOutputDTO = {
            token,
        };
        return output;
    };
}