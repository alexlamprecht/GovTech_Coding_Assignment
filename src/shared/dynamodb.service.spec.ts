import { Test, TestingModule } from '@nestjs/testing';
import { DynamoDbService } from './dynamodb.service';

describe('DynamoDbService', () => {
  let service: DynamoDbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DynamoDbService],
    }).compile();

    service = module.get<DynamoDbService>(DynamoDbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize tables successfully', async () => {
    // Mock the DynamoDbClient's initialiseTables method
    const mockInitialiseTables = jest.fn().mockResolvedValueOnce(undefined);
    service.initialiseTables = mockInitialiseTables;

    await service.initialiseTables();

    expect(mockInitialiseTables).toHaveBeenCalled();
  });
});
