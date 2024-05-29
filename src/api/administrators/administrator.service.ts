import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  CreateStudentRequest,
  DeregisterStudentFromTeacherRequest,
  RegisterStudentsToTeacherRequest,
} from './administrator.dto';
import { DynamoDbClient } from 'src/shared/dynamodb.client';
('@aws-sdk/client-dynamodb');

@Injectable()
export class AdministratorService {
  private readonly logger = new Logger(AdministratorService.name);

  constructor(private readonly dbClient: DynamoDbClient) {
    this.dbClient = dbClient;
  }

  async createStudent(createStudentData: CreateStudentRequest): Promise<any> {
    const params = {
      TableName: 'Students',
      Item: {
        name: createStudentData.name,
        email: createStudentData.email,
      },
    };

    try {
      const result = await this.dbClient.addItem(params);
      return {
        message: 'Student created successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Error creating student: ${error.message}`);
      throw new HttpException(
        'Unable to create student',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createTeacher(createStudentData: CreateStudentRequest): Promise<any> {
    const params = {
      TableName: 'Teachers',
      Item: {
        name: createStudentData.name,
        email: createStudentData.email,
      },
    };

    try {
      const result = await this.dbClient.addItem(params);
      return {
        message: 'Teacher created successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Error creating teacher: ${error.message}`);
      throw new HttpException(
        'Unable to create teacher',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTeachers(): Promise<any> {
    try {
      const result = await this.dbClient.getAllItems({
        TableName: 'Teachers',
      });

      return {
        message: 'Teachers retrieved successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Error getting teachers: ${error.message}`);
      throw new HttpException(
        'Unable to get teachers',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async registerStudents({
    teacher: teacherEmail,
    students: studentEmails,
  }: RegisterStudentsToTeacherRequest): Promise<any> {
    try {
      // check if the teacher exists

      const teacher = await this.dbClient.getItem({
        TableName: 'Teachers',
        Key: {
          email: teacherEmail,
        },
      });

      if (!teacher.Item) {
        throw new Error('Teacher does not exist');
      }

      //check if all students exist
      for (const studentEmail of studentEmails) {
        const studentData = await this.dbClient.getItem({
          TableName: 'Students',
          Key: {
            email: studentEmail,
          },
        });

        if (!studentData.Item) {
          throw new Error(`Student ${studentEmail} does not exist`);
        }
      }

      // register students to teacher
      await this.dbClient.addItems({
        TransactItems: studentEmails.map((studentEmail) => ({
          Put: {
            TableName: 'Registrations',
            Item: {
              teacherEmail: { S: teacherEmail },
              studentEmail: { S: studentEmail },
            },
          },
        })),
      });
    } catch (error) {
      this.logger.error(`Error registering students: ${error.message}`);
      throw new HttpException(
        'Unable to register students to teacher',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deregisterStudents({
    teacher: teacherEmail,
    student: studentEmail,
  }: DeregisterStudentFromTeacherRequest): Promise<any> {
    try {
      // check if the teacher exists
      const teacher = await this.dbClient.getItem({
        TableName: 'Teachers',
        Key: {
          email: teacherEmail,
        },
      });

      if (!teacher.Item) {
        throw new Error('Teacher does not exist');
      }

      //check if student exists
      const studentData = await this.dbClient.getItem({
        TableName: 'Students',
        Key: {
          email: studentEmail,
        },
      });

      if (!studentData.Item) {
        throw new Error(`Student ${studentEmail} does not exist`);
      }

      // deregister students from teacher
      await this.dbClient.deleteItem({
        TableName: 'Registrations',
        Key: {
          teacherEmail: teacherEmail,
          studentEmail: studentEmail,
        },
      });

      this.logger.log(
        `successfully deregistered student ${studentEmail} from teacher ${teacherEmail}`,
      );
    } catch (error) {
      this.logger.error(`Error deregistering student: ${error.message}`);
      return {
        message: `Unable to deregister student from teacher`,
      };
    }
  }
}
