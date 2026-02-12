import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SpecialtiesService } from './specialties.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';

@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSpecialties(@Body() createSpecialtyDto: CreateSpecialtyDto) {
    const result =
      await this.specialtiesService.createSpecialties(createSpecialtyDto);

    return {
      message: 'Specialty created successfully',
      data: result,
    };
  }

  @Get()
  findAll() {
    return this.specialtiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.specialtiesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSpecialtyDto: UpdateSpecialtyDto,
  ) {
    return this.specialtiesService.update(+id, updateSpecialtyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.specialtiesService.remove(+id);
  }
}
