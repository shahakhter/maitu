import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ActionSheetController, NavController } from '@ionic/angular';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.page.html',
  styleUrls: ['./group-details.page.scss'],
})
export class GroupDetailsPage implements OnInit {

  groupData = [];
  groupId: string;

  dummyPosts = Array(10);
  refPost;
  currentUserId;
  myphotoURL = './assets/imgs/avatar.png';
  mydisplayName;
  lastKey;
  posts = [];

  slideOptions = {
    zoom: true
  };

  zoom: number = 12;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private socialSharing: SocialSharing,
    private emailComposer: EmailComposer,
    private photoViewer: PhotoViewer,
  ) {
    this.posts = [];
    this.route.queryParams.subscribe(params => {
      if (params && params.data) {
        this.groupData = JSON.parse(params.data);
        this.groupId = this.groupData['id'];
        console.log(this.groupId);
        this.getFeed(this.groupId);
      }
    });
  }

  viewImage(image) {
    this.photoViewer.show(image, null, { share: true });
  }

  ngOnInit() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.currentUserId = user.uid
        console.log('userId', this.currentUserId)
        this.getCurrentUser(user.uid);
      }
      else {
        this.router.navigate(['/login'])
      }
    });
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

  getCurrentUser(myId) {
    return firebase.database().ref('users/' + myId).once('value', (snapshot) => {
      this.mydisplayName = snapshot.val().firstName;
      this.myphotoURL = snapshot.val().photoURL;
    })
  }

  getFeed(id) {
    this.refPost = firebase.database().ref('/feeds').orderByChild('groupId').equalTo(id)
    this.refPost.on('value', feedList => {
      let feeds = [];

      feedList.forEach(feed => {
        let item = feed.val();
        item.key = feed.key;
        this.lastKey = feed.key;
        item.likes = feed.val().likes || [];
        item.demo = new Date(feed.val().Date).toDateString();
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
      this.posts = feeds.reverse();
      this.dummyPosts = Array(0);
      console.log('feeds', feeds);
      console.log('feeds', feeds.length);
    });
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

  goBack() {
    this.navCtrl.pop();
  }

  createPost(id, groupName) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        GroupId: JSON.stringify(id),
        GroupName: JSON.stringify(groupName)
      }
    };
    this.router.navigate(['feed-add'], navigationExtras);
  }

  async goComment(postId, userId, commentLength) {
    this.router.navigate(['/comments', {
      postId: postId,
      userId: userId,
      commentLength: commentLength,
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

  async presentActionSheetMenu(id, groupName) {
    const actionSheet = await this.actionSheetCtrl.create({
      mode: 'md',
      buttons: [{
        icon: 'create-outline',
        text: 'Create post',
        cssClass: 'ActionButton',

        handler: () => {
          let navigationExtras: NavigationExtras = {
            queryParams: {
              GroupId: JSON.stringify(id),
              GroupName: JSON.stringify(groupName)
            }
          };
          this.router.navigate(['feed-add'], navigationExtras);
        }
      },
      {
        icon: 'flag-outline',
        text: 'Report',
        cssClass: 'ActionButton',

        handler: () => {
          let email = {
            to: 'feedback@maitu.com',
            subject: 'Report',
            body: 'Hello Maitu, I notice the following user <b>' + groupName + '</b> is violating the app Terms of Service.<br/><br/>Thank you',
            isHtml: true
          };

          this.emailComposer.open(email);
        }
      },
      {
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
    this.socialSharing.share(description, "Maitu", description, null).then(() => {
      console.log("shareSheetShare: Success");
    }).catch(() => {
      console.error("shareSheetShare: failed");
    });
  }

  shareSheetShareImage(img) {
    this.socialSharing.share(null, "Maitu", img, null).then(() => {
      console.log("shareSheetShare: Success");
    }).catch(() => {
      console.error("shareSheetShare: failed");
    });
  }

  shareSheetShareImageText(img, text) {
    this.socialSharing.share(text, "Maitu", img, null).then(() => {
      console.log("shareSheetShare: Success");
    }).catch(() => {
      console.error("shareSheetShare: failed");
    })
  }

  deleteFeeds(id, item) {

    firebase.database().ref('feeds').child(id).remove().then(function () { })
    let index = this.posts.indexOf(item);
    if (index > -1) {
      this.posts.splice(index, 1);
    }
  }
}
