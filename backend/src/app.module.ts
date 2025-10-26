import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [DatabaseModule, RepositoriesModule, AuthModule, ProductsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
