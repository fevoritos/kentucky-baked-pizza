import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { AuthModule } from './auth/auth.module';
import { DishesModule } from './dishes/dishes.module';

@Module({
  imports: [DatabaseModule, RepositoriesModule, AuthModule, DishesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
