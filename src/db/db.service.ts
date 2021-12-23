import { Injectable } from '@nestjs/common';
import { Client } from 'pg';

@Injectable()
export class DbService {
    private readonly db:Client

    constructor(){
        this.db = new Client()
        this.db.connect()
    }

    public getDb(){
        return this.db
    }
}

