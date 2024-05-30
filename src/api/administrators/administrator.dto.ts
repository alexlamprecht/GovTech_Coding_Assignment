import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateStudentRequest {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly name: string;
}

export class CreateTeacherRequest {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly name: string;
}

export class RegisterStudentsToTeacherRequest {
  @IsEmail()
  @IsNotEmpty()
  readonly teacher: string;

  @IsString({ each: true })
  @IsEmail({}, { each: true })
  @ArrayNotEmpty()
  @IsNotEmpty()
  @IsArray()
  readonly students: string[];
}

export class DeregisterStudentFromTeacherRequest {
  @IsEmail()
  @IsNotEmpty()
  readonly teacher: string;

  @IsEmail()
  @IsNotEmpty()
  readonly student: string;

  @IsString()
  @IsNotEmpty()
  readonly reason: string;
}

export class GetCommonStudentsRequest {
  @IsEmail({}, { each: true })
  @ArrayNotEmpty()
  @IsNotEmpty()
  @IsArray()
  teacher: string[];
}

export class GetCommonStudentsResponse {
  students: string[];
}

export class GetAllTeachersWithStudentsResponse {
  teachers: {
    email: string;
    students: string[];
  }[];
}
