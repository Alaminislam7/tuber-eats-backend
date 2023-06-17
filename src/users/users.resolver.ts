import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { User } from "./entities/user.entity";
import { UserServices } from "./users.service";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";


@Resolver(of => User)
export class UsersResolver {
    constructor(private readonly userService : UserServices) {}
    @Query(returns => Boolean)
    hi() {
        return true;
    }
    @Mutation(returns => CreateAccountOutput)
    createAccount(@Args("input") createAccount: CreateAccountInput ) {}

}