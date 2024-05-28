import { CreateTableCommandInput } from '@aws-sdk/client-dynamodb';

export const tableSchemas: CreateTableCommandInput[] = [
  {
    TableName: 'Students',
    KeySchema: [
      { AttributeName: 'email', KeyType: 'HASH' }, // Partition key
    ],
    AttributeDefinitions: [{ AttributeName: 'email', AttributeType: 'S' }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  },
  {
    TableName: 'Teachers',
    KeySchema: [
      { AttributeName: 'email', KeyType: 'HASH' }, // Partition key
    ],
    AttributeDefinitions: [{ AttributeName: 'email', AttributeType: 'S' }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  },
  {
    TableName: 'Registrations',
    KeySchema: [
      { AttributeName: 'teacherEmail', KeyType: 'HASH' }, // Partition key
      { AttributeName: 'studentEmail', KeyType: 'RANGE' }, // Sort key
    ],
    AttributeDefinitions: [
      { AttributeName: 'teacherEmail', AttributeType: 'S' },
      { AttributeName: 'studentEmail', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  },
];
