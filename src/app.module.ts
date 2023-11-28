import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import EnvironmentSchema from './environment.schema';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { ProductsModule } from './products/products.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: false,
      isGlobal: true,
      validationSchema: EnvironmentSchema,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    AdminModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useExisting: JwtAuthGuard,
    },
    JwtAuthGuard,
    AppService,
  ],
})
export class AppModule {}
