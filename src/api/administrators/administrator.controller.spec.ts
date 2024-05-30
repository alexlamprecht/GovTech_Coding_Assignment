import { Test, TestingModule } from '@nestjs/testing';
import { AdministratorController } from './administrator.controller';
import { AdministratorService } from './administrator.service';
import { DynamoDbClient } from '../../shared/dynamodb.client';

describe('AdministratorController', () => {
  let administratorController: AdministratorController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AdministratorController],
      providers: [AdministratorService, DynamoDbClient],
    }).compile();

    administratorController = app.get<AdministratorController>(
      AdministratorController,
    );
  });

  describe('Heartbeat', () => {
    it('should return the correct string', () => {
      expect(administratorController.heartbeat()).toMatch(
        /^Heartbeat: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
      );
    });
  });
});
