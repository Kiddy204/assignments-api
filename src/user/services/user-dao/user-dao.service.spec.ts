import { Test, TestingModule } from '@nestjs/testing';
import { UserDaoService } from './user-dao.service';
import { UserModule } from '../../user.module';
import { MongoTestMemoryModule } from '../../../../test/db-test.module'
import { SharedModule } from '../../../shared/shared.module';
import { DatabaseModule } from '../../../database/database.module';
import { EncryptionService } from '../../../shared/services/encryption/encryption.service';
import { UserRole } from '../../models/user-role';

describe('UserDaoService', () => {
  let service: UserDaoService;
  let encryptionService: EncryptionService;
  const email = 'johndoe@gmail.com';
  const phone = '66666666';
  const cptr = 0;
  const password = 'passw00rd';

  const userFromFacebook = {
    emails: [{ value: 'johndoe@facebook.com' }],
    login: 'johndoe@facebook.com',
    id: '00000000000000000000',
  };
  const userFromGoogle = {
    emails: [{ value: 'johndoe@google.com' }],
    login: 'johndoe@google.com',
    id: '00000000000000000000',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule,
        SharedModule,
        await MongoTestMemoryModule(),
        DatabaseModule,
      ],
    }).compile();

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;
    service = module.get<UserDaoService>(UserDaoService);
    encryptionService = module.get<EncryptionService>(EncryptionService);
  });

  afterEach(async () => {
    await service.deleteAllUsers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create three new users ', async () => {
      await service.createUser(password, UserRole.ADMIN, email, phone);
      await service.createUser(password, UserRole.ADMIN, `1${email}`);
      await service.createUser(password, UserRole.ADMIN, null, `00${phone}`);
      const searchUser1 = await service.findByEmail(email);
      const searchUser2 = await service.findByEmail(`1${email}`);
      const searchUser3 = await service.findByPhone(`00${phone}`);
      expect(searchUser1).toBeDefined();
      expect(searchUser1.email).toEqual(email);
      expect(searchUser1.login).toEqual(email);
      expect(searchUser1.phoneNumber).toEqual(phone);
      expect(encryptionService.decrypt(searchUser1.password)).toEqual(password);
      expect(searchUser2).toBeDefined();
      expect(searchUser2.phoneNumber).toBeUndefined();
      expect(searchUser2.login).toEqual(`1${email}`);
      expect(encryptionService.decrypt(searchUser2.password)).toEqual(password);
      expect(searchUser3).toBeDefined();
      expect(searchUser3.login).toEqual(`00${phone}`);
      expect(searchUser3.email).toBeUndefined();
      expect(searchUser3.phoneNumber).toEqual(`00${phone}`);
      expect(encryptionService.decrypt(searchUser3.password)).toEqual(password);
    });
  });


  describe('findById', () => {
    it('should return a user given a user id', async () => {
      const user = await service.createUser(
        password,
        UserRole.ADMIN,
        cptr.toString().concat(email),
      );
      const searchUser = await service.findById(user._id);
      expect(searchUser).toBeDefined();
      expect(searchUser._id).toEqual(user._id);
    });
  });

  describe('findByEmail', () => {
    it('should return a user given a user email', async () => {
      const user = await service.createUser(
        password,
        UserRole.ADMIN,
        cptr.toString().concat(email),
      );
      const searchUser = await service.findByEmail(user.email);
      expect(searchUser).toBeDefined();
      expect(searchUser._id).toEqual(user._id);
      expect(searchUser.email).toEqual(user.email);
      expect(searchUser.password).toEqual(user.password);
    });
  });

  describe('getUsers', () => {
    it('should get all users sorted By Login In Asc direction given pagination', async () => {
      const mail = '@gmail.com';

      for (let i = 0; i < 8; i++) {
        await service.createUser(
          password,
          UserRole.ADMIN,
          `${i}samuel`.concat(mail),
        );
      }

      const usersList1 = await service.getUsers(1, 4);
      const usersList2 = await service.getUsers(2, 4);
      const usersList3 = await service.getUsers(3, 10);
      expect(usersList1.length).toEqual(4);
      expect(usersList2.length).toEqual(4);
      expect(usersList3.length).toEqual(0);
      for (let i = 0; i < 4; i++) {
        expect(usersList1[i].email).toEqual(`${i}samuel`.concat(mail));
        expect(usersList2[i].email).toEqual(`${4 + i}samuel`.concat(mail));
      }
    });
    it('should get all users sorted By phone number In Desc direction given pagination', async () => {
      const mail = '@gmail.com';

      for (let i = 0; i < 8; i++) {
        await service.createUser(
          password,
          UserRole.ADMIN,
          null,
          `000${i}${phone}`,
        );
      }

      const usersList1 = await service.getUsers(1, 4);
      const usersList2 = await service.getUsers(2, 4);
      const usersList3 = await service.getUsers(3, 10);
      expect(usersList1.length).toEqual(4);
      expect(usersList2.length).toEqual(4);
      expect(usersList3.length).toEqual(0);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updatedMail = 'updatedemail@mail.com';
      const user = await service.createUser(
        password,
        UserRole.ADMIN,
        cptr.toString().concat(email),
      );
      user.email = updatedMail;
      const updatedUser = await service.updateUser(user);
      expect(updatedUser._id).toEqual(user._id);
      expect(updatedUser.email).toEqual(updatedMail);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const selectedEmail = 'selectedemail@mail.com';
      const user = await service.createUser(
        password,
        UserRole.ADMIN,
        selectedEmail,
      );
      //const selectedUser = await service.findByEmail(selectedEmail);
      expect(user._id).toBeDefined();
      await service.deleteUser(user);
      const deletedUser = await service.findByEmail(selectedEmail);
      expect(deletedUser).toBeNull();
    });
  });

  describe('deleteAllUsers', () => {
    it('should delete all users', async () => {
      const mail = '@gmail.com';

      for (let i = 0; i < 50; i++) {
        await service.createUser(
          password,
          UserRole.ADMIN,
          i.toString().concat(mail),
        );
      }

      let usersList1 = await service.getUsers(1, 25);
      let usersList2 = await service.getUsers(2, 25);
      let usersList3 = await service.getUsers(3, 25);
      expect(usersList1.length).toEqual(25);
      expect(usersList2.length).toEqual(25);
      expect(usersList3.length).toEqual(0);
      await service.deleteAllUsers();
      usersList1 = await service.getUsers(1, 25);
      usersList2 = await service.getUsers(2, 25);
      usersList3 = await service.getUsers(3, 25);
      expect(usersList1.length).toEqual(0);
    });
  });
});
