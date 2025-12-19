import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { AuthModule } from './auth/auth.module';
import { DishesModule } from './dishes/dishes.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [
    DatabaseModule,
    RepositoriesModule,
    AuthModule,
    DishesModule,
    CartModule,
    OrdersModule,
    FeedbackModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
