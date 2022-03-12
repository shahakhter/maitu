import { Component, OnInit } from '@angular/core';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { NavigationExtras, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { CommentsPage } from '../pages/comments/comments.page';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { map } from 'rxjs/operators';
import { feeds } from 'src/app/model/feeds';
import { UtilityService } from '../services/utility';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  selectedSegment = 'KWA MAITU';
  termPost = "";
  termHot = "";
  termGroup = "";
  termRating = "";

  currentUserId;
  lastKey;
  myphotoURL = './assets/imgs/avatar.png';
  mydisplayName;
  defaultImage = './assets/imgs/defaultImage.jpg';
  posts: any = [];
  dummyPosts = Array(10);
  selectedItems = [];
  refPost;

  feedList: Observable<any[]>;

  refReviews;
  reviews = [];
  dummyReviews = Array(10);

  optionsm = {
    autoplay: true,
    loop: true,
    slidesPerView: 1.2,
    spaceBetween: 5,
    centeredSlides: true,
  };

  dummyBook = Array(5);
  page = 1;
  feeds: any;

  slidePosts: any = [];

  groups = [
    {
      'id': '1',
      'name': 'Pregnant moms',
      'description': 'Anyone else expecting twins in 5 weeks ? What have you all prepared please share your list.',
      'color': '#ED2E63',
      'total_members': '23,025'
    },
    {
      'id': '2',
      'name': 'Working moms',
      'description': 'Should she join playgroup for one term in January or wait it out till March to join Playgroup for 3 terms ?',
      'color': '#FCBC5E',
      'total_members': '16,235'
    },
    {
      'id': '3',
      'name': 'Stay at home moms',
      'description': 'Just discovered the most perfectly balanced kid and adult friendly joint - hint its in Nyeri and has Quad Bikes I Can anyone guess the place ?',
      'color': '#64C9D0',
      'total_members': '16,052'
    },
    {
      'id': '4',
      'name': 'Waiting moms',
      'description': 'Anyone else expecting twins in 5 weeks ? What have you all prepared please share your list.',
      'color': '#9c88ff',
      'total_members': '23,025'
    },
    {
      'id': '5',
      'name': 'Rainbow moms',
      'description': 'Anyone else expecting twins in 5 weeks ? What have you all prepared please share your list.',
      'color': '#e84118',
      'total_members': '23,025'
    },
    {
      'id': '6',
      'name': 'Special needs moms',
      'description': 'Anyone else expecting twins in 5 weeks ? What have you all prepared please share your list.',
      'color': '#487eb0',
      'total_members': '23,025'
    },
    {
      'id': '7',
      'name': 'Single moms',
      'description': 'Anyone else expecting twins in 5 weeks ? What have you all prepared please share your list.',
      'color': '#7f8fa6',
      'total_members': '23,025'
    },
    {
      'id': '8',
      'name': 'Married moms',
      'description': 'Anyone else expecting twins in 5 weeks ? What have you all prepared please share your list.',
      'color': '#4cd137',
      'total_members': '23,025'
    },
    {
      'id': '9',
      'name': 'Multiple baby moms',
      'description': 'Anyone else expecting twins in 5 weeks ? What have you all prepared please share your list.',
      'color': '#0097e6',
      'total_members': '23,025'
    },
    {
      'id': '10',
      'name': 'New moms',
      'description': 'Anyone else expecting twins in 5 weeks ? What have you all prepared please share your list.',
      'color': '#353b48',
      'total_members': '23,025'
    },
    {
      'id': '11',
      'name': 'Pay it forward',
      'description': 'Anyone else expecting twins in 5 weeks ? What have you all prepared please share your list.',
      'color': '#833471',
      'total_members': '23,025'
    },
  ];

  zoom: number = 12;
  date;

  constructor(
    private router: Router,
    private socialSharing: SocialSharing,
    private fireAuth: AngularFireAuth,
    private modalController: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private emailComposer: EmailComposer,
    private photoViewer: PhotoViewer,
    private db: AngularFireDatabase,
    private util: UtilityService,
    private api: AuthService
  ) {
    this.posts = [];
    this.reviews = [];
    this.slidePosts = [];
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.currentUserId = user.uid
        console.log('userId', this.currentUserId);
        this.date = new Date();
        const currentDate = this.date.setMonth(this.date.getMonth());
        this.api.getUserProfile().on('value', userProfileSnapshot => {
          let subscription = userProfileSnapshot.val().subscription;
          let expiry = userProfileSnapshot.val().expiry;
          this.mydisplayName = userProfileSnapshot.val().firstName;
          this.myphotoURL = userProfileSnapshot.val().photoURL;
          if (subscription === 'Expired') {
            this.router.navigate(['/payment']);
          }
          if (currentDate > expiry) {
            firebase.database().ref('users').child(this.currentUserId).update({
              subscription: 'Expired',
              expiry: ''
            }).then(() => {
              this.router.navigate(['/payment']);
            });
          }
        })
      }
    });
  }

  async ngOnInit() {
    this.getFeed();
    this.getReviews();
  }

  segmentChosen(name) {
    this.selectedSegment = name;
  }

  initializeItems() {
    this.posts = this.selectedItems;
  }

  changed(ev: any) {
    if (ev.detail.index == 0) {
      this.selectedSegment = "KWA MAITU";
    }
    else if (ev.detail.index == 1) {
      this.selectedSegment = "WHATS HOT";
    }
    else if (ev.detail.index == 2) {
      this.selectedSegment = "COMMUNITY";
    }
    else if (ev.detail.index == 3) {
      this.selectedSegment = "RATE & REVIEW";
    }
  }

  goAddReview() {
    this.router.navigate(['/add-rate-review'])
  }

  search(ev: any) {
    this.initializeItems();
    let val = ev.target.value;
    let results: any;
    if (val && val.trim() != "") {
      this.posts = this.posts.filter(data => {
        if (data.description) {
          return data.description.toLowerCase().indexOf(val.toLowerCase()) > -1;
        }
        return data.Name.toLowerCase().indexOf(val.toLowerCase()) > -1;
      });
    }
  }

  async getFeed() {
    // this.feedList = this.db.list(`/feeds`)
    // .valueChanges().pipe(map(changes => {
    //   changes.map(mkey => {
    //     //@ts-ignore
    //     this.db.object(`/users/${mkey.UserId}`).valueChanges().subscribe(
    //       (x)=>{
    //         //@ts-ignore
    //         mkey.Name = x.firstName;
    //         //@ts-ignore
    //         mkey.Photo = x.photoURL;
    //       }) 
    //     });
    //     this.dummyPosts = Array(0);
    //     console.log(changes)
    //   return changes.reverse();
    // }));

    // this.refPost = this.db.list('/feeds');
    // this.refPost.snapshotChanges(['child_added'])
    //   .subscribe(actions => {
    //     actions.forEach(action => {
    //       let item = action.payload.val();
    //       item.key = action.key;
    //       this.feedList = item;
    //       console.log(action.type);
    //       console.log(action.key);
    //       console.log(action.payload.val());
    //     });
    //   });

    this.db.list('/feeds').snapshotChanges(['child_added']).subscribe(res => {
      this.posts = [];
      this.slidePosts = [];
      res.forEach(item => {
        let a = item.payload.val();
        a['key'] = item.key;
        let likes = a['likes'] || [];
        let images = a['images'] || [];
        for (let i = 0; i < likes.length; i++) {
          if (likes[i] === this.currentUserId) {
            a['haveILiked'] = true;
          }
        }
        if (images.length) {
          this.slidePosts.push(a as feeds);
        }
        return this.posts.push(a as feeds);
      })
      console.log('posts', this.posts);
      this.dummyPosts = Array(0);
    });


    // this.refPost = firebase.database().ref('/feeds');
    // this.refPost.once('value', feedList => {
    //   let feeds = [];

    //   feedList.forEach(feed => {
    //     let item = feed.val();
    //     item.key = feed.key;
    //     this.lastKey = feed.key;
    //     item.likes = feed.val().likes || [];
    //     item.demo = new Date(feed.val().Date).toDateString();
    //     item.haveILiked = feed.val().haveILiked;
    //     item.UserId = feed.val().UserId;
    //     for (let i = 0; i < item.likes.length; i++) {
    //       if (item.likes[i] === this.currentUserId) {
    //         item.haveILiked = true;
    //       }
    //     }
    //     firebase.database().ref('users/' + item.UserId).once('value', (snapshot) => {
    //       item.Name = snapshot.val().firstName;
    //       item.Photo = snapshot.val().photoURL;
    //     });
    //     feeds.push(item);
    //   });
    //   this.posts = feeds.reverse();
    //   this.selectedItems = this.posts;
    //   this.dummyPosts = Array(0);
    //   console.log('posts', feeds);
    // });
  }

  likePost(post, postId) {

    if (this.currentUserId != post.UserId) {
      firebase.database().ref('notices').push({
        read: false,
        senderId: firebase.auth().currentUser.uid,
        displayName: this.mydisplayName,
        ownerId: post.UserId,
        postId: postId,
        typer: 'like',
        time: firebase.database.ServerValue.TIMESTAMP,
        photoURL: this.myphotoURL,
        type: 'feed-like'
      })
    }

    let myId = this.currentUserId;
    let score;
    let likes = [];

    console.log("post: " + postId);
    for (let i = 0; i < this.posts.length; i++)
      if (this.posts[i].key === postId) {
        console.log("POST FOUND and liked");
        this.posts[i].haveILiked = true;
        this.posts[i].Score++;
        //this.haveILiked = true;
        break;
      }

    firebase.database().ref('/feeds/' + postId).once('value').then(function (snapshot) {
      likes = (snapshot.val() && snapshot.val().likes) || [];
      score = (snapshot.val() && snapshot.val().Score);
      likes.push(myId);
      score = score + 1;

      firebase.database().ref('/feeds/' + postId).child('likes').set(likes);
      firebase.database().ref('/feeds/' + postId).child('Score').set(score);
    });
  }

  unlikePost(post, postId) {
    let myId = this.currentUserId;
    let score;
    let likes = [];
    let updatedLikes = [];

    console.log("post: " + postId);
    for (let i = 0; i < this.posts.length; i++)
      if (this.posts[i].key === postId) {
        console.log("POST FOUND and unliked");
        this.posts[i].haveILiked = false;
        this.posts[i].Score--;
        //this.haveILiked = false;
        break;
      }

    firebase.database().ref('/feeds/' + postId).once('value').then(function (snapshot) {
      likes = (snapshot.val() && snapshot.val().likes) || [];
      score = (snapshot.val() && snapshot.val().Score);
      likes.push(myId);


      for (let i = 0; i < likes.length; i++) {
        if (likes[i] != myId) {
          updatedLikes.push(likes[i]);
        }
      }

      score = score - 1;

      firebase.database().ref('/feeds/' + postId).child('likes').set(updatedLikes);
      firebase.database().ref('/feeds/' + postId).child('Score').set(score);
    });

  }

  likeReview(post, postId) {

    if (this.currentUserId != post.UserId) {
      firebase.database().ref('notices').push({
        read: false,
        senderId: firebase.auth().currentUser.uid,
        displayName: this.mydisplayName,
        ownerId: post.UserId,
        postId: postId,
        typer: 'like',
        time: firebase.database.ServerValue.TIMESTAMP,
        photoURL: this.myphotoURL,
        type: 'review-like'
      })
    }

    let myId = this.currentUserId;
    let score;
    let likes = [];

    console.log("post: " + postId);
    for (let i = 0; i < this.posts.length; i++)
      if (this.posts[i].key === postId) {
        console.log("POST FOUND and liked");
        this.posts[i].haveILiked = true;
        this.posts[i].Score++;
        //this.haveILiked = true;
        break;
      }

    firebase.database().ref('/rate_review/' + postId).once('value').then(function (snapshot) {
      likes = (snapshot.val() && snapshot.val().likes) || [];
      score = (snapshot.val() && snapshot.val().Score);
      likes.push(myId);
      score = score + 1;

      firebase.database().ref('/rate_review/' + postId).child('likes').set(likes);
      firebase.database().ref('/rate_review/' + postId).child('Score').set(score);
    });
  }

  unlikeReview(post, postId) {
    let myId = this.currentUserId;
    let score;
    let likes = [];
    let updatedLikes = [];

    console.log("post: " + postId);
    for (let i = 0; i < this.posts.length; i++)
      if (this.posts[i].key === postId) {
        console.log("POST FOUND and unliked");
        this.posts[i].haveILiked = false;
        this.posts[i].Score--;
        //this.haveILiked = false;
        break;
      }

    firebase.database().ref('/rate_review/' + postId).once('value').then(function (snapshot) {
      likes = (snapshot.val() && snapshot.val().likes) || [];
      score = (snapshot.val() && snapshot.val().Score);
      likes.push(myId);


      for (let i = 0; i < likes.length; i++) {
        if (likes[i] != myId) {
          updatedLikes.push(likes[i]);
        }
      }

      score = score - 1;

      firebase.database().ref('/rate_review/' + postId).child('likes').set(updatedLikes);
      firebase.database().ref('/rate_review/' + postId).child('Score').set(score);
    });

  }

  getReviews() {
    this.refReviews = firebase.database().ref('/rate_review');
    this.refReviews.once('value', feedList => {
      let feeds = [];

      feedList.forEach(feed => {
        let item = feed.val();
        item.key = feed.key;
        item.likes = feed.val().likes || [];
        item.haveILiked = feed.val().haveILiked;
        item.UserId = feed.val().UserId;
        for (let i = 0; i < item.likes.length; i++) {
          if (item.likes[i] === this.currentUserId) {
            item.haveILiked = true;
          }
          firebase.database().ref('users/' + item.UserId).once('value', (snapshot) => {
            item.Name = snapshot.val().firstName;
            item.Photo = snapshot.val().photoURL;
          });
        }
        feeds.push(item);
      });
      this.reviews = feeds.reverse();
      this.dummyReviews = Array(0);
      console.log('reviews', feeds);
    });
  }

  async goComment(postId, userId, commentLength) {
    this.router.navigate(['/comments', {
      postId: postId,
      userId: userId,
      commentLength: commentLength,
    }])
  }

  async goReviewComment(postId, userId, commentLength) {
    this.router.navigate(['/review-comments', {
      postId: postId,
      userId: userId,
      commentLength: commentLength,
    }])
  }

  viewImage(image) {
    this.photoViewer.show(image, null, { share: true });
  }

  async presentActionSheetReport(item) {
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
            body: 'Hello Maitu, I notice the following user <b>' + item + '</b> is violating the app Terms of Service.<br/><br/>Thank you',
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

  goFeedDetails(key, userId) {
    this.router.navigate(['/feed-details', {
      postId: key,
      userId: userId
    }])
  }

  async presentActionSheetNonUser(id, item, description) {
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
            body: 'Hello Maitu, I notice the following user <b>' + item + '</b> is violating the app Terms of Service.<br/><br/>Thank you',
            isHtml: true
          };

          this.emailComposer.open(email);
        }
      }, {
        icon: 'share-social-outline',
        text: 'Share',
        cssClass: 'ActionButton',
        handler: () => {
          this.shareSheetShare(description)
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

  shareSheetShare(description) {
    this.socialSharing.share(description, "Maitu", description, "").then(() => {
      console.log("shareSheetShare: Success");
    }).catch(() => {
      console.error("shareSheetShare: failed");
    });
  }

  shareSheetShareImage(img) {
    this.socialSharing.share("", "Maitu", img, "").then(() => {
      console.log("shareSheetShare: Success");
    }).catch(() => {
      console.error("shareSheetShare: failed");
    });
  }

  shareSheetShareImageText(img, text) {
    this.socialSharing.share(text, "Maitu", img, "").then(() => {
      console.log("shareSheetShare: Success");
    }).catch(() => {
      console.error("shareSheetShare: failed");
    })
  }

  async presentActionSheetUser(id, item, description) {
    const actionSheet = await this.actionSheetCtrl.create({
      //header: 'Albums',
      buttons: [
        //   {
        //   icon: 'create-outline',
        //   text: 'Edit post',
        //   cssClass: 'ActionButton',
        //   handler: () => {
        //     //this.editFeeds(id, item)
        //   }
        // },
        {
          icon: 'trash-outline',
          text: 'Delete post',
          cssClass: 'ActionButton',
          handler: () => {
            this.deleteFeeds(id, item)
          }
        },
        {
          icon: 'share-social-outline',
          text: 'Share',
          cssClass: 'ActionButton',
          handler: () => {
            this.shareSheetShare(description)
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

  viewProfiles(userId) {
    if (this.currentUserId == userId) {
      this.router.navigate(['/my-profile'])
    } else {
      this.router.navigate(['/user-details', {
        id: userId
      }])
    }
  }

  goGroupDetails(item) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        data: JSON.stringify(item)
      }
    };
    this.router.navigate(['group-details'], navigationExtras);
  }

  getCurrentUser(myId) {
    return firebase.database().ref('users/' + myId).once('value', (snapshot) => {
      this.mydisplayName = snapshot.val().firstName;
      this.myphotoURL = snapshot.val().photoURL;
    })
  }


  segmentChanged(event) {
    console.log(event);
  }

  goMyProfile() {
    this.router.navigate(['/my-profile']);
  }

  deleteFeeds(id, item) {
    firebase.database().ref('feeds').child(id).remove().then(function () { })
    let index = this.posts.indexOf(item);
    if (index > -1) {
      this.posts.splice(index, 1);
    }
  }
}
