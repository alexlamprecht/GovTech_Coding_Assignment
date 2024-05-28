import { Injectable, Logger } from '@nestjs/common';

import { tableSchemas } from './dynamodb.schema';
import { DynamoDbClient } from './dynamodb.client';

@Injectable()
export class DynamoDbService {
  private readonly client = new DynamoDbClient();
  private readonly logger = new Logger(DynamoDbService.name);
  private readonly schemas = tableSchemas;

  async initialiseTables(): Promise<void> {
    this.schemas.forEach(async (schema) => {
      await this.client.createTable(schema);
    });
  }
}
