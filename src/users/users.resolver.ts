import { UseGuards } from "@nestjs/common";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { UserServices } from "./users.service";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AuthGuard } from "src/auth/auth.guard";
import { AuthUser } from "src/auth/auth-user.decorator";
import { UserProfileInput, UserProfileOutput } from "./dtos/user-profile.dto";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { VerifyEmailInput, VerifyEmailOutPut } from './dtos/verify-email.dto';
import { Role } from "src/auth/role.decorator";


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
    @Role(['Any'])
    me(@AuthUser() authUser: User) {
      return authUser;
    }

    @Query(returns => UserProfileOutput)
    @Role(['Any'])
    async userProfile(
      @Args() userProfileInput: UserProfileInput,
    ): Promise<UserProfileOutput> {
      return this.userService.findById(userProfileInput.userId);
    }

    @Mutation(returns => EditProfileOutput)
    @Role(['Any'])
    async editProfile(
      @AuthUser() authUser: User,
      @Args('input') editProfileInput: EditProfileInput,
    ): Promise<EditProfileOutput> {
      return this.userService.editProfile(authUser.id, editProfileInput);
    }

    @Mutation(returns => VerifyEmailOutPut)
    verifyEmail(
      @Args('input') { code }: VerifyEmailInput,
    ): Promise<VerifyEmailOutPut> {
      return this.userService.verifyEmail(code);
    }

}