import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { Tab1PageRoutingModule } from './tab1-routing.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { GroupsComponent } from '../components/groups/groups.component';
import { WhatsHotComponent } from '../components/whats-hot/whats-hot.component';
import { SharePipesModule } from '../pipes/sharepipe.module';
import { SuperTabsModule } from '@ionic-super-tabs/angular';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SharePipesModule,
    SuperTabsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAoDJ4s8Sf-IdZrNNK58PTeTpmSr7KYAjw'
    }),
    ExploreContainerComponentModule,
    Tab1PageRoutingModule,
    LazyLoadImageModule,
    Ng2SearchPipeModule,
  ],
  declarations: [Tab1Page, GroupsComponent, WhatsHotComponent]
})
export class Tab1PageModule {}
