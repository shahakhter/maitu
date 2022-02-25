import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LiveAudioRoomPage } from './live-audio-room.page';

const routes: Routes = [
  {
    path: '',
    component: LiveAudioRoomPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LiveAudioRoomPageRoutingModule {}
