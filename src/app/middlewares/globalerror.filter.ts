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
