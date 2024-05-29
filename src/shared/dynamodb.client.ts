import { Injectable, Logger } from '@nestjs/common';
import {
  CreateTableCommand,
  CreateTableCommandInput,
  DescribeTableCommand,
  DynamoDBClient,
  QueryCommand,
  QueryCommandInput,
  ScanCommand,
  TransactWriteItemsCommand,
  TransactWriteItemsCommandInput,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  PutCommandInput,
  GetCommandInput,
  ScanCommandInput,
  UpdateCommand,
  UpdateCommandInput,
  DeleteCommandInput,
  DeleteCommand,
  BatchGetCommand,
  BatchGetCommandInput,
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

  async addItem(params: PutCommandInput) {
    return this.documentClient.send(new PutCommand(params));
  }

  async addItems(params: TransactWriteItemsCommandInput) {
    return this.documentClient.send(new TransactWriteItemsCommand(params));
  }

  async getItem(params: GetCommandInput) {
    return this.documentClient.send(new GetCommand(params));
  }

  async getAllItems(params: ScanCommandInput) {
    return this.documentClient.send(new ScanCommand(params));
  }

  async getItems(params: BatchGetCommandInput) {
    return this.documentClient.send(new BatchGetCommand(params));
  }

  async queryItems(params: QueryCommandInput) {
    return this.documentClient.send(new QueryCommand(params));
  }

  async deleteItem(params: DeleteCommandInput) {
    return this.documentClient.send(new DeleteCommand(params));
  }

  async updateItem(params: UpdateCommandInput) {
    return this.documentClient.send(new UpdateCommand(params));
  }
}
