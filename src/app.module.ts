import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DynamoDbService } from './DynamoDbService';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, DynamoDbService],
})
export class AppModule {}
