import { Test, TestingModule } from '@nestjs/testing';
import { AdministratorService } from './administrator.service';
import { DynamoDbClient } from '../../shared/dynamodb.client';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AttributeValue, QueryCommandOutput } from '@aws-sdk/client-dynamodb';

describe('AdministratorService', () => {
  let service: AdministratorService;
  let dbClient: DynamoDbClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdministratorService,
        {
          provide: DynamoDbClient,
          useValue: {
            addItem: jest.fn(),
            getAllItems: jest.fn(),
            getItem: jest.fn(),
            getItems: jest.fn(),
            addItems: jest.fn(),
            deleteItem: jest.fn(),
            queryItems: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdministratorService>(AdministratorService);
    dbClient = module.get<DynamoDbClient>(DynamoDbClient);
  });

  describe('createStudent', () => {
    it('should create a new student', async () => {
      const createStudentData = {
        name: 'John Doe',
        email: 'john.doe@test.com',
      };

      await service.createStudent(createStudentData);

      expect(dbClient.addItem).toHaveBeenCalledWith({
        TableName: 'Students',
        Item: {
          name: createStudentData.name,
          email: createStudentData.email,
        },
      });
    });

    it('should throw an error if there is an error creating the student', async () => {
      const createStudentData = {
        name: 'John Doe',
        email: 'john.doe@test.com',
      };

      const errorMessage = 'Unable to create student';
      const errorStatus = HttpStatus.INTERNAL_SERVER_ERROR;

      (dbClient.addItem as jest.Mock).mockRejectedValueOnce(
        new Error(errorMessage),
      );

      await expect(async () => {
        await service.createStudent(createStudentData);
      }).rejects.toThrow(new HttpException(errorMessage, errorStatus));
    });
  });

  describe('createTeacher', () => {
    it('should create a new teacher', async () => {
      const createTeacherData = {
        name: 'Jane Smith',
        email: 'jane.smith@test.com',
      };
      await service.createTeacher(createTeacherData);
      expect(dbClient.addItem).toHaveBeenCalledWith({
        TableName: 'Teachers',
        Item: {
          name: createTeacherData.name,
          email: createTeacherData.email,
        },
      });
    });

    it('should throw an error if there is an error creating the teacher', async () => {
      const createTeacherData = {
        name: 'Jane Smith',
        email: 'jane.smith@test.com',
      };
      const errorMessage = 'Unable to create teacher';
      const errorStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      (dbClient.addItem as jest.Mock).mockRejectedValueOnce(
        new Error(errorMessage),
      );
      await expect(async () => {
        await service.createTeacher(createTeacherData);
      }).rejects.toThrow(new HttpException(errorMessage, errorStatus));
    });
  });

  describe('registerStudents', () => {
    it('should register students to a teacher', async () => {
      const request = {
        teacher: 'teacher@test.com',
        students: ['student1@test.com', 'student2@test.com'],
      };
      (dbClient.getItem as jest.Mock).mockResolvedValue({
        Item: { email: 'testemail' },
      });

      await service.registerStudents(request);
      // mock dbClient.getItem
      expect(dbClient.addItems).toHaveBeenCalledWith({
        TransactItems: [
          {
            Put: {
              Item: {
                studentEmail: {
                  S: 'student1@test.com',
                },
                teacherEmail: {
                  S: 'teacher@test.com',
                },
              },
              TableName: 'Registrations',
            },
          },
          {
            Put: {
              Item: {
                studentEmail: {
                  S: 'student2@test.com',
                },
                teacherEmail: {
                  S: 'teacher@test.com',
                },
              },
              TableName: 'Registrations',
            },
          },
        ],
      });
    });

    it('should throw an error if there is an error registering the students', async () => {
      const request = {
        teacher: 'teacher@test.com',
        students: ['student1@test.com', 'student2@test.com'],
      };
      const errorMessage = 'Unable to register students to teacher';
      const errorStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      (dbClient.addItems as jest.Mock).mockRejectedValueOnce(
        new Error(errorMessage),
      );
      await expect(async () => {
        await service.registerStudents(request);
      }).rejects.toThrow(new HttpException(errorMessage, errorStatus));
    });
  });

  describe('deregisterStudents', () => {
    it('should deregister a student from a teacher', async () => {
      const request = {
        teacher: 'teacher@test.com',
        student: 'student1@test.com',
        reason: 'test reason',
      };
      (dbClient.getItem as jest.Mock).mockResolvedValue({
        Item: { email: 'testemail' },
      });
      await service.deregisterStudents(request);
      expect(dbClient.deleteItem).toHaveBeenCalledWith({
        TableName: 'Registrations',
        Key: {
          teacherEmail: 'teacher@test.com',
          studentEmail: 'student1@test.com',
        },
      });
    });

    it('should throw an error if there is an error deregistering the student', async () => {
      const request = {
        teacher: 'teacher@test.com',
        student: 'student1@test.com',
        reason: 'test reason',
      };
      const errorMessage = 'Unable to deregister student from teacher';
      const errorStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      (dbClient.deleteItem as jest.Mock).mockRejectedValueOnce(
        new Error(errorMessage),
      );
      (dbClient.getItem as jest.Mock).mockResolvedValue({
        Item: { email: 'testemail' },
      });
      await expect(async () => {
        await service.deregisterStudents(request);
      }).rejects.toThrow(new HttpException(errorMessage, errorStatus));
    });
  });

  describe('getRegistrationsByTeacherEmail', () => {
    it('should retrieve registrations by teacher email', async () => {
      const teacherEmails = ['teacher1@test.com', 'teacher2@test.com'];
      const registrations1: QueryCommandOutput = {
        $metadata: {},
        Items: [
          {
            teacherEmail: {
              S: 'teacher1@test.com',
            },
            studentEmail: {
              S: 'student3@test.com',
            },
          },
        ],
      };
      const registrations2: QueryCommandOutput = {
        $metadata: {},
        Items: [
          {
            teacherEmail: {
              S: 'teacher2@test.com',
            },
            studentEmail: {
              S: 'student3@test.com',
            },
          },
        ],
      };
      (dbClient.queryItems as jest.Mock)
        .mockResolvedValueOnce(registrations1)
        .mockResolvedValueOnce(registrations2);
      const result =
        await service['getRegistrationsByTeacherEmail'](teacherEmails);
      expect(dbClient.queryItems).toHaveBeenCalledWith({
        TableName: 'Registrations',
        KeyConditionExpression: 'teacherEmail = :teacherEmail',
        ExpressionAttributeValues: {
          ':teacherEmail': {
            S: 'teacher1@test.com',
          },
        },
      });
      expect(result).toEqual([
        {
          Items: [
            {
              studentEmail: { S: 'student3@test.com' },
              teacherEmail: { S: 'teacher1@test.com' },
            },
          ],
          teacherEmail: 'teacher1@test.com',
        },
        {
          Items: [
            {
              studentEmail: { S: 'student3@test.com' },
              teacherEmail: { S: 'teacher2@test.com' },
            },
          ],
          teacherEmail: 'teacher2@test.com',
        },
      ]);
    });
  });

  describe('mapToRegistrationsByTeacherEmail', () => {
    it('should map registrations to an object with teacher emails as keys and student emails as values', () => {
      const registrations: {
        teacherEmail: string;
        Items: Record<string, AttributeValue>[];
      }[] = [
        {
          teacherEmail: 'teacher1@test.com',
          Items: [
            { studentEmail: { S: 'student1@test.com' } },
            { studentEmail: { S: 'student2@test.com' } },
          ],
        },
        {
          teacherEmail: 'teacher2@test.com',
          Items: [
            { studentEmail: { S: 'student3@test.com' } },
            { studentEmail: { S: 'student4@test.com' } },
          ],
        },
      ];
      const result = service['mapToRegistrationsByTeacherEmail'](registrations);
      expect(result).toEqual({
        'teacher1@test.com': ['student1@test.com', 'student2@test.com'],
        'teacher2@test.com': ['student3@test.com', 'student4@test.com'],
      });
    });
  });

  describe('getCommonStudents', () => {
    it('should retrieve the common students for the given teacher emails', async () => {
      const teacherEmails = ['teacher1@test.com', 'teacher2@test.com'];
      (dbClient.getItems as jest.Mock).mockResolvedValueOnce({
        Responses: {
          Teachers: [
            {
              name: 'Teacher name 1',
              email: 'teacher1@test.com',
            },
            {
              name: 'Teacher name 2',
              students: ['student3@test.com', 'student2@test.com'],
              email: 'teacher2@test.com',
            },
          ],
        },
      });

      jest
        .spyOn(
          service,
          'getRegistrationsByTeacherEmail' as keyof AdministratorService,
        )
        .mockResolvedValueOnce([
          {
            teacherEmail: 'teacher1@test.com',
            Items: [
              {
                teacherEmail: {
                  S: 'teacher1@test.com',
                },
                studentEmail: {
                  S: 'student2@test.com',
                },
              },
            ],
          },
          {
            teacherEmail: 'teacher2@test.com',
            Items: [
              {
                teacherEmail: {
                  S: 'teacher2@test.com',
                },
                studentEmail: {
                  S: 'student1@test.com',
                },
              },
              {
                teacherEmail: {
                  S: 'teacher2@test.com',
                },
                studentEmail: {
                  S: 'student2@test.com',
                },
              },
            ],
          },
        ] as any);

      const result = await service.getCommonStudents(teacherEmails);

      expect(result).toEqual({
        students: ['student2@test.com'],
      });
    });

    it('should throw an error if the teacher is not found', async () => {
      const teacherEmails = ['teacher1@test.com'];
      const errorMessage = 'Unable to get common students';
      const errorStatus = HttpStatus.NOT_FOUND;
      (dbClient.queryItems as jest.Mock).mockResolvedValueOnce([]);
      await expect(async () => {
        await service.getCommonStudents(teacherEmails);
      }).rejects.toThrow(new HttpException(errorMessage, errorStatus));
    });

    it('should throw an error if there is an error retrieving the common students', async () => {
      const teacherEmails = ['teacher1@test.com'];
      const errorMessage = 'Unable to get common students';
      const errorStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      (dbClient.queryItems as jest.Mock).mockRejectedValueOnce(
        new Error(errorMessage),
      );
      await expect(async () => {
        await service.getCommonStudents(teacherEmails);
      }).rejects.toThrow(new HttpException(errorMessage, errorStatus));
    });
  });

  describe('getAllTeachersWithStudents', () => {
    it('should retrieve all teachers with their associated students', async () => {
      const teachersWithStudents = {
        Items: [
          {
            email: { S: 'teacher1@test.com' },
            students: ['student1@test.com', 'student2@test.com'],
          },
          {
            email: { S: 'teacher2@test.com' },
            students: ['student3@test.com', 'student4@test.com'],
          },
        ],
      };

      (dbClient.getAllItems as jest.Mock).mockResolvedValueOnce(
        teachersWithStudents,
      );

      jest
        .spyOn(
          service,
          'getRegistrationsByTeacherEmail' as keyof AdministratorService,
        )
        .mockResolvedValueOnce([
          {
            teacherEmail: 'teacher1@test.com',
            Items: [
              {
                teacherEmail: {
                  S: 'teacher1@test.com',
                },
                studentEmail: {
                  S: 'student2@test.com',
                },
              },
            ],
          },
          {
            teacherEmail: 'teacher2@test.com',
            Items: [
              {
                teacherEmail: {
                  S: 'teacher2@test.com',
                },
                studentEmail: {
                  S: 'student1@test.com',
                },
              },
              {
                teacherEmail: {
                  S: 'teacher2@test.com',
                },
                studentEmail: {
                  S: 'student2@test.com',
                },
              },
            ],
          },
        ] as any);

      const result = await service.getAllTeachersWithStudents();
      expect(dbClient.getAllItems).toHaveBeenCalledWith({
        TableName: 'Teachers',
      });
      expect(result).toEqual({
        teachers: [
          {
            email: 'teacher1@test.com',
            students: ['student2@test.com'],
          },
          {
            email: 'teacher2@test.com',
            students: ['student1@test.com', 'student2@test.com'],
          },
        ],
      });
    });

    it('should throw an error if no teachers are found', async () => {
      const errorMessage = 'Unable to get teachers with students';
      const errorStatus = HttpStatus.NOT_FOUND;
      (dbClient.getAllItems as jest.Mock).mockResolvedValueOnce([]);
      await expect(async () => {
        await service.getAllTeachersWithStudents();
      }).rejects.toThrow(new HttpException(errorMessage, errorStatus));
    });

    it('should throw an error if there is an error retrieving teachers with students', async () => {
      const errorMessage = 'Unable to get teachers with students';
      const errorStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      (dbClient.getAllItems as jest.Mock).mockRejectedValueOnce(
        new Error(errorMessage),
      );
      await expect(async () => {
        await service.getAllTeachersWithStudents();
      }).rejects.toThrow(new HttpException(errorMessage, errorStatus));
    });
  });
});
