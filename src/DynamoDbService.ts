import { Injectable } from '@nestjs/common';
import {
  CreateTableCommand,
  CreateTableCommandInput,
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
export class DynamoDbService {
  private readonly dynamoDbClient: DynamoDBClient;
  private readonly documentClient: DynamoDBDocumentClient;

  constructor() {
    this.dynamoDbClient = new DynamoDBClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
      credentials: {
        accessKeyId: 'fakeMyKeyId',
        secretAccessKey: 'fakeSecretAccessKey',
      },
    });

    this.documentClient = DynamoDBDocumentClient.from(this.dynamoDbClient);
  }

  async createTable(params: CreateTableCommandInput) {
    return this.dynamoDbClient.send(new CreateTableCommand(params));
  }

  async putItem(params: PutCommandInput) {
    return this.documentClient.send(new PutCommand(params));
  }

  async getItem(params: GetCommandInput) {
    return this.documentClient.send(new GetCommand(params));
  }

  // Add more methods as needed
}
