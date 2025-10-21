import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @ApiOperation({ summary: 'Получить приветственное сообщение' })
  @ApiResponse({ status: 200, description: 'Приветственное сообщение' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('database-info')
  @ApiOperation({ summary: 'Получить информацию о базе данных' })
  @ApiResponse({ status: 200, description: 'Информация о подключении к базе данных' })
  async getDatabaseInfo() {
    return this.appService.getDatabaseInfo();
  }
}
