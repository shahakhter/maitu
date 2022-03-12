import { Component } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { EmailComposer } from '@ionic-native/email-composer/ngx';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  currentUserCity;
  currentUserId;
  myphotoURL = './assets/imgs/avatar.png';
  ref;
  users = [];

  dummyUsers = Array(5);

  // optionsm = {
  //   autoplay: false,
  //   loop: false,
  //   slidesPerView: 1,
  //   spaceBetween: 5,
  //   centeredSlides: true,
  // };

  fromChats;

  constructor(
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private emailComposer: EmailComposer,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
  ) {
    this.fromChats = this.route.snapshot.paramMap.get('id');
    if (this.fromChats) {
      console.log('page', this.fromChats)
    }
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.currentUserId = user.uid;
        this.getCurrentUserCity(user.uid);
        this.getCurrentUser(user.uid);
      }
    });
  }

  getNearbyUsers(city) {
    this.ref = firebase.database().ref('/users').orderByChild('city').equalTo(city)
    this.ref.once('value', snapshot => {
      let feeds = [];
      snapshot.forEach(feed => {
        let item = feed.val();
        feeds.push(item);
      });
      this.users = feeds.filter(x => x.uid !== this.currentUserId);
      this.dummyUsers = Array(0);
      console.log('users', this.users);
    });
  }

  getCurrentUserCity(myId) {
    firebase.database().ref('users/' + myId + '/city').once('value', (snapshot) => {
      this.currentUserCity = snapshot.val();
      console.log(this.currentUserCity);
      this.getNearbyUsers(this.currentUserCity);
    });
  }

  getCurrentUser(myId) {
    firebase.database().ref('users/' + myId + '/photoURL').once('value', (snapshot) => {
      this.myphotoURL = snapshot.val();
    });
  }

  ngOnInit() {
    // this.mapsAPILoader.load().then(() => {
    //   this.geoCoder = new google.maps.Geocoder;
    //   this.getLocationCoordinates();
    // });
  }

  goMyProfile() {
    this.router.navigate(['/my-profile']);
  }

  goProfile(userId) {
    this.router.navigate(['/user-details', {
      id: userId
    }])
  }

  async presentActionSheetReport() {
    const actionSheet = await this.actionSheetCtrl.create({
      //header: 'Albums',
      buttons: [{
        icon: 'flag-outline',
        text: 'Report',
        cssClass: 'ActionButton',
        handler: () => {
          let email = {
            to: 'feedback@maitu.com',
            subject: 'Report',
            body: 'Hello Maitu, <br/> <b>I am having some issue with:<b/> <br>/(Please define your issue here).<br/><br/>Thank you',
            isHtml: true
          };

          this.emailComposer.open(email);
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

}
