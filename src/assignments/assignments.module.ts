import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { SharedModule } from 'src/shared/shared.module';
import { AssignmentsDaoService } from './services/assignments-dao.service';
import { AssignmentsService } from './services/assignments.service';

@Module({
  providers: [AssignmentsService, AssignmentsDaoService],
  exports :[AssignmentsService, AssignmentsDaoService],
  imports: [DatabaseModule, SharedModule]
})
export class AssignmentsModule {}
