import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService {
  constructor(
    private readonly configService: ConfigService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async clearTestDB() {
    if (
      this.configService.get('NODE_ENV') === 'test' &&
      this.connection.db.databaseName.includes('test')
    ) {
      return this.connection
        .dropDatabase()
        .then()
        .catch();
        // .then(() => console.log('dropped test database'))
        // .catch((err) => console.log('error dropping test database', err));
    } else {
      throw new Error(
        'cannot drop database. Ensure to set NODE_ENV=test in environment variables and include keyword "test" in database name',
      );
    }
  }
}
