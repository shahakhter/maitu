import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { AuthService } from 'src/app/services/auth.service';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { StoryModalEnterAnimation, StoryModalLeaveAnimation } from 'src/app/app.animations';
import { ProfileModalPage } from '../profile-modal/profile-modal.page';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.page.html',
  styleUrls: ['./my-profile.page.scss'],
})
export class MyProfilePage implements OnInit {

  displayName;
  photoURL;
  email;
  uid;
  status;
  location;
  city;
  about;
  phoneNumber;
  nationality;
  followersCount;
  dob;
  marital;
  education;
  gender;
  followingCount;
  childs

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private navCtrl: NavController,
    private photoViewer: PhotoViewer,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.loaduserdetails(user.uid)
      }
    });
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
      this.nationality = res.nationality;
      this.followersCount = res.followersCount;
      this.dob = res.dob;
      this.marital = res.marital;
      this.education = res.education;
      this.gender = res.gender;
      this.followingCount = res.followingCount;
      this.childs = res.childs;
    });
  }

  viewImage(image) {
    this.photoViewer.show(image, "", { share: true });
  }

  goEdit() {
    this.router.navigate(['./edit-profile']);
  }

  logout() {
    this.authService.logout().then(()=> {
      this.router.navigate(['/login']);
    });
  }

  async viewMyProfile(img){
    const modal = await this.modalController.create({
      component: ProfileModalPage,
      componentProps: {img: img},
      mode: 'ios',
      cssClass: 'story-modal',
      swipeToClose: true,
      enterAnimation: StoryModalEnterAnimation,
      leaveAnimation: StoryModalLeaveAnimation,
      // presentingElement: this.routerOutlet.nativeEl
    });
    return await modal.present();
  }

  showLogoutConfirm() {
    this.alertController.create({
      header: 'Logout',
      message: 'Do you want to logout?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.logout();
          }
        },
        {
          text: 'No',
          handler: () => {
            console.log('Alert Dismissed!');
          }
        }
      ]
    })
      .then(alert => {
        alert.present();
      });
  }

  goBack() {
    this.navCtrl.pop();
  }

}
