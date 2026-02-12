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
import { handleDuplicateError } from '../errors/handle-duplicate-error';
import { Prisma } from 'src/generated/prisma/client';
import AppError from '../errors/appError';

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
      if (exception.code === 'P2002') {
        statusCode = HttpStatus.BAD_REQUEST;
        const constraint = (exception.meta as any)?.driverAdapterError?.cause
          ?.constraint;
        message = `duplicate field error: ${constraint.fields[0]}`;

        errorSources = constraint;
      }
      if (exception.code === 'P2003') {
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Foreign key constraint failed';
        const constraint = (exception.meta as any)?.driverAdapterError?.cause
          ?.constraint;
        errorSources = constraint;
      }
      if (exception.code === 'P1000') {
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Authentication failed aginest database server';
        const constraint = (exception.meta as any)?.driverAdapterError?.cause
          ?.constraint;
        errorSources = constraint;
      }
    } else if ((exception as any)?.code === 11000) {
      const simplified = handleDuplicateError(exception);
      statusCode = simplified.statusCode;
      message = simplified.message;
      errorSources = simplified.errorSources;
    } else if (exception instanceof AppError) {
      statusCode = exception.statusCode;
      message = exception.message;
      errorSources = [{ path: '', message }];
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = exception.message;
      errorSources = [
        {
          path: '',
          message,
        },
      ];
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      path: request.url,
      message,
      errorSources,
    });
  }
}
