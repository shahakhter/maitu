import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxAgoraModule, AgoraConfig } from 'ngx-agora';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { AngularFireAuthModule } from "@angular/fire/compat/auth";
import { AngularFireDatabaseModule } from "@angular/fire/compat/database";
import { AngularFireStorageModule } from "@angular/fire/compat/storage";
import { AngularFireModule } from "@angular/fire/compat";
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import * as firebase from 'firebase/app';
import { firebaseConfig } from "./firebase.config";
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { SuperTabsModule } from '@ionic-super-tabs/angular';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Facebook } from '@ionic-native/facebook/ngx';

firebase.initializeApp(firebaseConfig);

const agoraConfig: AgoraConfig = {
  AppID: 'ca684964104241ffadd816aad17be4b8'
};

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(),
    SuperTabsModule.forRoot(),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    AngularFirestoreModule,
    NgxAgoraModule.forRoot(agoraConfig),
    AppRoutingModule,
    LazyLoadImageModule
  ],
  providers: [
    OneSignal,
    SplashScreen,
    StatusBar,
    PhotoViewer,
    EmailComposer,
    NativeAudio,
    AndroidPermissions,
    Geolocation,
    Camera,
    LocationAccuracy,
    SocialSharing,
    Network,
    Facebook,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
