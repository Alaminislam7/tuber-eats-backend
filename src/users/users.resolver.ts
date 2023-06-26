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
import { VerifyEmailInput, VerifyEmailOutPut } from "./dtos/verify-email.dto";


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
    @UseGuards(AuthGuard)
    me(@AuthUser() authUser: User) {
      return authUser;
    }

    @UseGuards(AuthGuard)
    @Query(returns => UserProfileOutput)
    async userProfile(
      @Args() userProfileInput: UserProfileInput,
    ) : Promise<UserProfileOutput> {
      try {
        const user = await this.userService.findById(userProfileInput.userId);
        if(!user) {
          throw Error();
        }
        return {
          ok: true,
          user,
        };
      } catch (err) {
        return {
          ok: false,
          error: "User Not Found",
        }
      }
    }

    @UseGuards(AuthGuard)
    @Mutation(returns => EditProfileOutput)
    async editProfile(
      @AuthUser() authUser: User,
      @Args('input') editProfileInput: EditProfileInput,
    ): Promise<EditProfileOutput> {
      return this.userService.editProfile(authUser.id, editProfileInput);
    }

    @Mutation(returns => VerifyEmailOutPut)
    verifyEmail(
      @Args('input') { code }: VerifyEmailInput,
    ) {
      this.userService.verifyEmail(code);
    }

}