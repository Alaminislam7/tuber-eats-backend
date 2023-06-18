import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { UserServices } from "./users.service";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";


@Resolver(of => User)
export class UsersResolver {
    constructor(private readonly userService : UserServices) {}
    @Query(returns => Boolean)
    hi() {
        return true;
    }

    @Mutation(returns => CreateAccountOutput)
    async createAccount(
      @Args('input') createAccountInput: CreateAccountInput,
    ): Promise<CreateAccountOutput> {
      return this.userService.createAccount(createAccountInput);
    }

    @Mutation(returns => LoginOutput)
    async login(@Args('input') loginInput: LoginInput): Promise <LoginOutput> {
      return this.userService.login(loginInput);
    }

    @Query(returns => User)
    me(@Context() context) {
      console.log(context);
    }

}