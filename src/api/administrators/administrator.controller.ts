import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { AdministratorService } from './administrator.service';
import {
  CreateStudentRequest,
  CreateTeacherRequest,
  DeregisterStudentFromTeacherRequest,
  GetCommonStudentsRequest,
  RegisterStudentsToTeacherRequest,
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
    return await this.administratorService.createStudent(createStudentData);
  }

  @Post('teachers')
  async createTeacher(@Body() createTeacherData: CreateTeacherRequest) {
    return await this.administratorService.createTeacher(createTeacherData);
  }

  // @Get('teachers')
  // async getAllTeachers() {
  //   return await this.administratorService.getAllTeachers();
  // }

  @Get('teachers')
  async getAllTeachersWithStudents() {
    return await this.administratorService.getAllTeachersWithStudents();
  }

  @Post('register')
  @HttpCode(204)
  async registerStudentsToTeacher(
    @Body() registerStudentsToTeacherData: RegisterStudentsToTeacherRequest,
  ) {
    return await this.administratorService.registerStudents(
      registerStudentsToTeacherData,
    );
  }

  @Post('deregister')
  @HttpCode(200)
  async deregisterStudentsFromTeacher(
    @Body() registerStudentsToTeacherData: DeregisterStudentFromTeacherRequest,
  ) {
    return await this.administratorService.deregisterStudents(
      registerStudentsToTeacherData,
    );
  }

  @Get('commonstudents')
  async getCommonStudents(@Query() data: GetCommonStudentsRequest) {
    return await this.administratorService.getCommonStudents(data.teacher);
  }
}
