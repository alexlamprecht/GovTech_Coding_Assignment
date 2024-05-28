import { Injectable, Logger } from '@nestjs/common';
import {
  CreateTableCommand,
  CreateTableCommandInput,
  DescribeTableCommand,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  PutCommandInput,
  GetCommandInput,
} from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamoDbClient {
  readonly dynamoDbClient: DynamoDBClient;
  readonly documentClient: DynamoDBDocumentClient;
  readonly logger = new Logger(DynamoDbClient.name);

  constructor() {
    this.dynamoDbClient = new DynamoDBClient({
      region: process.env.AWS_REGION,
      endpoint: process.env.AWS_ENDPOINT,
    });

    this.documentClient = DynamoDBDocumentClient.from(this.dynamoDbClient);
  }

  async createTable(params: CreateTableCommandInput): Promise<void> {
    try {
      const tableName = params.TableName;
      const tableExists = await this.tableExists(tableName);
      if (!tableExists) {
        await this.dynamoDbClient.send(new CreateTableCommand(params));
        this.logger.log(`Created table ${tableName}`);
      } else {
        this.logger.log(`Table ${tableName} already exists`);
      }
    } catch (error) {
      this.logger.error(`Error creating table: ${error.message}`);
    }
  }

  private async tableExists(tableName: string): Promise<boolean> {
    try {
      const describeCommand = new DescribeTableCommand({
        TableName: tableName,
      });
      await this.dynamoDbClient.send(describeCommand);
      return true;
    } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
        return false;
      }
      throw error;
    }
  }

  async putItem(params: PutCommandInput) {
    return this.documentClient.send(new PutCommand(params));
  }

  async getItem(params: GetCommandInput) {
    return this.documentClient.send(new GetCommand(params));
  }
}
