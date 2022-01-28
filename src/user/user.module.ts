import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { SharedModule } from 'src/shared/shared.module';
import { UserDaoService } from './services/user-dao/user-dao.service';

@Module({
    providers: [UserDaoService],
    exports :[UserDaoService],
    imports: [DatabaseModule, SharedModule]
})
export class UserModule {}
