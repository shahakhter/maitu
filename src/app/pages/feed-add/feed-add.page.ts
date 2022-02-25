import { Component, OnInit } from '@angular/core';
import {
  ToastController,
  ActionSheetController,
  ModalController, AlertController, LoadingController, NavController
} from '@ionic/angular';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Camera } from '@ionic-native/camera/ngx';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { UtilityService } from 'src/app/services/utility';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AddLocationPage } from '../add-location/add-location.page';
import * as _ from 'lodash';



@Component({
  selector: 'app-feed-add',
  templateUrl: './feed-add.page.html',
  styleUrls: ['./feed-add.page.scss'],
})

export class FeedAddPage implements OnInit {

  array1 = ["fuck", "no cursing", "sex", "porn", "shit", "ass", "bitch", "men are dogs", "men are dog", "men are evil", "devils", "ugly", "sale", "sell", "offer", "uza", "nunua", "follow my page", "follow page", "like my page", "like page", "http", "https", ".com", ".net", "www", "www.", "https://", "price", "prices", "$", "what drug can i use", "dawa", "medicine", "treatment", "dawa za kienyeji", "herbal medicine", "nudity", "nude", "violence", "products", "price", "services", "bale", "dead badies", "badies", "bodies", "dead bodies"];

  task: AngularFireUploadTask;
  cardImageBase64: string;
  images: Array<{ src: any, show: any, id: any }>;
  gif: any;

  percentage: Observable<number>;
  snapshot: Observable<any>;



  allPercentage: Observable<any>

  uploads: any[];

  loading;

  uid;
  GroupId;
  GroupName;
  isSensitive: boolean = false;
  isBanned: boolean = false;
  description: String = '';
  name;
  photo;
  imageResponse: Array<{ src: any }>;
  imageResponseSave: Array<{ src: any }>;
  location = '';
  latitude = '';
  longitude = '';
  city = '';
  videos: any;
  scaleFactor: number = 0.25;
  urlDownload;

  imagesList: Array<{ src: any }>;
  imageUpload: any;


  imageError: string;
  isImageSaved: boolean;
  //cardImageBase64: string;


  public gifImage;
  disableSubmit: boolean = false;
  hideAnnouncement: boolean;
  youtubelink = '';
  url;
  format;
  privacy;
  formatImage;
  selectedFile;
  imageUrl;


  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;

  downloadURLString: string;

  uploadVal = 0;


  myFiles: string[] = [];

  myForm = new FormGroup({
    // name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    file: new FormControl('', [Validators.required])
  });

  zoom: number = 12;



  constructor(public actionSheetCtrl: ActionSheetController, private fireAuth: AngularFireAuth,
    public alertCtrl: AlertController, public loadingCtrl: LoadingController,
    public router: Router, public camera: Camera, public storage: AngularFireStorage,
    public toastCtrl: ToastController, public util: UtilityService, private navCtrl: NavController,
    public modalCtrl: ModalController, public route: ActivatedRoute) {
    this.imageResponse = [];
    this.images = [];
    this.fireAuth.onAuthStateChanged(user => {
      if (user) {
        this.uid = user.uid;
        this.getInfo(user.uid);
      }
    });
    this.route.queryParams.subscribe(params => {
      if (params && params.GroupId) {
        this.GroupId = JSON.parse(params.GroupId);
        this.GroupName = JSON.parse(params.GroupName);
        console.log(this.GroupId, this.GroupName);
      }
    });
  }


