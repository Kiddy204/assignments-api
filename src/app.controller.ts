import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { AssignmentsDaoService } from './assignments/services/assignments-dao.service';
import { AssignmentsService } from './assignments/services/assignments.service';
import { LoggerService } from './shared/services/logger/logger.service';
import { UserRole } from './user/models/user-role';
import { UserDaoService } from './user/services/user-dao/user-dao.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly assignmentsService : AssignmentsDaoService, 
    private readonly userService: UserDaoService,
    private readonly loggerService: LoggerService,
    ) {}

  @Get()
  getHello(): string {
    try {
      this.assignmentsService.createAssignment("English Assignment", "Final Assignment", new Date());
      this.userService.createUser("12345",UserRole.USER,"him@mail.com");
      return this.appService.getHello();
    }catch(e){
      this.loggerService.error(`Exception Creating User ${new Date()}`)
    }

  }

  @Post()
  createAssignment(): any{
    this.assignmentsService.createAssignment("English Assignment", "Final Assignment", new Date());

  }
}
