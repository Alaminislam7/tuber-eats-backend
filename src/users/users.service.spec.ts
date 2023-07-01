import { Test } from "@nestjs/testing";
import { UserServices } from './users.service';

describe('UserServices', () => {
    let service = UserServices;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [UserServices]
        }).compile();
        service = module.get<UserServices>(UserServices);
    })
    it('should be defined', () => {
        expect(service).toBeDefined();
    })

    it.todo('createAccount');
    it.todo('login');
    it.todo('findById');
    it.todo('editProfile');
    it.todo('verifyEmail');
})
