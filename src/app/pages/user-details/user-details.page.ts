import { Component, OnInit } from '@angular/core';
import { ActionSheetController, AlertController, LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFireDatabase, AngularFireObject } from "@angular/fire/compat/database";
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilityService } from 'src/app/services/utility';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';
import { AuthService } from 'src/app/services/auth.service';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.page.html',
  styleUrls: ['./user-details.page.scss'],
})
export class UserDetailsPage implements OnInit {

  id: any;
  isFollowing: boolean = false;
  public users: any = {};
  user: AngularFireObject<any>;
  currentUserId;
  followingCount;

  displayName;
  photoURL;
  refPostPhoto;
  shops = [];
  fcm_token;
  //public gridImages:Array<any>;
  myfcm_token;
  feedPhoto = [];
  dummyBook = Array(10);
  zoom: number = 12;
  slideOptions = {
    zoom: true
  };

  constructor(
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public af: AngularFireAuth,
    public db: AngularFireDatabase,
    public emailComposer: EmailComposer,
    public route: ActivatedRoute,
    public alertCtrl: AlertController,
    public modalController: ModalController,
    public util: UtilityService,
    public router: Router,
    public socialSharing: SocialSharing,
    public authService: AuthService,
    public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    private photoViewer: PhotoViewer,
  ) {
    this.id = this.route.snapshot.paramMap.get('id');
    this.user = db.object("/users/" + this.id);
    this.user.valueChanges().subscribe((data: any) => {
      if (data != null) {
        this.users = data;
        this.users["$key"] = this.id;
      }

      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          this.currentUserId = user.uid
          this.loaduserdetails(user.uid);
          this.db
            .object(
              "/users/" + this.currentUserId + "/following/" + this.id
            )
            .valueChanges()
            .subscribe((res: any) => {
              console.log("fav response--", res);
              if (res != null) {
                this.isFollowing = true;
              } else {
                this.isFollowing = false;
              }
            });
        }
      })

    });
   }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.pop();
  }

  reportUser(username) {
    let email = {
      to: 'feedback@maitu.com',
      subject: 'Report',
      body: 'Hello Maitu, I notice the following user <b>' + username + '</b> is violating the app Terms of Service.<br/><br/>Thank you',
      isHtml: true
    };

    this.emailComposer.open(email);
  }

  loaduserdetails(id) {
    this.authService.getUserDetails(id).then((res: any) => {
      this.followingCount = res.followingCount;
      this.displayName = res.displayName;
      this.photoURL = res.photoURL;
      this.myfcm_token = res.fcm_token
      //console.log(this.followingCount)
    })
  }

  viewImage(image) {
    this.photoViewer.show(image, null, { share: true });
  }

  addToFevrt(key, followersCount, username) {
    //if (this.af.currentUser) {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.db
          .object("/users/" + this.currentUserId + "/following/" + key)
          .update({
            photoURL: this.users.photoURL,
            displayName: this.users.firstName,
            uid: this.id
          })
          .then(res => {
            firebase.database().ref("/users/" + this.currentUserId).update({
              followingCount: this.followingCount + 1
            })
            this.db
              .object("/users/" + key + "/followers/" + this.currentUserId)
              .update({
                photoURL: this.photoURL,
                displayName: this.displayName,
                uid: this.currentUserId,
              })
            firebase.database().ref("/users/" + key).update({
              followersCount: followersCount + 1
            })
            this.isFollowing = true;
            this.createToaster("You are now following " + username, "3000");
          });
        this.authService.getUserDetails(key).then((res: any) => {
          this.fcm_token = res.fcm_token;
        })
        this.util.sendNotification(`${this.displayName} is following you`, 'Maitu', this.fcm_token, this.currentUserId).subscribe((data) => {
          console.log('send notifications', data);
        }, error => {
          console.log(error);
        });
        firebase.database().ref('notices').push({
          read: false,
          senderId: this.currentUserId,
          displayName: this.displayName,
          ownerId: key,
          fcm_token: this.myfcm_token,
          postId: this.currentUserId,
          typer: 'follow',
          followersCount: followersCount,
          time: firebase.database.ServerValue.TIMESTAMP,
          photoURL: this.photoURL,
          type: 'follow'
        })
      } else {
        //this.createToaster("please login first", "3000");
        this.router.navigate(['/login'])
      }
    })
  }

  removeFevrt(key, followersCount, username) {
    if (this.af.currentUser) {
      this.db
        .object("/users/" + this.currentUserId + "/following/" + key)
        .remove()
        .then(() => {
          firebase.database().ref("/users/" + this.currentUserId).update({
            followingCount: this.followingCount - 1
          })
          this.db
            .object("/users/" + key + "/followers/" + this.currentUserId).remove()
          firebase.database().ref("/users/" + key).update({
            followersCount: followersCount - 1
          })
          this.isFollowing = false;
          this.createToaster("You have unfollowed " + username, "3000");
        });
    }
  }

  getPhotoGallery() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.refPostPhoto = firebase.database().ref('/photo_list').orderByChild('userId').equalTo(this.id);
    this.refPostPhoto.once('value', snapshot => {
      this.feedPhoto = snapshot.val();
    });
  }

  async createToaster(message, duration) {
    let toast = await this.toastCtrl.create({
      message: message,
      duration: duration,
      position: 'top'
    });
    toast.present();
  }

  chatWithUser(displayName, userId) {
    firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        console.log("not login");
        this.router.navigate(['/login'])
      } else {
        this.router.navigate(['/message-chat', {
          displayName: displayName,
          userId: userId,
          firstText: 'true',
        }])
      }
    })
  }

}
