import { Module } from '@nestjs/common';
import { TextInputController } from './text-input.controller';

@Module({
  controllers: [TextInputController]
})
export class TextInputModule {}
