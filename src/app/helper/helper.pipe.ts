import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class HelperPipe implements PipeTransform {
  async transform(value: unknown, { metatype }: any) {
    if (!metatype || this.isPrimitive(metatype)) {
      return value;
    }

    const dto = plainToInstance(metatype, value);

    if (!dto) {
      return value;
    }

    const errors = await validate(dto);
    if (errors.length > 0) {
      throw new BadRequestException(
        errors.map((err) => Object.values(err.constraints ?? {})).flat(),
      );
    }

    return dto;
  }

  private isPrimitive(type: any): boolean {
    const primitives = [String, Boolean, Number, Array, Object];
    return primitives.includes(type);
  }
}
