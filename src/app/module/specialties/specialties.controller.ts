import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { SpecialtiesService } from './specialties.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileUpload } from 'src/app/helper/fileUpload';
import { ValidatedBody } from 'src/app/helper/validated.decorator';

@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('icon', fileUpload.uploadConfig))
  @HttpCode(HttpStatus.CREATED)
  async createSpecialties(
    @ValidatedBody(CreateSpecialtyDto) dto: CreateSpecialtyDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.specialtiesService.createSpecialties(dto, file);

    return {
      message: 'Specialty created successfully',
      data: result,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllSpecialties() {
    const result = await this.specialtiesService.getAllSpecialties();

    return {
      message: 'Specialties retrieved successfully',
      data: result,
    };
  }

  @Get(':id')
  async findOneSpecialty(@Param('id') id: string) {
    const result = await this.specialtiesService.findOneSpecialty(id);

    return {
      message: 'Specialty retrieved successfully',
      data: result,
    };
  }

  @Delete(':id')
  async deleteSpecialty(@Param('id') id: string) {
    const result = await this.specialtiesService.deleteSpecialty(id);

    return {
      message: 'Specialty deleted successfully',
      data: result,
    };
  }
}
