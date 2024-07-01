import { Test, TestingModule } from '@nestjs/testing';
import { TextInputController } from './text-input.controller';

describe('TextInputController', () => {
  let controller: TextInputController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TextInputController],
    }).compile();

    controller = module.get<TextInputController>(TextInputController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
