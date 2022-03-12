import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Router } from '@angular/router';
import { ActionSheetController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { UtilityService } from 'src/app/services/utility';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

  dummyNotifications = Array(10);
  notificationList = [];
  followingCount;
  displayName;
  photoURL;
  currentUserId;

  constructor(
    public router: Router,
    public db: AngularFireDatabase,
    public util: UtilityService,
    public actionSheetCtrl: ActionSheetController,
    public authService: AuthService,
    public toastCtrl: ToastController
  ) {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.currentUserId = user.uid
        this.loaduserdetails(user.uid);
        this.getNotices(user.uid);
      }
    })
  }

  view(item) {
    if (item.type === 'feed') {
      this.router.navigate(['/feed-details', {
        postId: item.postId,
        userId: item.ownerId
      }])
      firebase.database().ref('notices').child(item.id).update({ read: true })
    }

    else if (item.type === 'photo-like') {
      firebase.database().ref('notices').child(item.id).update({ read: true })
    }

    else if (item.type === 'chat') {
      this.chatWithUser(item.displayName, item.senderId);
      firebase.database().ref('notices').child(item.id).update({ read: true })
    }

    else if (item.type === 'feed-like') {
      this.router.navigate(['/feed-details', {
        postId: item.postId,
        userId: item.ownerId
      }])
      firebase.database().ref('notices').child(item.id).update({ read: true })
    }

    else if (item.type === 'follow') {
      this.router.navigate(['/user-details', {
        id: item.postId
      }])
      firebase.database().ref('notices').child(item.id).update({ read: true })
    }

    else if (item.type === 'followback') {
      this.router.navigate(['/user-details', {
        id: item.postId
      }])
      firebase.database().ref('notices').child(item.id).update({ read: true })
    }
  }

  loaduserdetails(id) {
    this.authService.getUserDetails(id).then((res: any) => {
      this.followingCount = res.followingCount;
      this.displayName = res.displayName;
      this.photoURL = res.photoURL;
    })
  }

  getNotices(id) {
    firebase.database().ref('notices').orderByChild('ownerId').equalTo(id).on('value', snapshot => {
      this.notificationList = [];
      snapshot.forEach(snap => {
        this.notificationList.push({
          id: snap.key,
          read: snap.val().read,
          typer: snap.val().typer,
          fcm_token: snap.val().fcm_token,
          senderId: snap.val().senderId,
          displayName: snap.val().displayName,
          ownerId: snap.val().ownerId,
          followersCount: snap.val().followersCount,
          time: snap.val().time,
          photoURL: snap.val().photoURL,
          type: snap.val().type,
          postId: snap.val().postId
        });
      });
      this.dummyNotifications = Array(0);
    });
  }

  ngOnInit() {
  }

  async actionUnseenFollow(id, item) {
    const actionSheet = await this.actionSheetCtrl.create({
      //header: 'Albums',
      buttons: [{
        icon: 'mail-open-outline',
        text: 'Mark as Read',
        cssClass: 'ActionButton',
        handler: () => {
          firebase.database().ref('notices').child(id).update({
            read: true
          })
        }
      }, {
        icon: 'people-outline',
        text: 'Follow Back',
        cssClass: 'ActionButton',
        handler: () => {
          firebase.database().ref('notices').child(id).remove().then(function () { })
          let index = this.notificationList.indexOf(item);
          if (index > -1) {
            this.notificationList.splice(index, 1);
          }
        }
      }, {
        icon: 'ban-outline',
        text: 'Ignore',
        cssClass: 'ActionButton',
        handler: () => {
          firebase.database().ref('notices').child(id).remove().then(function () { })
          let index = this.notificationList.indexOf(item);
          if (index > -1) {
            this.notificationList.splice(index, 1);
          }
        }
      }, {
        icon: 'trash-outline',
        text: 'Delete',
        cssClass: 'ActionButton',
        handler: () => {
          firebase.database().ref('notices').child(id).remove().then(function () { })
          let index = this.notificationList.indexOf(item);
          if (index > -1) {
            this.notificationList.splice(index, 1);
          }
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

  async actionSeen(id, item) {
    const actionSheet = await this.actionSheetCtrl.create({
      //header: 'Albums',
      buttons: [{
        icon: 'mail-unread-outline',
        text: 'Mark as unread',
        cssClass: 'ActionButton',
        handler: () => {
          firebase.database().ref('notices').child(id).update({
            read: false
          })
        }
      }, {
        icon: 'trash-outline',
        text: 'Delete',
        cssClass: 'ActionButton',
        handler: () => {
          firebase.database().ref('notices').child(id).remove().then(function () { })
          let index = this.notificationList.indexOf(item);
          if (index > -1) {
            this.notificationList.splice(index, 1);
          }
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

  async actionUnseen(id, item) {
    const actionSheet = await this.actionSheetCtrl.create({
      //header: 'Albums',
      buttons: [{
        icon: 'mail-open-outline',
        text: 'Mark as Read',
        cssClass: 'ActionButton',
        handler: () => {
          firebase.database().ref('notices').child(id).update({
            read: true
          })
        }
      }, {
        icon: 'trash-outline',
        text: 'Delete',
        cssClass: 'ActionButton',
        handler: () => {
          firebase.database().ref('notices').child(id).remove().then(function () { })
          let index = this.notificationList.indexOf(item);
          if (index > -1) {
            this.notificationList.splice(index, 1);
          }
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

  async actionSeenFollow(id, item) {
    const actionSheet = await this.actionSheetCtrl.create({
      //header: 'Albums',
      buttons: [{
        icon: 'mail-unread-outline',
        text: 'Mark as unread',
        cssClass: 'ActionButton',
        handler: () => {
          firebase.database().ref('notices').child(id).update({
            read: false
          })
        }
      }, {
        icon: 'people-outline',
        text: 'Follow Back',
        cssClass: 'ActionButton',
        handler: () => {
          firebase.database().ref('notices').child(id).remove().then(function () { })
          let index = this.notificationList.indexOf(item);
          if (index > -1) {
            this.notificationList.splice(index, 1);
          }
        }
      }, {
        icon: 'ban-outline',
        text: 'Ignore',
        cssClass: 'ActionButton',
        handler: () => {
          firebase.database().ref('notices').child(id).remove().then(function () { })
          let index = this.notificationList.indexOf(item);
          if (index > -1) {
            this.notificationList.splice(index, 1);
          }
        }
      }, {
        icon: 'trash-outline',
        text: 'Delete',
        cssClass: 'ActionButton',
        handler: () => {
          firebase.database().ref('notices').child(id).remove().then(function () { })
          let index = this.notificationList.indexOf(item);
          if (index > -1) {
            this.notificationList.splice(index, 1);
          }
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

  chatWithUser(displayName, userId) {
    this.router.navigate(['/message-chat', {
      displayName: displayName,
      userId: userId,
    }])
  }

  followBack(key, item) {
    //if (this.af.currentUser) {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.db
          .object("/users/" + firebase.auth().currentUser.uid + "/following/" + key)
          .update({
            photoURL: item.photoURL,
            displayName: item.firstName,
            uid: key
          })
          .then(res => {
            firebase.database().ref("/users/" + firebase.auth().currentUser.uid).update({
              followingCount: this.followingCount + 1
            })
            this.db
              .object("/users/" + key + "/followers/" + firebase.auth().currentUser.uid)
              .update({
                photoURL: this.photoURL,
                displayName: this.displayName,
                uid: firebase.auth().currentUser.uid,
              })
            firebase.database().ref("/users/" + key).update({
              followersCount: item.followersCount + 1
            })
            this.createToaster("You are now connected with " + item.displayName, "3000");
          });
        this.util.sendNotification(`${this.displayName} connected with you back`, 'Maitu', item.fcm_token, firebase.auth().currentUser.uid).subscribe((data) => {
          console.log('send notifications', data);
        }, error => {
          console.log(error);
        });
        firebase.database().ref('notices').push({
          read: false,
          senderId: firebase.auth().currentUser.uid,
          displayName: this.displayName,
          ownerId: key,
          postId: firebase.auth().currentUser.uid,
          time: firebase.database.ServerValue.TIMESTAMP,
          photoURL: this.photoURL,
          type: 'followback'
        })
        firebase.database().ref('notices').child(item.id).update({ typer: 'confirm' })
      } else {
        //this.createToaster("please login first", "3000");
        this.router.navigate(['/login'])
      }
    })
  }

  async createToaster(message, duration) {
    let toast = await this.toastCtrl.create({
      message: message,
      duration: duration,
      position: 'top',
    });
    toast.present();
  }

  ignoreBack(id, item) {
    firebase.database().ref('notices').child(id).remove().then(function () { })
    let index = this.notificationList.indexOf(item);
    if (index > -1) {
      this.notificationList.splice(index, 1);
    }
  }

}
