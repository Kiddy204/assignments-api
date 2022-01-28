import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { mongoose, Ref, ReturnModelType } from '@typegoose/typegoose';
import { LoggerService } from '../../../shared/services/logger/logger.service';
import { EncryptionService } from '../../../shared/services/encryption/encryption.service';
import { Types } from 'mongoose';

import { ReadStream } from 'fs';
import { User } from '../../../user/models/user';
import { UserRole } from '../../../user/models/user-role';

@Injectable()
export class UserDaoService {
  private ITEM_PER_PAGE = 50;

  constructor(
    @InjectModel(User)
    private readonly userModel: ReturnModelType<typeof User>,
    private readonly encryptionService: EncryptionService,
    private readonly logger: LoggerService,
  ) {
    // this.createSuperAdmin();
  }


  /**
   * Retrieve user Role
   * @param role : string  
   * @returns UserRole
   */
  getUserRole = (role: string): UserRole => {
    if (role === 'ADMIN') return UserRole.ADMIN;
    if (role === 'PARTNER') return UserRole.PARTNER;
    if (role === 'CUSTOMER') return UserRole.CUSTOMER;
  };

  /**
   *Add user to Dnb
   * @param password
   * @param role
   * @param email
   * @param phone
   */
  createUser = async (
    password: string,
    role: UserRole,
    email?: string,
    phone?: string,
  ): Promise<User> => {
    try {
      let userExiste: User;
      const user = new User();

      if (!email && !phone) {
        throw new Error(
          'No Email or Phone Number Provided when creating a User',
        );
      } else if (!phone) {
        userExiste = await this.findByEmail(email);
        user.login = email;
        user.email = email;
      } else if (!email) {
        userExiste = await this.findByPhone(phone);
        user.login = phone;
        user.phoneNumber = phone;
      } else {
        userExiste = await this.findByEmail(email);
        user.login = email;
        user.phoneNumber = phone;
        user.email = email;
      }

      if (userExiste) {
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      }

      user.password = this.encryptionService.encrypt(password);
      user.role = role;

      const now = new Date();

      const userInstance = new this.userModel(user);
      await userInstance.save();
      return userInstance;
    } catch (e) {
      const msg = `Exception adding user ${email}. ${e}`;
      this.logger.error(msg);
      throw e;
    }
  };



  /*
   * get a user by id
   * @params id User id
   * @returns User
   */

  findById = async (_id: mongoose.Types.ObjectId): Promise<User> => {
    try {
      return await this.userModel
        .findOne({ _id })
        .exec();
    } catch (e) {
      const msg = `Exception getting user with id ${_id}. ${e}`;
      this.logger.error(msg);
      throw e;
    }
  };

  /** 
   * Retrieve a user by Phone
   * @params Phone User phone
   * @returns User
   */
  findByPhone = async (phone: string): Promise<User> => {
    try {
      return await this.userModel
        .findOne({ phoneNumber: phone })
        .exec();
    } catch (e) {
      const msg = `Exception getting user with phone ${phone}. ${e}`;
      this.logger.error(msg);
      throw e;
    }
  };

  /*
   * get a user by email
   * @params email User email
   * @returns User
   */
  findByEmail = async (_email: string): Promise<User> => {
    try {
      const user = await this.userModel
        .findOne({ email: _email })
        .exec();
      return user;
    } catch (e) {
      const msg = `Exception getting user with email ${_email}. ${e}`;
      this.logger.error(msg);
      throw e;
    }
  };

  /**
   *
   * @param _emails
   */
  getUsesByEmails = async (_emails: string[]): Promise<User[]> => {
    try {
      return await this.userModel.find({ email: { $in: _emails } }).exec();
    } catch (e) {
      const msg = `Exception getting users with emails ${_emails}. ${e}`;
      this.logger.error(msg);
      throw e;
    }
  };

  /*
   * get all users
   * @params email User email
   * @returns User
   * @
   */
  getUsers = async (
    page: number,
    itemsPerPage: number = this.ITEM_PER_PAGE,
    params?: any,
    sort = 'asc',
    sortBy = 'login',
  ): Promise<User[]> => {
    try {
      if (sortBy === 'phone') {
        if (sort === 'asc') {
          return await this.userModel
            .find({ ...params })
            .skip(itemsPerPage * page - itemsPerPage)
            .limit(itemsPerPage)
            .sort({ phone: 1 })
            .exec();
        }
        return await this.userModel
          .find({ ...params })
          .skip(itemsPerPage * page - itemsPerPage)
          .limit(itemsPerPage)
          .sort({ phone: -1 })
          .exec();
      }
      return await this.userModel
        .find({ ...params })
        .skip(itemsPerPage * page - itemsPerPage)
        .limit(itemsPerPage)
        .sort({ login: sort })
        .exec();
    } catch (e) {
      const msg = `Exception getting users at page ${page} with ${itemsPerPage} items. ${e}`;
      this.logger.error(msg);
      throw e;
    }
  };

  /**
   *
   * @param ids
   */
  getByIDS = async (ids: Ref<User, Types.ObjectId>[]): Promise<User[]> => {
    try {
      return await this.userModel.find({ _id: { $in: ids } }).exec();
    } catch (e) {
      const msg = `Exception getting users with ids ${ids}. ${e}`;
      this.logger.error(msg);
      throw e;
    }
  };


  /*
   * Update an existing user
   * @params user User instance
   * @returns User
   */
  updateUser = async (user: User): Promise<User> => {
    try {
      return await this.userModel
        .findOneAndUpdate({ _id: user._id }, user, { new: true })
        .exec();
    } catch (e) {
      const msg = `Exception updating user ${user.login}. ${e}`;
      this.logger.error(msg);
      throw e;
    }
  };

  /**
   *
   * @param email
   * @param newPassword
   */
  updatePassword = async (
    email: string,
    newPassword: string,
  ): Promise<boolean> => {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);
      }
      user.password = this.encryptionService.encrypt(newPassword);
      await this.updateUser(user);
      return true;
    } catch (e) {
      throw e;
    }
  };

  /*
   * Delete an existing user
   * @params user User instance
   * @returns boolean
   */
  deleteUser = async (user: User) => {
    try {
      return await this.userModel.deleteOne({ login: user.login }, err => {
        if (err) {
          return err;
        }
        return true;
      });
    } catch (e) {
      const msg = `Exception deleting user ${user.email}. ${e}`;
      this.logger.error(msg);
      throw e;
    }
  };

  /*
   * Delete all users
   * @returns boolean
   */
  deleteAllUsers = async () => {
    try {
      return await this.userModel
        .deleteMany({}, err => {
          return err;
        })
        .then(err => {
          if (err) {
            return false;
          }
          return true;
        });
    } catch (e) {
      const msg = `Exception deleting users. ${e}`;
      this.logger.error(msg);
      throw e;
    }
  };

  /**
   *
   */
  createSuperAdmin = async (): Promise<void> => {
    try {
      const exists = await this.findByEmail('admin@arabexcellence.com');
      if (!exists) {
        await this.createUser(
          'admin',
          UserRole.ADMIN,
          'admin@arabexcellence.com',
        );
      }
    } catch (e) {
      throw e;
    }
  };

}
