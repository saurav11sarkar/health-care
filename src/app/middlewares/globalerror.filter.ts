// import {
//   ArgumentsHost,
//   Catch,
//   ExceptionFilter,
//   HttpStatus,
// } from '@nestjs/common';
// import { Response } from 'express';
// import { handleDuplicateError } from '../errors/handle-duplicate-error';

// @Catch()
// export class MiddlewaresFilter<T> implements ExceptionFilter {
//   catch(exception: T, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//     const request = ctx.getRequest<Request>();

//     let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
//     let message = 'Something went wrong!';
//     let errorSources = [{ path: '', message: 'Something went wrong' }];

//     /** Zod Error */
//     if (exception instanceof ZodError) {
//       const simplified = handleZodError(exception);
//       statusCode = simplified.statusCode;
//       message = simplified.message;
//       errorSources = simplified.errorSources;
//     } else if (exception instanceof mongoose.Error.ValidationError) {
//       /** Mongoose Validation Error */
//       const simplified = handleValidationError(exception);
//       statusCode = simplified.statusCode;
//       message = simplified.message;
//       errorSources = simplified.errorSources;
//     } else if (exception instanceof mongoose.Error.CastError) {
//       /** Cast Error */
//       const simplified = handleCastError(exception);
//       statusCode = simplified.statusCode;
//       message = simplified.message;
//       errorSources = simplified.errorSources;
//     } else if ((exception as any)?.code === 11000) {
//       /** Duplicate Key */
//       const simplified = handleDuplicateError(exception);
//       statusCode = simplified.statusCode;
//       message = simplified.message;
//       errorSources = simplified.errorSources;
//     } else if (exception instanceof AppError) {
//       /** Custom App Error */
//       statusCode = exception.statusCode;
//       message = exception.message;
//       errorSources = [{ path: '', message }];
//     } else if (exception instanceof HttpException) {
//       /** Nest HttpException */
//       statusCode = exception.getStatus();
//       const res = exception.getResponse();
//       message = typeof res === 'string' ? res : (res as any).message || message;
//     }

//     response.status(statusCode).json({
//       success: false,
//       statusCode,
//       path: request.url,
//       message,
//       errorSources,
//     });
//   }
// }

//==================================================================================

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from 'src/generated/prisma/client';
import AppError from '../errors/appError';
import { MulterError } from 'multer';
import {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from '@nestjs/jwt';

@Catch()
export class MiddlewaresFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong!';
    let errorSources = [{ path: '', message: 'Something went wrong' }];

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      statusCode = HttpStatus.BAD_REQUEST;

      if (exception.code === 'P2002') {
        const fields = (exception.meta?.target as string[]) ?? [];
        message = `Duplicate value: ${fields.join(', ')} already exists`;
        errorSources = fields.map((f) => ({
          path: f,
          message: `${f} already exists`,
        }));
      } else if (exception.code === 'P2003') {
        const field = (exception.meta?.field_name as string) ?? 'unknown field';
        message = `Related record not found for: ${field}`;
        errorSources = [{ path: field, message }];
      } else if (exception.code === 'P2025') {
        statusCode = HttpStatus.NOT_FOUND;
        message = (exception.meta?.cause as string) ?? 'Record not found';
        errorSources = [{ path: '', message }];
      } else if (exception.code === 'P1000') {
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Database authentication failed';
        errorSources = [{ path: '', message }];
      } else {
        message = `Database error: ${exception.code}`;
        errorSources = [{ path: '', message }];
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Invalid data provided to the database query';
      errorSources = [{ path: '', message }];
    } else if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unknown database error occurred';
      errorSources = [{ path: '', message }];
    } else if (exception instanceof Prisma.PrismaClientInitializationError) {
      statusCode = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Database connection failed — service unavailable';
      errorSources = [{ path: '', message }];
    } else if (exception instanceof Prisma.PrismaClientRustPanicError) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Critical database engine error';
      errorSources = [{ path: '', message }];
    } else if (exception instanceof TokenExpiredError) {
      statusCode = HttpStatus.UNAUTHORIZED;
      message = 'Token has expired, please login again';
      errorSources = [{ path: 'token', message }];
    } else if (exception instanceof JsonWebTokenError) {
      statusCode = HttpStatus.UNAUTHORIZED;
      message = 'Invalid token, please login again';
      errorSources = [{ path: 'token', message }];
    } else if (exception instanceof NotBeforeError) {
      statusCode = HttpStatus.UNAUTHORIZED;
      message = 'Token not yet active';
      errorSources = [{ path: 'token', message }];
    } else if (exception instanceof MulterError) {
      statusCode = HttpStatus.BAD_REQUEST;
      const multerMessages: Record<string, string> = {
        LIMIT_FILE_SIZE: 'File size too large',
        LIMIT_FILE_COUNT: 'Too many files uploaded',
        LIMIT_UNEXPECTED_FILE: 'Unexpected file field',
        LIMIT_PART_COUNT: 'Too many parts in upload',
        LIMIT_FIELD_KEY: 'Field name too long',
        LIMIT_FIELD_VALUE: 'Field value too long',
        LIMIT_FIELD_COUNT: 'Too many fields',
      };
      message =
        multerMessages[exception.code] ??
        `File upload error: ${exception.code}`;
      errorSources = [{ path: exception.field ?? 'file', message }];
    } else if (exception instanceof AppError) {
      statusCode = exception.statusCode;
      message = exception.message;
      errorSources = [{ path: '', message }];
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        errorSources = [{ path: '', message }];
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        if (Array.isArray(resObj.message)) {
          message = 'Validation failed';
          errorSources = resObj.message.map((msg: string) => ({
            path: '',
            message: msg,
          }));
        } else {
          message = resObj.message ?? exception.message;
          errorSources = [{ path: '', message }];
        }
      }
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errorSources,
    });
  }
}
