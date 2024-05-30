import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  CreateStudentRequest,
  DeregisterStudentFromTeacherRequest,
  RegisterStudentsToTeacherRequest,
  GetAllTeachersWithStudentsResponse,
  GetCommonStudentsResponse,
} from './administrator.dto';
import { DynamoDbClient } from '../../shared/dynamodb.client';
import { AttributeValue } from '@aws-sdk/client-dynamodb';

('@aws-sdk/client-dynamodb');

@Injectable()
export class AdministratorService {
  private readonly logger = new Logger(AdministratorService.name);

  constructor(private readonly dbClient: DynamoDbClient) {
    this.dbClient = dbClient;
  }

  /**
   * Creates a new student record.
   *
   * @param createStudentData - The data required to create a student.
   * @returns A promise that resolves to void.
   * @throws {HttpException} If there is an error creating the student.
   */
  async createStudent(createStudentData: CreateStudentRequest): Promise<void> {
    const params = {
      TableName: 'Students',
      Item: {
        name: createStudentData.name,
        email: createStudentData.email,
      },
    };

    try {
      await this.dbClient.addItem(params);
    } catch (error) {
      this.logger.error(`Error creating student: ${error.message}`);
      throw new HttpException(
        'Unable to create student',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Creates a new teacher.
   * @param createStudentData - The data for creating the teacher.
   * @returns A promise that resolves to void.
   * @throws {HttpException} If there is an error creating the teacher.
   */
  async createTeacher(createStudentData: CreateStudentRequest): Promise<void> {
    const params = {
      TableName: 'Teachers',
      Item: {
        name: createStudentData.name,
        email: createStudentData.email,
      },
    };

    try {
      await this.dbClient.addItem(params);
    } catch (error) {
      this.logger.error(`Error creating teacher: ${error.message}`);
      throw new HttpException(
        'Unable to create teacher',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Registers students to a teacher.
   *
   * @param {RegisterStudentsToTeacherRequest} request - The request object containing the teacher's email and the list of student emails.
   * @returns {Promise<void>} - A promise that resolves when the students are successfully registered to the teacher.
   * @throws {HttpException} - If there is an error registering the students to the teacher.
   */
  async registerStudents({
    teacher: teacherEmail,
    students: studentEmails,
  }: RegisterStudentsToTeacherRequest): Promise<void> {
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

  /**
   * Deregisters a student from a teacher.
   *
   * @param {DeregisterStudentFromTeacherRequest} request - The request object containing the teacher and student email.
   * @returns {Promise<void>} - A promise that resolves when the student is successfully deregistered.
   * @throws {HttpException} - If there is an error deregistering the student.
   */
  async deregisterStudents({
    teacher: teacherEmail,
    student: studentEmail,
  }: DeregisterStudentFromTeacherRequest): Promise<void> {
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
      throw new HttpException(
        'Unable to deregister student from teacher',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retrieves registrations by teacher email.
   *
   * @param teacherEmails - An array of teacher emails.
   * @returns A promise that resolves to an array of objects containing the teacher email and registration items.
   */
  private async getRegistrationsByTeacherEmail(teacherEmails: string[]) {
    return await Promise.all(
      teacherEmails.map(async (teacherEmail) => {
        const params = {
          TableName: 'Registrations',
          KeyConditionExpression: 'teacherEmail = :teacherEmail',
          ExpressionAttributeValues: {
            ':teacherEmail': { S: teacherEmail },
          },
        };
        const result = await this.dbClient.queryItems(params);
        return { teacherEmail, Items: result.Items };
      }),
    );
  }

  /**
   * Maps registrations to an object where the keys are teacher emails and the values are arrays of student emails.
   *
   * @param registrations - An array of registrations, each containing a teacher email and an array of student emails.
   * @returns An object where the keys are teacher emails and the values are arrays of student emails.
   */
  private mapToRegistrationsByTeacherEmail(
    registrations: {
      teacherEmail: string;
      Items: Record<string, AttributeValue>[];
    }[],
  ) {
    return registrations.reduce((acc, registration) => {
      const teacherEmail = registration.teacherEmail;
      const studentEmails = registration.Items.map(
        (item) => item.studentEmail.S,
      );
      acc[teacherEmail] = studentEmails;
      return acc;
    }, {});
  }

  /**
   * Retrieves the common students for the given teacher emails.
   *
   * @param teacherEmails - An array of teacher emails.
   * @returns A Promise that resolves to an object containing the message and data of the common students.
   * @throws {Error} If the teacher is not found.
   * @throws {HttpException} If there is an error retrieving the common students.
   */
  async getCommonStudents(
    teacherEmails: string[],
  ): Promise<GetCommonStudentsResponse> {
    try {
      // check if the teacher exists
      const teachers = (
        await this.dbClient.getItems({
          RequestItems: {
            Teachers: {
              Keys: teacherEmails.map((email) => ({
                email,
              })),
            },
          },
        })
      ).Responses?.Teachers;

      if (!teachers || teachers.length === 0) {
        throw new Error('Teacher not found');
      }

      // get registrations by teacher email
      const registrationsResult =
        await this.getRegistrationsByTeacherEmail(teacherEmails);

      if (teacherEmails.length === 1) {
        return {
          students: registrationsResult[0].Items.map(
            (registration) => registration.studentEmail?.S,
          ),
        };
      }

      const registrationsByTeacherEmail =
        this.mapToRegistrationsByTeacherEmail(registrationsResult);

      // find common students
      const commonStudents = Object.values(registrationsByTeacherEmail).reduce(
        (acc: string[], studentEmails: string): string[] => {
          return acc.filter((email) => studentEmails.includes(email));
        },
      ) as string[];

      return {
        students: commonStudents,
      };
    } catch (error) {
      this.logger.error(`Error getting common students: ${error.message}`);
      throw new HttpException(
        'Unable to get common students',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retrieves all teachers with their associated students.
   * @returns An object containing an array of teachers with their students.
   * @throws {Error} If no teachers are found.
   * @throws {HttpException} If there is an error retrieving teachers with students.
   */
  async getAllTeachersWithStudents(): Promise<GetAllTeachersWithStudentsResponse> {
    try {
      // get all teachers
      const teachers = await this.dbClient.getAllItems({
        TableName: 'Teachers',
      });

      const teacherEmails = teachers.Items.map((teacher) => teacher.email.S);

      if (!teachers || !teacherEmails || teacherEmails.length === 0) {
        throw new Error('No teachers found');
      }

      // get registrations by teacher email
      const registrationsResult =
        await this.getRegistrationsByTeacherEmail(teacherEmails);

      const registrationsByTeacherEmail =
        this.mapToRegistrationsByTeacherEmail(registrationsResult);

      return {
        teachers: Object.keys(registrationsByTeacherEmail).map((teacher) => ({
          email: teacher,
          students: registrationsByTeacherEmail[teacher],
        })),
      };
    } catch (error) {
      this.logger.error(
        `Error getting teachers with students: ${error.message}`,
      );
      throw new HttpException(
        'Unable to get teachers with students',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
