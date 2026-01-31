import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from 'src/generated/prisma/enums';

export class CreateUserDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @Transform(({ value }) => value.trim())
  name: string;

  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsStrongPassword(
    {
      minLength: 6,
    },
    {
      message:
        'Password must be at least 6 characters and include uppercase, lowercase, number, and symbol',
    },
  )
  password: string;

  @IsEnum(UserRole, { message: 'Invalid user role' })
  @IsOptional()
  role?: UserRole;

  @IsString({ message: 'Profile photo must be a string' })
  @IsOptional()
  profilePhoto?: string;
}
