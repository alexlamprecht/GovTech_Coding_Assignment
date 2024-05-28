import { Module, OnModuleInit } from '@nestjs/common';
import { DynamoDbClient } from './shared/dynamodb.client';

import { DynamoDbService } from './shared/dynamodb.service';
import { AdministratorController } from './api/administrators/administrator.controller';
import { AdministratorService } from './api/administrators/administrator.service';

@Module({
  imports: [],
  controllers: [AdministratorController],
  providers: [AdministratorService, DynamoDbClient, DynamoDbService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly dynamoDbService: DynamoDbService) {}

  async onModuleInit() {
    await this.dynamoDbService.initialiseTables();
  }
}
