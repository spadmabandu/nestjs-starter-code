import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserInput {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: `Password must be at least 8 characters long.` })
  password: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;
}
