import { Injectable, Logger } from '@nestjs/common';
import { Neo4jService } from 'nest-neo4j';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class TextProcessingService {
  private readonly logger = new Logger(TextProcessingService.name);

  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly httpService: HttpService,
    private readonly eventsGateway: EventsGateway
  ) {}

  async processText(inputText: string): Promise<void> {
    try {
      console.log("i am in process text",inputText)
      const data = await this.callOpenAI(inputText);
      await this.createEntities(data.entities);
      await this.createRelationships(data.relationships);
      this.eventsGateway.broadcastGraphUpdate({ action: 'full-update', entities: data.entities, relationships: data.relationships });
    } catch (error) {
      this.logger.error('Failed to process text', error.stack);
    }
  }

  private async callOpenAI(text: string): Promise<{ entities: any[], relationships: any[] }> {
    const apiKey = process.env.OPENAI_API_KEY;
    console.log("textttt",text);
    const headersRequest = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
    const body = {
      prompt: `Given the text: "${text}", identify all entities and their types (e.g., Person, Organization, Technology). Then, list the relationships between these entities in a structured format.
      
      For example:
      Entities: 
      Name: John Smith, Type: Person
      Name: TechCorp, Type: Organization
      
      Relationships: 
      - Source: John Smith, Relation: works at, Target: TechCorp
      
      Format the output as follows:
      Entities:
      - { name: <entity name>, type: <entity type> }
      Relationships:
      { source: <source entity>, relation: <relationship type>, target: <target entity> }`,
      max_tokens: 300,
      model: "gpt-3.5-turbo-instruct"
    };

    try {
      const response = await firstValueFrom(this.httpService.post('https://api.openai.com/v1/completions', body, { headers: headersRequest }));
      console.log("00000000sjdhzgjsd",response.data.choices[0].text);
      return this.parseOpenAIResponse(response.data.choices[0].text);
    } catch (error) {
      this.logger.error('Error calling OpenAI API', error);
      return { entities: [], relationships: [] };
    }
  }

  private parseOpenAIResponse(response: string): { entities: any[], relationships: any[] } {
    if (!response) {
      this.logger.error('No response or invalid response from OpenAI');
      return { entities: [], relationships: [] };
    }

    const lines = response.trim().split('\n');
    const entities = [];
    const relationships = [];
    let currentSection = '';

    for (const line of lines) {
      if (line.includes('Entities:')) {
        currentSection = 'entities';
        continue;
      } else if (line.includes('Relationships:')) {
        currentSection = 'relationships';
        continue;
      }

      if (currentSection === 'entities' && line.trim()) {
        const cleanedLine = line.replace(/[{}-]/g, '').trim();
        const parts = cleanedLine.split(',').map(part => part.split(':').map(p => p.trim()));
        const entity = {};
        parts.forEach(([key, value]) => {
          entity[key] = value.replace('}', '').trim();
        });
        if (Object.keys(entity).length > 0) {
          entities.push(entity);
        }
      } else if (currentSection === 'relationships' && line.trim()) {
        const cleanedLine = line.replace(/[{}-]/g, '').trim();
        const parts = cleanedLine.split(',').map(part => part.split(':').map(p => p.trim()));
        const relationship = {};
        parts.forEach(([key, value]) => {
          relationship[key] = value.replace('}', '').trim();
        });
        if (Object.keys(relationship).length > 0) {
          relationships.push(relationship);
        }
      }
    }

    return { entities, relationships };
  }

  private async createEntities(entities: any[]): Promise<void> {
    for (const entity of entities) {
      try {
        await this.neo4jService.write(
          `MERGE (e:${entity.type} {name: $name}) RETURN e`,
          { name: entity.name }
        );
        this.eventsGateway.broadcastGraphUpdate({ action: 'create-entity', entity });
      } catch (error) {
        this.logger.error(`Failed to create entity: ${entity.name}`, error.stack);
      }
    }
  }

  private async createRelationships(relationships: any[]): Promise<void> {
    for (const relation of relationships) {
      const formattedRelation = relation.relation.replace(/\s+/g, '_').replace(/'/g, "\\'");
      try {
        await this.neo4jService.write(
          `MATCH (a {name: $source}), (b {name: $target})
           MERGE (a)-[r:${formattedRelation}]->(b)
           RETURN r`,
          { source: relation.source, target: relation.target }
        );
        this.eventsGateway.broadcastGraphUpdate({
          action: 'create-relationship',
          relation: { source: relation.source, target: relation.target, relation: relation.relation }
        });
      } catch (error) {
        this.logger.error(`Failed to create relationship from ${relation.source} to ${relation.target}`, error.stack);
      }
    }
  }

  async addNodeAndRelationship(source: string, sourceLabel: string, target: string, targetLabel: string, type: string): Promise<void> {
    const formattedType = type.replace(/\s+/g, '_');
    try {
      await this.neo4jService.write(
        `MERGE (a:${sourceLabel} {name: $source})
         MERGE (b:${targetLabel} {name: $target})
         MERGE (a)-[r:${formattedType}]->(b)
         RETURN a, b, r`,
        { source, target }
      );
      this.eventsGateway.broadcastGraphUpdate({
        action: 'create-relationship',
        relation: { source: source, target: target, relation: type }
      });
    } catch (error) {
      this.logger.error(`Failed to create node or relationship: ${source} -[${type}]-> ${target}`, error.stack);
    }
  }

  async deleteNode(name: string): Promise<any> {
    const result = await this.neo4jService.write(
      `MATCH (n {name: $name}) 
       DETACH DELETE n`,
      { name }
    );
    this.eventsGateway.broadcastGraphUpdate({ action: 'delete-node', name });
    return result;
  }

  async updateNodeRelationship(source: string, oldTarget: string, newTarget: string, newTargetLabel: string, relationshipType: string): Promise<void> {
    const formattedType = relationshipType.replace(/\s+/g, '_');
    try {
      await this.neo4jService.write(
        `MATCH (a {name: $source})-[r]->(b {name: $oldTarget})
         DELETE r
         WITH a
         MERGE (c:${newTargetLabel} {name: $newTarget})
         CREATE (a)-[newR:${formattedType}]->(c)
         WITH a, newR, c
         OPTIONAL MATCH (b {name: $oldTarget})
         RETURN a, b, newR, c`,
        { source, oldTarget, newTarget, newTargetLabel }
      );
      this.eventsGateway.broadcastGraphUpdate({ action: 'update-relationship', source, oldTarget, newTarget, newTargetLabel, relationshipType });
    } catch (error) {
      this.logger.error(`Failed to update relationship from ${source} to ${newTarget}`, error.stack);
    }
  }

  async getUniqueLabels(): Promise<string[]> {
    try {
      const result = await this.neo4jService.read(
        'MATCH (n) RETURN DISTINCT labels(n) as labels'
      );
      const labels = new Set<string>();
      result.records.forEach(record => {
        record.get('labels').forEach((label: string) => labels.add(label));
      });
      return Array.from(labels);
    } catch (error) {
      this.logger.error('Failed to get unique labels', error.stack);
      return [];
    }
  }

  async getGraphData(): Promise<any> {
    const nodes = await this.neo4jService.read(`MATCH (n) RETURN n`).then(res => res.records.map(record => record.get('n').properties));
    const links = await this.neo4jService.read(`MATCH (n)-[r]->(m) RETURN n, r, m`).then(res =>
      res.records.map(record => ({
        source: record.get('n').properties.name,
        target: record.get('m').properties.name,
        type: record.get('r').type
      }))
    );

    return { nodes, links };
  }
}
