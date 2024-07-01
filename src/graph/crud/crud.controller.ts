import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { TextProcessingService } from '../text-processing/text-processing.service';// Assuming this service contains logic for interacting with Neo4j

@Controller('crud')
export class CrudController {
  constructor(private readonly textProcessingService: TextProcessingService) {}

  @Get('labels')
  async getUniqueLabels() {
    return this.textProcessingService.getUniqueLabels();
  }

  @Put('update-node-relationship')
  async updateNodeRelationship(@Body() dto: { source: string, oldTarget: string, newTarget: string, newTargetLabel: string, relationshipType: string }) {
      return this.textProcessingService.updateNodeRelationship(dto.source, dto.oldTarget, dto.newTarget, dto.newTargetLabel, dto.relationshipType);
  }

  @Delete('delete/:name')
  async deleteNode(@Param('name') name: string) {
    return this.textProcessingService.deleteNode(name);
  }
  @Post('add-node-relationship')
  async addNodeAndRelationship(@Body() dto: { source: string; sourceLabel: string; target: string; targetLabel: string; type: string }) {
    return this.textProcessingService.addNodeAndRelationship(dto.source, dto.sourceLabel, dto.target, dto.targetLabel, dto.type);
  }

  @Post('process')
  async processText(@Body() dto: {inputText: string}) {
    console.log("i am in text input controller",dto.inputText);
    return await this.textProcessingService.processText(dto.inputText);
  }

}