import { Component } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { Router } from '@angular/router';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { Network } from '@ionic-native/network/ngx';
import { UtilityService } from './services/utility';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  disconnectSubscription;
  connectSubscription;
  networkAlert;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private nativeAudio: NativeAudio,
    public fireAuth: AngularFireAuth,
    private _location: Location,
    private alertController: AlertController,
    private oneSignal: OneSignal,
    private statusBar: StatusBar,
    private router: Router,
    private network: Network,
    private util: UtilityService,
  ) {
    this.initApp();
  }

  initApp() {

    this.platform.ready().then(() => {
      this.statusBar.overlaysWebView(false);
      this.statusBar.backgroundColorByHexString('#DF236C');
      this.statusBar.styleLightContent();

      setTimeout(() => {
        this.splashScreen.hide();
      }, 1000);



      this.checkInternetConnection();

      this.fireAuth.onAuthStateChanged(user => {
        if (user) {
          var myStatusRef = firebase.database().ref('users').child(user.uid).child('status');

          var contactRef = firebase.database().ref('.info/connected');
          contactRef.on('value', function (snap) {
            if (snap.val() === true) {
              var con = myStatusRef;

              con.onDisconnect().remove();

              con.set('online');

              myStatusRef.onDisconnect().set('offline')
            }
          })
          document.onvisibilitychange = (e) => {
            if (document.visibilityState === 'hidden') {
              myStatusRef.set('away')
            } else {
              myStatusRef.set('online')
            }
          }
        }
      });


      console.log('appid', environment.onesignal.appId);
      console.log('googlenumnner', environment.onesignal.googleProjectNumber);
      setTimeout(async () => {
        await this.oneSignal.startInit(environment.onesignal.appId, environment.onesignal.googleProjectNumber);
        this.oneSignal.getIds().then((data) => {
          console.log('iddddd', data);
          localStorage.setItem('fcm', data.userId);
        }, error => {
          console.log('error', JSON.stringify(error));
        }).catch(error => {
          console.log('error', JSON.stringify(error));
        });
        await this.oneSignal.endInit();
      }, 1000);
      this.oneSignal.handleNotificationReceived().subscribe(data => {
        console.log('got order', data);
        //this.nativeAudio.play('audio', () => console.log('audio is done playing')).catch(error => console.log(error));
        //this.nativeAudio.setVolumeForComplexAsset('audio', 1);
        //this.presentActionSheet();
      });
      this.oneSignal.handleNotificationOpened().subscribe((jsonData) => {
        if (jsonData.notification.payload.additionalData.name && jsonData.notification.payload.additionalData.id) {
          this.router.navigate(['/message-chat', {
            displayName: jsonData.notification.payload.additionalData.name,
            userId: jsonData.notification.payload.additionalData.id,
          }]);
        }
        else if (jsonData.notification.payload.additionalData.uid) {
          this.router.navigate(['/user-details', {
            id: jsonData.notification.payload.additionalData.uid
          }]);
        }
      });
      this.oneSignal.inFocusDisplaying(2);

      /*this.platform.backButton.subscribe(async () => {
        console.log('asd', this.router.url, 'ad', this.router.isActive('/tabs/', true))
        if (this.router.url.includes('/tabs/') || this.router.url.includes('/login')) {
          navigator['app'].exitApp();
        }
      });*/

      this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {
        console.log('Back press handler!');
        if (this._location.isCurrentPathEqualTo('/tabs/tab1') || this._location.isCurrentPathEqualTo('/tabs/tab2') || this._location.isCurrentPathEqualTo('/tabs/tab3') || this._location.isCurrentPathEqualTo('/tabs/notifications') || this._location.isCurrentPathEqualTo('/payment')) {

          // Show Exit Alert!
          console.log('Show Exit Alert!');
          this.showExitConfirm();
          processNextHandler();
        } else {

          // Navigate to back page
          console.log('Navigate to back page');
          this._location.back();

        }

      });

      this.platform.backButton.subscribeWithPriority(5, () => {
        console.log('Handler called to force close!');
        this.alertController.getTop().then(r => {
          if (r) {
            navigator['app'].exitApp();
          }
        }).catch(e => {
          console.log(e);
        })
      });

    });
  }

  checkInternetConnection() {
    this.disconnectSubscription = this.network.onDisconnect().subscribe(async () => {
      console.log('network was disconnected :-(');
      this.networkAlert = await this.util.createAlert();
      this.networkAlert.present();
    });
    this.connectSubscription = this.network.onConnect().subscribe(() => {
      console.log('network connected!');
      if (this.networkAlert) {
        this.networkAlert.dismiss();
      }
    });
  }


  showExitConfirm() {
    this.alertController.create({
      header: 'Exit App',
      message: 'Do you want to close the app?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Stay',
          role: 'cancel',
          handler: () => {
            console.log('Alert Dismissed!');
          }
        },
        {
          text: 'Exit',
          handler: () => {
            navigator['app'].exitApp();
          }
        }
      ]
    })
      .then(alert => {
        alert.present();
      });
  }
}
