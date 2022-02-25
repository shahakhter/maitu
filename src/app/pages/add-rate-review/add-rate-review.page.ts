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
import * as _ from 'lodash';
import { SearchLocationPage } from '../search-location/search-location.page';

@Component({
  selector: 'app-add-rate-review',
  templateUrl: './add-rate-review.page.html',
  styleUrls: ['./add-rate-review.page.scss'],
})
export class AddRateReviewPage implements OnInit {

  array1 = ["fuck", "no cursing", "sex", "porn", "shit", "ass", "bitch", "men are dogs", "men are dog", "men are evil", "devils", "ugly", "sale", "sell", "offer", "uza", "nunua", "follow my page", "follow page", "like my page", "like page", "http", "https", ".com", ".net", "www", "www.", "https://", "price", "prices", "$", "what drug can i use", "dawa", "medicine", "treatment", "dawa za kienyeji", "herbal medicine", "nudity", "nude", "violence", "products", "price", "services", "bale", "dead badies", "badies", "bodies", "dead bodies"];


  allPercentage: Observable<any>

  uploads: any[];

  loading;

  uid;
  isBanned: boolean = false;
  description: String = '';
  name;
  photo;
  imageResponse: Array<{ src: any }>;
  location = '';
  rate = 1;
  category;


  myForm = new FormGroup({
    // name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    file: new FormControl('', [Validators.required])
  });


  constructor(public actionSheetCtrl: ActionSheetController, private fireAuth: AngularFireAuth,
    public alertCtrl: AlertController, public loadingCtrl: LoadingController,
    public router: Router, public camera: Camera, public storage: AngularFireStorage,
    public toastCtrl: ToastController, public util: UtilityService, private navCtrl: NavController,
    public modalCtrl: ModalController, public route: ActivatedRoute) {
    this.imageResponse = [];
    this.fireAuth.onAuthStateChanged(user => {
      if (user) {
        this.uid = user.uid;
        this.getInfo(user.uid);
      }
    });
  }

  onClick(val) {
    this.rate = val;
  }


  getInfo(uid) {
    firebase.database().ref('users/' + uid).once('value', (snapshot) => {
      this.name = snapshot.val().firstName;
      this.photo = snapshot.val().photoURL;
    });
  }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.pop();
  }


  // TEXT UPLOAD
  async addRateReview() {
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    firebase.database().ref('rate_review').push({
      Score: 1,
      commentLength: 0,
      haveILiked: false,
      rate: this.rate,
      location: this.location,
      UserId: this.uid,
      //privacy: this.privacy,
      description: this.description,
      category: this.category,
      images: this.imageResponse,
      Date: firebase.database.ServerValue.TIMESTAMP,
      Name: this.name,
      Photo: this.photo,
    }).then(newFeed => {
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

  async showToast(message) {
    let toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
    });
    toast.present();
  }



  async shareLocation() {
    const modal = await this.modalCtrl.create({
      component: SearchLocationPage,
      cssClass: 'half-modal'
    });
    modal.present();

    //Get returned data
    const { data } = await modal.onWillDismiss();
    if (data != null) {
      console.log('this is the data', data)
      this.location = data;
      console.log(this.location);
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
}
