import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersResolver } from './users.resolver';
import { UserServices } from './users.service';
import { Verification } from './entities/verification.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Verification])],
    providers: [UsersResolver, UserServices],
    exports: [UserServices]
})
export class UsersModule {}
