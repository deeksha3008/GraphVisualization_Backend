import { Controller, Post, Body } from '@nestjs/common';
import { TextProcessingService } from 'src/graph/text-processing/text-processing.service';

@Controller('text')
export class TextInputController {
  constructor(private readonly textProcessingService: TextProcessingService) {}

  @Post('process')
  async processText(@Body('text') text: string) {
    console.log("i am in text input controller",text);
    return await this.textProcessingService.processText(text);
  }
}

