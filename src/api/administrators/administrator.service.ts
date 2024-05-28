import { Injectable, Logger } from '@nestjs/common';
import { CreateStudentRequest } from './administrator.dto';
import { DynamoDbClient } from 'src/shared/dynamodb.client';

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
      return {
        message: `Error creating student: ${error.message}`,
      };
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
      return {
        message: `Error creating teacher: ${error.message}`,
      };
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
      return {
        message: `Error retrieving teachers: ${error.message}`,
      };
    }
  }
}
