import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserServices {
    constructor(@InjectRepository(User) private readonly users: Repository<User>
    ) {}
}