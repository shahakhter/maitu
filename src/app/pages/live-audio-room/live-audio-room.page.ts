import { Component, OnInit } from '@angular/core';
import { NavController, PopoverController } from '@ionic/angular';
import {
  AgoraClient,
  ClientEvent,
  NgxAgoraService,
  Stream,
  StreamEvent,
} from 'ngx-agora';
import { AudioRoomPopoverComponent } from 'src/app/components/audio-room-popover/audio-room-popover.component';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';

@Component({
  selector: 'app-live-audio-room',
  templateUrl: './live-audio-room.page.html',
  styleUrls: ['./live-audio-room.page.scss'],
})
export class LiveAudioRoomPage implements OnInit {

  localCallId = 'agora_local';
  remoteCalls: string[] = [];
  mute: boolean = false;
  haveILiked: boolean = false;

  userKey;

  config = {
    mode: 'rtc',
    codec: 'vp8',
    AppID: 'ca684964104241ffadd816aad17be4b8',
  };

  mydisplayName;
  myphotoURL;
  isLoading: boolean = false;
  joined: boolean = false;

  users = [];

  private client: AgoraClient;
  private localStream: Stream;
  private uid: string;

  constructor(
    private ngxAgoraService: NgxAgoraService,
    private navCtrl: NavController,
    private popover: PopoverController,
    private androidPermissions: AndroidPermissions,
  ) {

    this.checkRecordPermission();

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.uid = user.uid;
        this.getCurrentUser(user.uid);
      }
    });

    console.log(this.uid)
    this.getLiveUsers();
  }

  getLiveUsers() {
    firebase.database().ref('audio_room').on('value', (snapshot) => {
      let items = [];
      snapshot.forEach(user => {
        let item = user.val();
        items.push(item);
      });
      this.users = items;
    })
  }

  getCurrentUser(myId) {
    return firebase.database().ref('users/' + myId).once('value', (snapshot) => {
      this.mydisplayName = snapshot.val().firstName;
      this.myphotoURL = snapshot.val().photoURL;
    })
  }

  checkRecordPermission() {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.RECORD_AUDIO).then(
      result => {
        if (result.hasPermission) {
          //permission granted
          this.checkModifySettingsPermission();
        } else {
          //If not having permission ask for permission
          this.requestRecordPermission();
        }
      },
      err => {
        alert(err);
      }
    );
  }

  checkModifySettingsPermission() {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.MODIFY_AUDIO_SETTINGS).then(
      result => {
        if (result.hasPermission) {
          //permission granted
        } else {
          //If not having permission ask for permission
          this.requestModifySettingsPermission();
        }
      },
      err => {
        alert(err);
      }
    );
  }

  requestRecordPermission() {
    //Show 'GPS Permission Request' dialogue
    this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.RECORD_AUDIO)
      .then(
        () => {
          // permission granted
          this.checkModifySettingsPermission();
        },
        error => {
          //Show alert if user click on 'No Thanks'
          console.log('permissions ' + error)
        }
      );
  }

  requestModifySettingsPermission() {
    //Show 'GPS Permission Request' dialogue
    this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.MODIFY_AUDIO_SETTINGS)
      .then(
        () => {
          // permission granted 
        },
        error => {
          //Show alert if user click on 'No Thanks'
          console.log('permissions ' + error)
        }
      );
  }

  PushToconsole() {
    console.log(this.ngxAgoraService.audioDevices);
    console.log(this.ngxAgoraService.videoDevices);
    console.log(this.remoteCalls);
  }

  ngOnInit() {
    console.log('1. Create Client');
    this.client = this.ngxAgoraService.createClient({ mode: 'rtc', codec: 'vp8' });

    console.log('2. Assign Client Handlers');
    this.assignClientHandlers();

    console.log('3. Create Stream');
    this.localStream = this.ngxAgoraService.createStream({
      streamID: this.uid,
      audio: true,
      video: false,
      screen: false,
    });
    console.log(this.localStream);

    console.log('4. Assign Local Stream Handlers');
    this.assignLocalStreamHandlers();
  }

  joinAudioRoom() {
    this.isLoading = true;

    // Join and publish methods added in this step
    console.log('5. Join & Publish Triggers');
    this.initLocalStream(() =>
      this.join(
        (uid) => {
          this.publish();
          firebase.database().ref('audio_room').child(this.uid).set({
            displayName: this.mydisplayName,
            photoURL: this.myphotoURL,
            mute: false,
            uid: this.uid,
            haveILiked: false,
          });
          this.joined = true;
        },
        (error) => console.error(error)
      )
    );

  }

  /**
   * Attempts to connect to an online chat room where users can host and receive A/V streams.
   */
  join(
    onSuccess?: (uid: string) => void,
    onFailure?: (error: Error) => void
  ): void {
    this.client.join(null, 'maitu', this.uid, onSuccess, onFailure);
  }

  /**
   * Attempts to upload the created local A/V stream to a joined chat room.
   */
  publish(): void {
    this.client.publish(this.localStream, (err) =>
      console.log('Publish local stream error: ' + err)
    );
  }

  private assignClientHandlers(): void {
    this.client.on(ClientEvent.LocalStreamPublished, (evt) => {
      console.log('Publish local stream successfully');
    });

    this.client.on(ClientEvent.Error, (error) => {
      console.log('Got error msg:', error.reason);
      if (error.reason === 'DYNAMIC_KEY_TIMEOUT') {
        this.client.renewChannelKey(
          '',
          () => console.log('Renewed the channel key successfully.'),
          (renewError) =>
            console.error('Renew channel key failed: ', renewError)
        );
      }
    });

    this.client.on(ClientEvent.RemoteStreamAdded, (evt) => {
      console.log('-- Remote Stream Added');
      const stream = evt.stream as Stream;
      this.client.subscribe(stream, { audio: true, video: false }, (err) => {
        console.log('Subscribe stream failed', err);
      });
    });

    this.client.on(ClientEvent.RemoteStreamSubscribed, (evt) => {
      console.log('-- Remote Stream Subcribed');
      const stream = evt.stream as Stream;
      const id = this.getRemoteId(stream);
      if (!this.remoteCalls.length) {
        this.remoteCalls.push(id);
        setTimeout(() => stream.play(id), 1000);
      }
    });

    this.client.on(ClientEvent.RemoteStreamRemoved, (evt) => {
      console.log('-- Remote Stream Removed');
      const stream = evt.stream as Stream;
      if (stream) {
        stream.stop();
        this.remoteCalls = [];
        console.log(`Remote stream is removed ${stream.getId()}`);
      }
    });

    this.client.on(ClientEvent.PeerLeave, (evt) => {
      const stream = evt.stream as Stream;
      if (stream) {
        stream.stop();
        this.remoteCalls = this.remoteCalls.filter(
          (call) => call !== `${this.getRemoteId(stream)}`
        );
        console.log(`${evt.uid} left from this channel`);
      }
    });
  }

  private assignLocalStreamHandlers(): void {
    this.localStream.on(StreamEvent.MediaAccessAllowed, () => {
      console.log('accessAllowed');
    });

    // The user has denied access to the camera and mic.
    this.localStream.on(StreamEvent.MediaAccessDenied, () => {
      console.log('accessDenied');
    });
  }

  private initLocalStream(onSuccess?: () => any): void {
    this.localStream.init(
      () => {
        // The user has granted access to the camera and mic.
        this.localStream.play(this.localCallId);
        if (onSuccess) {
          onSuccess();
        }
      },
      (err) => console.error('getUserMedia failed', err)
    );
  }

  private getRemoteId(stream: Stream): string {
    return `agora_remote-${stream.getId()}`;
  }

  toggleMute(item) {
    if (this.mute) {
      this.Unmute(item);
    }
    else {
      this.Mute(item);
    }
  }

  ionViewDidLeave() {
    console.log('ionViewDidLeave');
    this.goBack();
  }

  toggleLike(item) {
    if (this.joined) {
      if (this.haveILiked) {
        firebase.database().ref('audio_room').child(item).update({ haveILiked: false }).then(() => {
          this.haveILiked = false;
        });
      }
      else {
        firebase.database().ref('audio_room').child(item).update({ haveILiked: true }).then(() => {
          this.haveILiked = true;
        });
      }
    }
  }

  private Mute(item) {
    this.localStream.muteAudio();
    firebase.database().ref('audio_room').child(item).update({ mute: true }).then(() => {
      this.mute = true;
    });
  }

  private Unmute(item) {
    this.localStream.unmuteAudio();
    firebase.database().ref('audio_room').child(item).update({ mute: false }).then(() => {
      this.mute = false;
    });
  }

  private leave() {
    this.client.stopLiveStreaming;
    this.client.leave(
      () => {
        console.log('Leavel channel successfully');
      },
      (err) => {
        console.log('Leave channel failed');
      }
    );
  }

  private joinAgain() {
    console.log('5. Join & Publish Triggers');
    this.join(
      (uid) => this.publish(),
      (error) => console.error(error)
    );
  }

  goBack() {
    if (this.joined) {
      this.leave();
      firebase.database().ref('audio_room').child(this.uid).remove().then(function () { })
      let index = this.users.indexOf(this.uid);
      if (index > -1) {
        this.users.splice(index, 1);
      }
    }
    return this.navCtrl.pop();
  }

  async presentPopover(ev: any) {
    const popover = await this.popover.create({
      component: AudioRoomPopoverComponent,
      //cssClass: 'popover',
      event: ev,
      translucent: true,
      mode: 'md'
    });
    await popover.present();

    const { role } = await popover.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

}
