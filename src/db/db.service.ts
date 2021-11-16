import { Injectable } from '@nestjs/common';
const { Client } = require('pg');

@Injectable()
export class DbService {

  getClient() {
    const client = new Client({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT,
    });
    client.connect();
    return client;

  }
}