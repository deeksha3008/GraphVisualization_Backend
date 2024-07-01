import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { GraphService } from './graph.service';
import { TextProcessingService } from './text-processing/text-processing.service';

@Controller('graph-data')
export class GraphController {
    constructor(private readonly graphService: GraphService, private textProcessingService: TextProcessingService) {}

    @Get()
    async getGraphData() {
      return this.textProcessingService.getGraphData();
    }

}
