import { Body, Controller, Get, Post } from '@nestjs/common';
import { AdministratorService } from './administrator.service';
import {
  CreateStudentRequest,
  CreateTeacherRequest,
} from './administrator.dto';

@Controller()
export class AdministratorController {
  constructor(private readonly administratorService: AdministratorService) {}

  @Get('heartbeat')
  heartbeat(): string {
    return `Heartbeat: ${new Date().toISOString()}`;
  }

  @Post('students')
  async createStudent(@Body() createStudentData: CreateStudentRequest) {
    return this.administratorService.createStudent(createStudentData);
  }

  @Post('teachers')
  async createTeacher(@Body() createTeacherData: CreateTeacherRequest) {
    return this.administratorService.createTeacher(createTeacherData);
  }

  @Get('teachers')
  async getTeachers() {
    return this.administratorService.getTeachers();
  }
}
