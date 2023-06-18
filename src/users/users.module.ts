import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersResolver } from './users.resolver';
import { UserServices } from './users.service';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UsersResolver, UserServices],
    exports: [UserServices]
})
export class UsersModule {}
