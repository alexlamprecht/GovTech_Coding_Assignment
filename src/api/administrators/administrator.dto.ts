import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

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
