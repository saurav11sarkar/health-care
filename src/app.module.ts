import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './app/module/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './app/module/auth/auth.module';
import { ScheduleModule } from './app/module/schedule/schedule.module';
import { DoctorScheduleModule } from './app/module/doctor-schedule/doctor-schedule.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModule,
    AuthModule,
    ScheduleModule,
    DoctorScheduleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
