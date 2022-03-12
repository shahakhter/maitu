import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  
  refNotify;
  notifyItems = [];

  activeHome = false;
  activeChats = false;
  activeProfile = false;
  activeSignal = false;

  constructor(
    private router: Router,
    private statusBar: StatusBar,
    private route: ActivatedRoute,
  ) {
    this.statusBar.overlaysWebView(false);
    this.statusBar.backgroundColorByName('white');
    this.statusBar.styleDefault();
    this.activeHome = true;
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.getNotices(user.uid);
      }
    });
  }

  changeIcon(page) {
    if (page == 'home') {
      this.activeHome = true;
      this.activeChats = false;
      this.activeProfile = false;
      this.activeSignal = false;

    }

    else if (page == 'chats') {
      this.activeChats = true;
      this.activeHome = false;
      this.activeProfile = false;
      this.activeSignal = false;
    }

    else if (page == 'profile') {
      this.activeProfile = true;
      this.activeChats = false;
      this.activeHome = false;
      this.activeSignal = false;
    }

    else if (page == 'signal') {
      // this.activeSignal = true;
      // this.activeProfile = false;
      // this.activeChats = false;
      // this.activeHome = false;
      this.router.navigate(['/live-audio-room']);
    }


    else {
      this.activeProfile = false;
      this.activeChats = false;
      this.activeHome = false;
      this.activeSignal = false;
    }
  }

  getNotices(id) {
    this.refNotify = firebase.database().ref('notices').orderByChild('ownerId').equalTo(id);
    this.refNotify.on('value', notifyList => {
      let notifysList = [];
      notifyList.forEach(feed => {
        let read = feed.val().read;
        if (read === false) {
          notifysList.push({
            favorId: feed.key,
          });
          this.notifyItems = notifysList;
          console.log('notices', this.notifyItems)
        }
      });
    });
  }

}
