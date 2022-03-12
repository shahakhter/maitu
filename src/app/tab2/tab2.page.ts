import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';
import { Router } from '@angular/router';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { Tab3Page } from '../tab3/tab3.page';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  dummyMessages = Array(5);
  dummyConnections = Array(5);
  profileList: Observable<any[]>;
  lMsgList: Observable<any[]>;
  peerID: string;
  myuid: string;
  term;

  sub: any;

  contactsList = []

  constructor(private db: AngularFireDatabase,
    private afAuth: AngularFireAuth,
    public router: Router,
    private actionSheetCtrl: ActionSheetController,
    private emailComposer: EmailComposer,
    private modalCtrl: ModalController,
  ) {
    this.myuid = firebase.auth().currentUser.uid;
    this.lMsgList = this.db.list(`last-messages/${this.myuid}`)
      .valueChanges().pipe(map(changes => {
        changes.map(mkey => {
          console.log('last messages', mkey);
          //@ts-ignore
          this.db.object(`/messages/${mkey.lastmsg}`).valueChanges().subscribe(
            (x) => {
              //@ts-ignore
              mkey.lastmsg = x;
              //@ts-ignore
              console.log('messages', mkey.lastmsg);
            }
          )
        });
        // console.log('changes', changes);
        this.dummyMessages = [];
        return changes;
      }));

      firebase.database().ref('users/' + this.myuid + '/following').once('value', snapshot => {
        let items = [];
        snapshot.forEach(contact => {
          let item = contact.val();
          items.push(item);
        })
        this.contactsList = items;
        this.dummyConnections = Array(0);
      });
      console.log('contacts', this.contactsList)
  }

  ngOnInit() {
  }

  goMessage(key, lMsg) {
    if (lMsg.fromID != this.myuid) {
      console.log(lMsg.fromID);
      this.router.navigate(['/message-chat', {
        displayName: lMsg.fromName,
        userId: lMsg.fromID,
      }]);
      firebase.database().ref('messages')
        .orderByChild('fromID')
        .equalTo(lMsg.fromID)
        .once('value', function (snapshot) {
          snapshot.forEach(function (child) {
            child.ref.update({ read: true });
          });
        });
    } else {
      console.log(lMsg.fromID);
      this.router.navigate(['/message-chat', {
        displayName: lMsg.toName,
        userId: lMsg.toID,
      }]);
    }
  }

  chatWithUser(displayName, userId) {
    this.router.navigate(['/message-chat', {
      displayName: displayName,
      userId: userId,
    }])
  }

  goMyProfile() {
    this.router.navigate(['/my-profile']);
  }

  async presentActionSheetReport() {
    const actionSheet = await this.actionSheetCtrl.create({
      //header: 'Albums',
      buttons: [{
        icon: 'flag-outline',
        text: 'Report',
        cssClass: 'ActionButton',
        handler: () => {
          let email = {
            to: 'feedback@maitu.com',
            subject: 'Report',
            body: 'Hello Maitu, <br/> <b>I am having some issue with:<b/> <br>/(Please define your issue here).<br/><br/>Thank you',
            isHtml: true
          };

          this.emailComposer.open(email);
        }
      }, {
        icon: 'close-outline',
        text: 'Cancel',
        cssClass: 'ActionButton',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }

  async goPeoples() {
    const modal = await this.modalCtrl.create({
      component: Tab3Page,
    });
    modal.present();
  }
}
