// src/users/user.entity.ts
export class User {
    id: number;
    username: string;
    password: string;
  
    constructor(record?: any) {
      if (record) {
        this.username = record.properties.username;
        this.password = record.properties.password;
      }
    }
  }
  