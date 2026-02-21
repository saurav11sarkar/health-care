import { Controller, Get, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { DoctorService } from './doctor.service';

import type { Request } from 'express';
import pick from 'src/app/helper/pick';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllDoctors(@Req() req: Request) {
    const filters = pick(req.query, [
      'searchTerm',
      'name',
      'email',
      'contactNumber',
      'address',
      'registationNumber',
      'gender',
      'qualification',
      'currentWorkPlace',
      'designation',
      'doctorSpecialies',
    ]);
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await this.doctorService.getAllDoctors(filters, options);

    return {
      message: 'Doctors retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }
}
