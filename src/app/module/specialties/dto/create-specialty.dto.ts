import { IsOptional, IsString } from 'class-validator';

export class CreateSpecialtyDto {
  @IsString({ message: 'Title must be a string' })
  title: string;

  @IsString({ message: 'Icon must be a string' })
  @IsOptional()
  icon?: string;
}
