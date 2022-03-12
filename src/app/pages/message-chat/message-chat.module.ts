import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MessageChatPageRoutingModule } from './message-chat-routing.module';
import { MessageChatPage } from './message-chat.page';
import { NgxEmojModule } from 'ngx-emoj';
import { SharePipesModule } from 'src/app/pipes/sharepipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgxEmojModule,
    IonicModule,
    SharePipesModule,
    MessageChatPageRoutingModule
  ],
  declarations: [MessageChatPage]
})
export class MessageChatPageModule {}
