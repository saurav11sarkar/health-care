import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export const ValidatedBody = createParamDecorator(
  async (dtoClass: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const body = request.body;

    let parsedData: any;

    // Check if data field exists (multipart/form-data)
    if (body.data && typeof body.data === 'string') {
      try {
        parsedData = JSON.parse(body.data);
      } catch (error) {
        throw new BadRequestException('Invalid JSON in data field');
      }
    } else {
      parsedData = body;
    }

    // Transform and validate
    const dtoInstance = plainToInstance(dtoClass, parsedData);
    const errors = await validate(dtoInstance);

    if (errors.length > 0) {
      const errorMessages = errors
        .map((err) => Object.values(err.constraints ?? {}))
        .flat();
      throw new BadRequestException(errorMessages);
    }

    return dtoInstance;
  },
);
