import { Module, OnModuleInit } from '@nestjs/common';
import { DynamoDbClient } from './shared/dynamodb.client';
import { AppController } from './api/administrators/administrators.controller';
import { AppService } from './api/administrators/administrators.service';
import { DynamoDbService } from './shared/dynamodb.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, DynamoDbClient, DynamoDbService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly dynamoDbService: DynamoDbService) {}

  async onModuleInit() {
    await this.dynamoDbService.initialiseTables();
  }
}
