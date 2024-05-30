import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { AdministratorService } from './administrator.service';
import {
  CreateStudentRequest,
  CreateTeacherRequest,
  DeregisterStudentFromTeacherRequest,
  GetAllTeachersWithStudentsResponse,
  GetCommonStudentsRequest,
  GetCommonStudentsResponse,
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
  async createStudent(
    @Body() createStudentData: CreateStudentRequest,
  ): Promise<void> {
    return await this.administratorService.createStudent(createStudentData);
  }

  @Post('teachers')
  async createTeacher(
    @Body() createTeacherData: CreateTeacherRequest,
  ): Promise<void> {
    await this.administratorService.createTeacher(createTeacherData);
  }

  @Get('teachers')
  async getAllTeachersWithStudents(): Promise<GetAllTeachersWithStudentsResponse> {
    return await this.administratorService.getAllTeachersWithStudents();
  }

  @Post('register')
  @HttpCode(204)
  async registerStudentsToTeacher(
    @Body() registerStudentsToTeacherData: RegisterStudentsToTeacherRequest,
  ): Promise<void> {
    await this.administratorService.registerStudents(
      registerStudentsToTeacherData,
    );
  }

  @Post('deregister')
  @HttpCode(200)
  async deregisterStudentsFromTeacher(
    @Body() registerStudentsToTeacherData: DeregisterStudentFromTeacherRequest,
  ): Promise<void> {
    await this.administratorService.deregisterStudents(
      registerStudentsToTeacherData,
    );
  }

  @Get('commonstudents')
  async getCommonStudents(
    @Query() data: GetCommonStudentsRequest,
  ): Promise<GetCommonStudentsResponse> {
    return await this.administratorService.getCommonStudents(data.teacher);
  }
}