  getInfo(uid) {
    firebase.database().ref('users/' + uid).once('value', (snapshot) => {
      this.name = snapshot.val().firstName;
      this.photo = snapshot.val().photoURL;
      if (snapshot.val().city != null) {
        this.city = snapshot.val().city;
      }
    });
  }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.pop();
  }


  // TEXT UPLOAD
  async addFeedTextOnly() {
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    // let user = firebase.auth().currentUser;
    // let userId = user.uid;
    firebase.database().ref('feeds').push({
      Score: 1,
      commentLength: 0,
      haveILiked: false,
      UserId: this.uid,
      //privacy: this.privacy,
      description: this.description,
      Date: firebase.database.ServerValue.TIMESTAMP,
      Name: this.name,
      Photo: this.photo,
      sensitive: this.isSensitive,
      groupId: this.GroupId,
      groupName: this.GroupName,
      city: this.city,
      // Verified: this.verified,
    }).then(newFeed => {
      //this.router.navigate(['/tabs/tab1'])
      //this.showToast('Post')
      this.loading.dismiss();
      this.navCtrl.pop();
    })
  }

  async addFeedImageOnly() {
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    // let user = firebase.auth().currentUser;
    // let userId = user.uid;
    firebase.database().ref('feeds').push({
      Score: 1,
      commentLength: 0,
      haveILiked: false,
      UserId: this.uid,
      Date: firebase.database.ServerValue.TIMESTAMP,
      Name: this.name,
      //privacy: this.privacy,
      images: this.imageResponse,
      Photo: this.photo,
      sensitive: this.isSensitive,
      groupId: this.GroupId,
      groupName: this.GroupName,
      city: this.city,
      // Verified: this.verified,
      // status: this.status,
    }).then(newFeed => {
      //this.router.navigate(['/tabs/tab1'])
      //this.showToast('Post')
      this.loading.dismiss();
      this.navCtrl.pop();
    })
  }




  async addFeedTextImage() {
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    //this.imageUpload =  this.startUploadImage()
    firebase.database().ref('feeds').push({
      Score: 1,
      commentLength: 0,
      haveILiked: false,
      UserId: this.uid,
      description: this.description,
      Date: firebase.database.ServerValue.TIMESTAMP,
      Name: this.name,
      //privacy: this.privacy,
      images: this.imageResponse,
      Photo: this.photo,
      sensitive: this.isSensitive,
      groupId: this.GroupId,
      groupName: this.GroupName,
      city: this.city,
    }).then(newFeed => {
      //this.router.navigate(['/tabs/tab1'])
      //this.showToast('Post')
      this.loading.dismiss();
      this.navCtrl.pop();
    })
  }

  async addFeedLocation() {
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    firebase.database().ref('feeds').push({
      Score: 1,
      commentLength: 0,
      haveILiked: false,
      UserId: this.uid,
      description: this.description,
      Date: firebase.database.ServerValue.TIMESTAMP,
      Name: this.name,
      location: this.location,
      latitude: this.latitude,
      longitude: this.longitude,
      Photo: this.photo,
      sensitive: this.isSensitive,
      groupId: this.GroupId,
      groupName: this.GroupName,
      city: this.city,
    }).then(newFeed => {
      //this.router.navigate(['/tabs/tab1'])
      //this.showToast('Post')
      this.loading.dismiss();
      this.navCtrl.pop();
    })
  }

  async addFeedTextLocation() {
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    firebase.database().ref('feeds').push({
      Score: 1,
      commentLength: 0,
      haveILiked: false,
      UserId: this.uid,
      description: this.description,
      Date: firebase.database.ServerValue.TIMESTAMP,
      Name: this.name,
      //privacy: this.privacy,
      location: this.location,
      latitude: this.latitude,
      longitude: this.longitude,
      Photo: this.photo,
      sensitive: this.isSensitive,
      groupId: this.GroupId,
      groupName: this.GroupName,
      city: this.city,
    }).then(newFeed => {
      //this.router.navigate(['/tabs/tab1'])
      //this.showToast('Post')
      this.loading.dismiss();
      this.navCtrl.pop();
    })
  }

  getMatch(ev: any) {
    let val = ev.target.value;
    var text = val.toLowerCase().trim().split(" ");
    var matchedWords = []
    for (var i = 0; i < this.array1.length; i++) {
      for (var e = 0; e < text.length; e++) {
        if (this.array1[i] === text[e]) matchedWords.push(this.array1[i]);
      }
    }
    if (matchedWords.length > 0) {
      this.isBanned = true;
      console.log('banned', this.isBanned)
      return true;
    }
    else {
      this.isBanned = false;
      console.log('unbanned', this.isBanned)
      return false;
    }
  }

  onTrigger() {
    document.getElementById('filevideo').click();
  }


  onSelectFile(event) {
    this.selectedFile = event.target.files
    const file = event.target.files && event.target.files[0];
    if (file) {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      if (file.type.indexOf('img') > -1) {
        this.format = 'img';
      } else if (file.type.indexOf('video') > -1) {
        this.format = 'video';
      }
      reader.onload = (event) => {
        this.url = (<FileReader>event.target).result;
      }
    }
  }



  async showToast(message) {
    let toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
    });
    toast.present();
  }



  async shareLocation() {
    const modal = await this.modalCtrl.create({
      component: AddLocationPage,
      cssClass: 'half-modal'
    });
    modal.present();

    //Get returned data
    const { data } = await modal.onWillDismiss();
    if (data != null) {
      console.log('this is the data', data)
      this.location = data.address;
      this.latitude = data.latitude;
      this.longitude = data.longitude;
      console.log(this.longitude, this.latitude, this.location)
    }
    else {
      console.log('location not selected')
    }
  }

  async presentImageSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: "Choose photos from",
      buttons: [
        {
          icon: 'images',
          text: 'Gallery',
          cssClass: 'ActionButton',
          handler: () => {
            //this.getImages()
            var options = {
              quality: 100,
              destinationType: this.camera.DestinationType.DATA_URL,
              sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
              //allowEdit: true,
              encodingType: this.camera.EncodingType.JPEG,
              saveToPhotoAlbum: false
            };

            this.camera.getPicture(options).then((imgUrl) => {

              let base64data = 'data:image/jpeg;base64,' + imgUrl;
              //let id = this.util.makeid(20)
              //let base64data = this.dataURItoBlob('data:image/jpeg;base64,' + imgUrl);
              this.imageResponse.push({
                //src: base64data,
                src: 'data:image/jpeg;base64,' + imgUrl,
              });
            }, (err) => {
              console.log(JSON.stringify(err))
            });
          }
        },
        {
          icon: 'camera',
          text: 'Camera',
          cssClass: 'ActionButton',
          handler: () => {

            var options = {
              quality: 100,
              destinationType: this.camera.DestinationType.DATA_URL,
              sourceType: this.camera.PictureSourceType.CAMERA,
              //allowEdit: true,
              encodingType: this.camera.EncodingType.JPEG,
              saveToPhotoAlbum: false
            };

            this.camera.getPicture(options).then((imgUrl) => {

              //let base64data = 'data:image/jpeg;base64,' + imgUrl;
              //let id = this.util.makeid(20)
              //let base64data = this.dataURItoBlob('data:image/jpeg;base64,' + imgUrl);
              this.imageResponse.push({
                src: 'data:image/jpeg;base64,' + imgUrl

              });
            }, (err) => {
              console.log(JSON.stringify(err))
            });
          }
        },
      ]
    });
    actionSheet.present();
  }

  removePhoto(image) {
    this.imageResponse = this.imageResponse.filter(im => im != image);
  }

  removeVideo() {
    this.format = "";
    this.url = "";
  }




  async showToasts() {
    await this.toastCtrl.create({
      header: 'Thanks for Posting',
      message: 'Your post will be displayed soon if accepted.',
      duration: 6000,
      //position: 'middle',
      //cssClass: 'my-custom-class',
      buttons: [{
        side: 'end',
        icon: 'Close',
        role: 'cancel',
        handler: () => {
          console.log('Close clicked');
        }
      }]
    }).then((obj) => {
      obj.present();
    });
  }



  async uploadFileVideo(id, file): Promise<any> {
    if (file && file.length) {
      try {
        await this.presentLoading();
        const task = await this.storage.ref('videos').child(id).put(file[0])
        this.loading.dismiss();
        return this.storage.ref(`videos/${id}`).getDownloadURL().toPromise();
      } catch (error) {
        console.log(error);
      }
    }
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create();
    return this.loading.present();
  }

  async addFeedVideo() {
    // this.loading = await this.loadingCtrl.create();
    // await this.loading.present();
    let myId = this.util.makeid(20);
    const imageUrl = await this.uploadFileVideo(myId, this.selectedFile)
    firebase.database().ref('feeds').push({
      Score: 1,
      commentLength: 0,
      haveILiked: false,
      UserId: this.uid,
      Date: firebase.database.ServerValue.TIMESTAMP,
      Name: this.name,
      video: imageUrl,
      //privacy: this.privacy,
      Photo: this.photo,
      sensitive: this.isSensitive,
      groupId: this.GroupId,
      groupName: this.GroupName,
      city: this.city,
    }).then(newFeed => {
      //this.router.navigate(['/tabs/tab1'])
      //this.showToast('Post')
      // this.loading.dismiss();
      this.navCtrl.pop();
    })
  }

  async addFeedTextVideo() {
    // this.loading = await this.loadingCtrl.create();
    // await this.loading.present();
    let myId = this.util.makeid(20);
    const imageUrl = await this.uploadFileVideo(myId, this.selectedFile)
    firebase.database().ref('feeds').push({
      Score: 1,
      commentLength: 0,
      haveILiked: false,
      UserId: this.uid,
      description: this.description,
      Date: firebase.database.ServerValue.TIMESTAMP,
      Name: this.name,
      video: imageUrl,
      //privacy: this.privacy,
      Photo: this.photo,
      sensitive: this.isSensitive,
      groupId: this.GroupId,
      groupName: this.GroupName,
      city: this.city,
    }).then(newFeed => {
      //this.router.navigate(['/tabs/tab1'])
      //this.showToast('Post')
      // this.loading.dismiss();
      this.navCtrl.pop();
    })
  }
}
