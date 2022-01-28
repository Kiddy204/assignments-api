import { Module } from '@nestjs/common';
import { AuthService } from './services/auth/auth.service';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { SharedModule } from '../shared/shared.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { PhoneAuthService } from './services/phone-auth/phone-auth.service';
import { TypegooseModule } from 'nestjs-typegoose';
import { PhoneVerification } from './models/phone-verification';
import { InvitationService } from './services/invitation/invitation.service';
import { Invitation } from './models/invitation';
import { ActivateService } from './services/activate/activate.service';
import { MailModule } from '../mail/mail.module';
import { RoleGuard } from './guards/role.guard';
import { FacebookStrategy } from './facebook.strategy';
import { GoogleStrategy } from './google.strategy';
import { AuthController } from './auth.controller';
import JwtAuthGuard from './guards/jwt-auth.guard';
import { JwtAuthGplGuard } from './guards/jwt-auth-gpl.guard';
import { DatabaseModule } from '../database/database.module';

@Module({
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    FacebookStrategy,
    GoogleStrategy,
    PhoneAuthService,
    InvitationService,
    ActivateService,
    RoleGuard,
    JwtAuthGuard,
    JwtAuthGplGuard,
  ],
  imports: [
    DatabaseModule,
    UserModule,
    PassportModule,
    SharedModule,
    MailModule,
    TypegooseModule.forFeature([PhoneVerification]),
    TypegooseModule.forFeature([Invitation]),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('ENCRYPTION_KEY'),
          signOptions: { expiresIn: '120s' },
        };
      },
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
  ],
  exports: [AuthService, RoleGuard, JwtAuthGuard, JwtAuthGplGuard],
  controllers: [AuthController],
})
export class AuthModule {}
