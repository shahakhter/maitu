import { Injectable, Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'TimeFormat'
})
@Injectable()
export class TimeFormatPipe implements PipeTransform {
    // DateFormatPipe
    // Show moment.js dateFormat for time elapsed.
    transform(date: any, args?: any): any {
        if (moment(date).isSame(Date.now(), 'day')) {
            return moment(new Date(date)).format('hh:mm A');
        }
        else {
            return moment(new Date(date)).format('dddd');
        }
    }
}