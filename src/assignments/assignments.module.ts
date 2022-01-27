import { Module } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';

@Module({
  providers: [AssignmentsService]
})
export class AssignmentsModule {}
