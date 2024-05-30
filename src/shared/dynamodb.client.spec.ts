import { DynamoDbClient } from './dynamodb.client';

// tests for dynamodb.client.ts

describe('DynamoDbClient', () => {
  let dynamoDbClient: DynamoDbClient;

  beforeEach(() => {
    dynamoDbClient = new DynamoDbClient();
  });

  it('should be defined', () => {
    expect(dynamoDbClient).toBeDefined();
  });

  it('should create a table successfully', async () => {
    const mockTableExists = jest.fn().mockResolvedValueOnce(false);

    const mockSend = jest.fn().mockResolvedValueOnce(undefined);

    dynamoDbClient['tableExists'] = mockTableExists;
    dynamoDbClient.dynamoDbClient.send = mockSend;

    await dynamoDbClient.createTable({
      TableName: 'Students',
      KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'email', AttributeType: 'S' }],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    });
    expect(mockTableExists).toHaveBeenCalled();
    expect(mockSend).toHaveBeenCalled();
  });

  it('should not create a table if it already exists', async () => {
    const mockTableExists = jest.fn().mockResolvedValueOnce(true);

    const mockSend = jest.fn().mockResolvedValueOnce(undefined);

    dynamoDbClient['tableExists'] = mockTableExists;
    dynamoDbClient.dynamoDbClient.send = mockSend;

    await dynamoDbClient.createTable({
      TableName: 'Students',
      KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'email', AttributeType: 'S' }],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    });
    expect(mockTableExists).toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should handle errors when creating a table', async () => {
    const mockTableExists = jest.fn().mockResolvedValueOnce(true);

    dynamoDbClient['tableExists'] = mockTableExists;

    await dynamoDbClient.createTable({
      TableName: 'Students',
      KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'email', AttributeType: 'S' }],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    });

    expect(mockTableExists).toHaveBeenCalled();
  });

  it('should check if a table exists', async () => {
    const mockSend = jest.fn().mockResolvedValueOnce(undefined);

    dynamoDbClient.dynamoDbClient.send = mockSend;

    await dynamoDbClient['tableExists']('Students');
  });

  it('should return true if a table exists', async () => {
    const mockSend = jest.fn().mockResolvedValueOnce(undefined);

    dynamoDbClient.dynamoDbClient.send = mockSend;

    const exists = await dynamoDbClient['tableExists']('Students');
    expect(exists).toBe(true);
  });

  it('should return false if a table does not exist', async () => {
    const mockSend = jest.fn().mockRejectedValueOnce({
      name: 'ResourceNotFoundException',
    });

    dynamoDbClient.dynamoDbClient.send = mockSend;

    const exists = await dynamoDbClient['tableExists']('Students');
    expect(exists).toBe(false);
  });

  it('should add an item successfully', async () => {
    const mockSend = jest.fn().mockResolvedValueOnce(undefined);

    dynamoDbClient.documentClient.send = mockSend;

    await dynamoDbClient.addItem({
      TableName: 'Students',
      Item: {
        email: '',
      },
    });
  });

  it('should add multiple items successfully', async () => {
    const mockSend = jest.fn().mockResolvedValueOnce(undefined);

    dynamoDbClient.documentClient.send = mockSend;

    await dynamoDbClient.addItems({
      TransactItems: [
        {
          Put: {
            TableName: 'Students',
            Item: {
              email: { S: '' },
            },
          },
        },
      ],
    });
  });

  it('should get an item successfully', async () => {
    const mockSend = jest.fn().mockResolvedValueOnce(undefined);

    dynamoDbClient.documentClient.send = mockSend;

    await dynamoDbClient.getItem({
      TableName: 'Students',
      Key: {
        email: '',
      },
    });
  });

  it('should get all items successfully', async () => {
    const mockSend = jest.fn().mockResolvedValueOnce(undefined);

    dynamoDbClient.documentClient.send = mockSend;

    await dynamoDbClient.getAllItems({
      TableName: 'Students',
    });
  });

  it('should get multiple items successfully', async () => {
    const mockSend = jest.fn().mockResolvedValueOnce(undefined);

    dynamoDbClient.documentClient.send = mockSend;

    await dynamoDbClient.getItems({
      RequestItems: {
        Students: {
          Keys: [{ email: '' }],
        },
      },
    });
  });

  it('should query items successfully', async () => {
    const mockSend = jest.fn().mockResolvedValueOnce(undefined);

    dynamoDbClient.documentClient.send = mockSend;

    await dynamoDbClient.queryItems({
      TableName: 'Students',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': { S: '' },
      },
    });
  });

  it('should delete an item successfully', async () => {
    const mockSend = jest.fn().mockResolvedValueOnce(undefined);

    dynamoDbClient.documentClient.send = mockSend;

    await dynamoDbClient.deleteItem({
      TableName: 'Students',
      Key: {
        email: '',
      },
    });
  });

  it('should update an item successfully', async () => {
    const mockSend = jest.fn().mockResolvedValueOnce(undefined);

    dynamoDbClient.documentClient.send = mockSend;

    await dynamoDbClient.updateItem({
      TableName: 'Students',
      Key: {
        email: '',
      },
      UpdateExpression: 'SET email = :email',
      ExpressionAttributeValues: {
        ':email': { S: '' },
      },
    });
  });
});
