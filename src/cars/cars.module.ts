import { Module } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';


@Module({
  providers: [CarsService,DbService],
  controllers: [CarsController]
})
export class CarsModule {}
