import { Body, Controller, Get, Post, HttpException, Query } from '@nestjs/common';
import { CarsService } from './cars.service';


@Controller('cars')
export class CarsController {
    constructor(private carsService:CarsService){}
    @Get() //get test
    getHello(){
        return 'Hello World!'
    }
    
    @Post('/rent-session')
    async makeRentSession(@Body() body){
        try {
            return await this.carsService.makeRentSession(body.carId, body.startDate, body.endDate);
        } catch (e) {
            throw new HttpException(e.message, 400);
        };

    }
    @Get('/rent-session/cost')
    async getCost(@Query() query){
        try {
            return this.carsService.getCost(query.startDate, query.endDate);
        } catch (e) {
            throw new HttpException(e.message, 400);
        };
        
    }
}