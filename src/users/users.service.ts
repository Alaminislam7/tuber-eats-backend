import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";

@Injectable()
export class UserServices {
    constructor(@InjectRepository(User) private readonly users: Repository<User>
    ) {}

    async createAccount({
        email,
        password,
        role,
      }: CreateAccountInput): Promise<{ok: boolean; error?: string}> {
        try {
            const exists = await this.users.findOne({ where: {email} });
            if(exists) {
                return { ok: false, error: "User already exists" }
            }
            await this.users.save(this.users.create({ email,password,role }));
            return { ok: true };
        } catch (e) {
            return {ok: false, error: "Couldn't create account"};
        }
    }
}