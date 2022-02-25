import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UserLocationPage } from '../user-location/user-location.page';
import { ActionSheetController, LoadingController, ModalController, NavController } from '@ionic/angular';
import { Camera } from '@ionic-native/camera/ngx';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {

  user: any;
  isChilds: string = 'no';
  childResponse: Array<{ childName: string, childAge: string, childGender: string }>;
  childs;
  childName: string = '';
  childAge: string = '';
  childGender: string = '';
  displayName;
  photoURL;
  email;
  uid;
  status;
  location;
  address;
  city;
  about;
  phoneNumber;
  followersCount;
  dob;
  marital;
  education;
  gender;
  followingCount;

  loading;

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private camera: Camera,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
  ) {
    this.childResponse = [];
    this.childs = [];
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.user = user;
        this.loaduserdetails(user.uid)
      }
    });
  }

  ngOnInit() {
  }

  async shareLocation() {
    const modal = await this.modalCtrl.create({
      component: UserLocationPage,
      cssClass: 'half-modal'
    });
    modal.present();

    //Get returned data
    const { data } = await modal.onWillDismiss();
    if (data != null) {
      console.log('this is the data', data)
      this.location = data.address;
      this.city = data.city;
      console.log(this.city, this.location)
    }
    else {
      console.log('location not selected')
    }
  }

  addMore() {
    this.childResponse.push({
      childName: this.childName,
      childAge: this.childAge,
      childGender: this.childGender
    });
    this.childName = "";
    this.childAge = "";
    this.childGender = "";
  }

  loaduserdetails(id) {
    this.authService.getUserDetails(id).then((res: any) => {
      this.displayName = res.displayName;
      this.photoURL = res.photoURL;
      this.email = res.email;
      this.uid = res.uid;
      this.status = res.status;
      this.location = res.location;
      this.city = res.city;
      this.about = res.about;
      this.phoneNumber = res.phoneNumber;
      this.followersCount = res.followersCount;
      this.dob = res.dob;
      this.marital = res.marital;
      this.education = res.education;
      this.gender = res.gender;
      this.followingCount = res.followingCount;
      this.childs = res.childs;
    });
    if (this.childs.length > 0) {
      this.isChilds = 'yes';
    }
  }

  async presentImageSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: "Choose photo from",
      buttons: [
        {
          icon: 'images',
          text: 'Gallery',
          cssClass: 'ActionButton',
          handler: () => {
            var options = {
              quality: 100,
              destinationType: this.camera.DestinationType.DATA_URL,
              sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
              encodingType: this.camera.EncodingType.JPEG,
              saveToPhotoAlbum: false
            };

            this.camera.getPicture(options).then((imgUrl) => {

              this.photoURL = 'data:image/jpeg;base64,' + imgUrl;
              firebase.database().ref('users').child(firebase.auth().currentUser.uid).update({
                photoURL: this.photoURL
              })
              this.updatePhoto(this.photoURL)
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

              this.photoURL = 'data:image/jpeg;base64,' + imgUrl;
              firebase.database().ref('users').child(firebase.auth().currentUser.uid).update({
                photoURL: this.photoURL
              })
              this.updatePhoto(this.photoURL)
            }, (err) => {
              console.log(JSON.stringify(err))
            });
          }
        },
      ]
    });
    actionSheet.present();
  }

  async saveProfile() {
    this.loading = await this.loadingCtrl.create({
      message: 'Please wait...',
    });
    await this.loading.present();
    firebase.database().ref('users').child(firebase.auth().currentUser.uid).update({
      about: this.about,
      location: this.location,
      city: this.city,
      gender: this.gender,
      marital: this.marital,
      education: this.education,
      childs: this.childs,
      status: 'verified',
    }).then(() => {
      this.loading.dismiss();
      this.goBack();
    })
      .catch(err => {
        console.log(` failed ${err}`);
      });
  }

  updatePhoto(photo) {
    this.user.updateProfile({
      photoURL: photo
    }).then(() => {
      console.log('updated')
    })
      .catch(err => {
        console.log(` failed ${err}`);
      });
  }

  goBack() {
    this.navCtrl.pop();
  }

}
