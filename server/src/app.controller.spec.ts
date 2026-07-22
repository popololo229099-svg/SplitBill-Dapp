import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

jest.mock('@stellar/stellar-sdk', () => ({}));
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('./prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const mockAppService = {
      getStatus: jest
        .fn()
        .mockReturnValue({ network: 'testnet', status: 'ok' }),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: mockAppService }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getStatus', () => {
    it('should return status object', () => {
      const result = appController.getStatus();
      expect(result).toEqual({ network: 'testnet', status: 'ok' });
    });
  });
});
