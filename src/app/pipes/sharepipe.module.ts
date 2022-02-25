import { NgModule } from '@angular/core';
import { MomentPipe } from './moment.pipe';
import { DateFormatPipe } from './date';
import { TimeFormatPipe } from './time';

@NgModule({
	declarations: [
        MomentPipe,
        DateFormatPipe,
        TimeFormatPipe
	],
    imports: [],
    
    exports: [
        MomentPipe,
        DateFormatPipe,
        TimeFormatPipe
    ]
})

export class SharePipesModule {}