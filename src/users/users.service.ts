import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { JwtService } from "src/jwt/jwt.service";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { Verification } from "./entities/verification.entity";
import { VerifyEmailOutPut } from "./dtos/verify-email.dto";

@Injectable()
export class UserServices {
    constructor(
      @InjectRepository(User) private readonly users: Repository<User>,
      @InjectRepository(Verification) private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
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
            const user = await this.users.save(this.users.create({ email,password,role }));
            await this.verifications.save(
              this.verifications.create({user})
            )
            return { ok: true };
        } catch (e) {
            return {ok: false, error: "Couldn't create account"};
        }
    }

    async login({email, password}: LoginInput):
    Promise<LoginOutput> {
        try {
            const user = await this.users.findOne({ 
                where: {email}, 
                select: ['id', 'password'] 
            });
            if(!user) {
                return {
                    ok: false,
                    error: 'User not found'
                }
            }
            const passwordCorrect = await user.checkPassword(password);
            if (!passwordCorrect) {
                return {
                  ok: false,
                  error: 'Wrong password',
                };
              }
            const token = this.jwtService.sign(user.id);
            return {
                ok: true,
                token
            }
        } catch (error) {
            return {
                ok: false,
                error: "Can't log user in.",
              };
        }
    }

    async findById (id: number): Promise<User> {
        return this.users.findOne({ where: {id}});
    }

    async editProfile(
        userId: any,

        
        // userId: number,



        { email, password }: EditProfileInput,
      ): Promise<EditProfileOutput> {
        try {
            
          const user = await this.users.findOneBy(userId);
          if (email) {
            user.email = email;
            user.verified = false;
            await this.verifications.save(this.verifications.create({user}));
          }
          if (password) {
            user.password = password;
          }
          await this.users.save(user);
          
          return {
            ok: true,
          };
        } catch (error) {
          return { ok: false, error: 'Could not update profile.' };
        }
      }

      async verifyEmail(code: string): Promise<boolean> {
        const verification = await this.verifications.findOne({ 
          where: {code}, relations: ['user'],
        });
          if(verification) {
            console.log(verification, verification.user.verified)
          }
          return false;
      }

}











