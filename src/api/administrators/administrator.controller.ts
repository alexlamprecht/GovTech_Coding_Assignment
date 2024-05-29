import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { AdministratorService } from './administrator.service';
import {
  CreateStudentRequest,
  CreateTeacherRequest,
  DeregisterStudentFromTeacherRequest,
  GetCommonStudentsRequest,
  RegisterStudentsToTeacherRequest,
} from './administrator.dto';
import { IsString } from 'class-validator';

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

  @Post('register')
  @HttpCode(204)
  async registerStudentsToTeacher(
    @Body() registerStudentsToTeacherData: RegisterStudentsToTeacherRequest,
  ) {
    return this.administratorService.registerStudents(
      registerStudentsToTeacherData,
    );
  }

  @Post('deregister')
  @HttpCode(200)
  async deregisterStudentsFromTeacher(
    @Body() registerStudentsToTeacherData: DeregisterStudentFromTeacherRequest,
  ) {
    return this.administratorService.deregisterStudents(
      registerStudentsToTeacherData,
    );
  }

  @Get('commonstudents')
  async getCommonStudents(@Query() data: GetCommonStudentsRequest) {
    return this.administratorService.getCommonStudents(data.teacher);
  }
}
