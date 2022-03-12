import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MessageChatPage } from './message-chat.page';

const routes: Routes = [
  {
    path: '',
    component: MessageChatPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MessageChatPageRoutingModule {}
