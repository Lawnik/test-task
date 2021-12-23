import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
@Injectable()
export class CarsService {
    constructor(private dbService:DbService){}

    public async makeRentSession(carId, startDate, endDate){
        this.validateWeekends(startDate, endDate);
        const days = this.getDiffDate(startDate, endDate);
        this.checkIs30daysLimit(days + 1);
        const cost = this.calcCost(days + 1);

        const db = this.dbService.getDb();
        const lastRentSessionByCarId = await this.getLastRentSessionByCarId(carId);
        if (lastRentSessionByCarId.end_date) {
            this.checkIsNoRentSessionDateOverlaping(startDate,lastRentSessionByCarId.start_date, lastRentSessionByCarId.end_date);
            this.checkIsNoRentSessionDateOverlaping(endDate,lastRentSessionByCarId.start_date, lastRentSessionByCarId.end_date);
            const daysBetweenCarRentSessions = this.getDiffDate(lastRentSessionByCarId.end_date, startDate);
            if (daysBetweenCarRentSessions <= 3) {
                throw new Error('Must being 3 days between rent sessions for this car');
            }
        }
        const rentSessionsResult = await db.query("SELECT * FROM rent_session");
        const id = rentSessionsResult.rowCount + 1;
        const query = 'INSERT INTO rent_session (id, car_id, start_date, end_date) VALUES ($1, $2, $3, $4);'
        const values = [id, carId, startDate, endDate]
        await db.query(query, values);
        return {
            carId, startDate, endDate, id, cost
        };
    }

    public async getLastRentSessionByCarId(carId) {
        const db = this.dbService.getDb();
        const result = await db.query("SELECT * FROM rent_session WHERE car_id = $1 ORDER BY end_date DESC LIMIT 1", [carId]);
        return result?.rows?.[0] || {};
    }

    public validateWeekends(startDate, endDate) {
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        if(startDateObj.getDay() == 6 || startDateObj.getDay() == 0) {
            throw new Error('Start date must be not weekend')

        }

        if(endDateObj.getDay() == 6 || endDateObj.getDay() == 0) {
            throw new Error('End date must be not weekend')
        }

        return true;
    }

    public checkIs30daysLimit(days) {
        if(days > 30){
            throw new Error('Rent session must be less or equal 30 days')
        };
        return true;
    }

    public getDiffDate(startDate,endDate){
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        
        const diffTime = Math.abs(endDateObj.getTime() - startDateObj.getTime());
        const diffDate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDate;
    }

    public checkIsNoRentSessionDateOverlaping(date, firstDate, secondDate) {
        const dateObj = new Date(date);
        const firstDateObj = new Date(firstDate);
        const secondDateObj = new Date(secondDate);

        if (dateObj.getTime() >= firstDateObj.getTime() && dateObj.getTime() <= secondDateObj.getTime()) {
            throw new Error('This time intrval overlaps the other');
        }

        return true;
    }

    public calcCost(days){
        let cost = 0;
        const rate = 1000;
        for (let i = 1; i <= days; i++) {
          if (i <= 4) {
            cost += rate;
          } else if (i <= 9) {
            cost += rate * 0.95;
          } else if (i <= 17) {
            cost += rate * 0.9;
          } else if (i <= 29) {
            cost += rate * 0.85;
          } else {
            cost += rate;
          }
        }
      
        return cost;
    }

    public getCost(startDate, endDate) {
        this.validateWeekends(startDate, endDate);
        const days = this.getDiffDate(startDate, endDate);
        this.checkIs30daysLimit(days + 1);
        return this.calcCost(days + 1);
    }
}

