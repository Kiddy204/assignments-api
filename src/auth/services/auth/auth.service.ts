import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserDaoService } from '../../../user/services/user-dao/user-dao.service';
import { LoggerService } from '../../../shared/services/logger/logger.service';
import { User, LoginType } from '../../../user/models/user';
import { EncryptionService } from '../../../shared/services/encryption/encryption.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../models/jwt-payload';
import { IncomingHttpHeaders } from 'http';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { EmailVerificationModel, ForgottenPasswordModel } from '../../models';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(EmailVerificationModel)
    private readonly emailVerificationModel: ReturnModelType<
      typeof EmailVerificationModel
    >,
    @InjectModel(ForgottenPasswordModel)
    private readonly forgottenPasswordModel: ReturnModelType<
      typeof ForgottenPasswordModel
    >,
    private readonly userDaoService: UserDaoService,
    private readonly encryptionService: EncryptionService,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
  ) {}

  validateUserByEmail = async (
    email: string,
    password: string,
  ): Promise<User> => {
    try {
      const user = await this.userDaoService.findByEmail(email);
      if (!user) {
        throw new Error(`No user with email ${email} exists`);
      }
      if (password != this.encryptionService.decrypt(user.password)) {
        throw new Error(`Wrong user password`);
      }
      return user;
    } catch (e) {
      this.logger.error(`Exception validating user ${email}. ${e}`);
      return null;
    }
  };

  validateUserByPhone = async (
    phone: string,
    password: string,
  ): Promise<User> => {
    try {
      const user = await this.userDaoService.getUserByPhone(phone);
      if (!user) {
        throw new Error(`No user with phone ${phone} exists`);
      }
      if (password != this.encryptionService.decrypt(user.password)) {
        throw new Error(`Wrong user password`);
      }
      return user;
    } catch (e) {
      const msg = `Exception validating user ${phone}. ${e}`;
      this.logger.error(msg);
      throw new Error(msg);
    }
  };

  signInUserWithEmail = async (email: string): Promise<JwtPayload> => {
    try {
      const expiresIn = 60 * 60 * 48;
      const user = await this.userDaoService.findByEmail(email);
      const payload = {
        login: user.email,
        id: user._id.toString(),
        role: user.role,
        type: LoginType.EMAIL,
      };
      const token = this.jwtService.sign(payload, { expiresIn });
      return {
        user,
        token,
        expiresIn,
      };
    } catch (e) {
      this.logger.error(`Exception signing in user with email ${email}. ${e}`);
      return undefined;
    }
  };

  signInUserWithPhone = async (phone: string): Promise<JwtPayload> => {
    try {
      const expiresIn = 60 * 60 * 48;
      const user = await this.userDaoService.findByPhone(phone);
      const payload = {
        login: user.email,
        id: user._id.toString(),
        role: user.role,
        type: LoginType.EMAIL,
      };
      const token = this.jwtService.sign(payload, { expiresIn });
      return {
        expiresIn,
        token,
        user,
      };
    } catch (e) {
      this.logger.error(`Exception signing in user with phone ${phone}. ${e}`);
      return undefined;
    }
  };

  getTokenFromHeaders = (headers: IncomingHttpHeaders): string => {
    if (!headers || !headers.authorization) return '';
    return headers.authorization.substring(7);
  };

  validateToken = (token: string): any => {
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      return e.name;
    }
  };

  signInOrCreateBySocialProvider = async (
    userCreateInput: unknown,
    provider: string,
  ): Promise<any> => {
    try {
      let action = 'login';

      let user = await this.userDaoService.getUserBySocial(
        userCreateInput,
        provider,
      );
      if (!user) {
        user = await this.userDaoService.createBySocialProvider(
          userCreateInput,
          provider,
        );
        action = 'register';
      }

      const expiresIn = 60 * 60 * 48;
      const payload = {
        login: user.email,
        id: user._id.toString(),
        role: user.role,
      };
      const token = this.jwtService.sign(payload, { expiresIn });

      return {
        user: {
          isVerified: true,
          _id: user._id,
          login: user.login,
          email: user.email,
          role: user.role,
          // verificationKey: ???
        },
        token,
        expiresIn,
        action,
      };
    } catch (error) {
      throw error;
    }
  };

  getEmailTokenByEmail = async (
    email: string,
  ): Promise<EmailVerificationModel> => {
    try {
      return await this.emailVerificationModel.findOne({ email }).exec();
    } catch (e) {
      const msg = `Exception getting emailToken with email ${email}. ${e}`;
      this.logger.error(msg);
      throw e;
    }
  };

  createEmailToken = async (email: string): Promise<EmailVerificationModel> => {
    try {
      const emailVerification = await this.emailVerificationModel.findOne({
        email,
      });
      if (
        emailVerification &&
        (new Date().getTime() - emailVerification.createdAt.getTime()) / 60000 <
          15
      ) {
        throw new Error('LOGIN.EMAIL_SENDED_RECENTLY');
      } else {
        const now = new Date();
        const emailToken = this.encryptionService
          .slugify(this.encryptionService.encrypt(`${email}-${now}`))
          .toString()
          .substr(0, 30);

        const emailVerifyOld = await this.emailVerificationModel.findOne({
          email,
        });
        if (emailVerifyOld) {
          const emailVerificationUpdated = await this.emailVerificationModel.findOneAndUpdate(
            { email },
            {
              email: email,
              emailToken,
            },
            { upsert: true },
          );
          if (emailVerificationUpdated) {
            return emailVerificationUpdated;
          } else {
            throw new Error('Verify by email, token not created or updated!');
          }
        } else {
          const emailVerify = new EmailVerificationModel();
          emailVerify.email = email;
          emailVerify.emailToken = emailToken;
          const newEmailVerify = new this.emailVerificationModel(emailVerify);
          await newEmailVerify.save();
        }
      }
    } catch (e) {
      this.logger.error(`Exception create email token for ${email}. ${e}`);
      throw e;
    }
  };



  getForgettenPasswordTokenByEmail = async (
    email: string,
  ): Promise<ForgottenPasswordModel> => {
    try {
      return await this.forgottenPasswordModel.findOne({ email }).exec();
    } catch (e) {
      const msg = `Exception getting emailToken with email ${email}. ${e}`;
      this.logger.error(msg);
      throw e;
    }
  };

  getForgettenPasswordTokenByToken = async (
    newPasswordToken: string,
  ): Promise<ForgottenPasswordModel> => {
    try {
      return await this.forgottenPasswordModel
        .findOne({ newPasswordToken })
        .exec();
    } catch (e) {
      const msg = `Exception getting forgetten password Token with token  ${newPasswordToken}. ${e}`;
      this.logger.error(msg);
      throw e;
    }
  };

  createForgottenPasswordToken = async (
    email: string,
  ): Promise<ForgottenPasswordModel> => {
    try {
      const forgottenPassword = await this.getForgettenPasswordTokenByEmail(
        email,
      );
      if (
        forgottenPassword &&
        (new Date().getTime() - forgottenPassword.createdAt.getTime()) / 60000 <
          15
      ) {
        throw new Error('RESET_PASSWORD.EMAIL_SENDED_RECENTLY');
      } else {
        const now = new Date();
        const newPasswordToken = this.encryptionService
          .slugify(this.encryptionService.encrypt(`${email}-${now}`))
          .toString()
          .substr(0, 30);
        const forgottenPassword = await this.forgottenPasswordModel.findOneAndUpdate(
          { email },
          {
            email,
            newPasswordToken,
          },
          {
            upsert: true,
            new: true,
          },
        );
        if (forgottenPassword) {
          return forgottenPassword;
        } else {
          throw new Error('Forget password token not created or updated!');
        }
      }
    } catch (e) {
      throw e;
    }
  };

  

  checkPassword = async (email: string, password: string): Promise<boolean> => {
    try {
      const user = await this.userDaoService.findByEmail(email);
      if (!user) throw new Error('LOGIN.USER_NOT_FOUND');
      return await bcrypt.compare(password, user.password);
    } catch (e) {
      throw e;
    }
  };
}
