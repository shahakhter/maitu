import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/compat/database';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, NavController } from '@ionic/angular';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import { AuthService } from 'src/app/services/auth.service';
import { UtilityService } from 'src/app/services/utility';

@Component({
  selector: 'app-feed-details',
  templateUrl: './feed-details.page.html',
  styleUrls: ['./feed-details.page.scss'],
})
export class FeedDetailsPage implements OnInit {

  item: any;
  feed: AngularFireObject<any>;
  images = [];
  likes = [];
  haveILiked: boolean = false;

  fakeComments = [];
  postId;
  userId;
  message;
  photoURL;
  displayName;
  feedsComment = [];
  currentUserId;
  commentLength;
  commentNumber;
  fcm_token;

  constructor(
    private route: ActivatedRoute,
    private db: AngularFireDatabase,
    private navCtrl: NavController,
    private authService: AuthService,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private util: UtilityService,
  ) {
    this.feedsComment = [];
    this.postId = this.route.snapshot.paramMap.get('postId');
    this.userId = this.route.snapshot.paramMap.get('userId');
    this.feed = db.object("/feeds/" + this.postId);
    this.feed.valueChanges().subscribe((data: any) => {
      if (data != null) {
        this.item = data;
        this.images = data.images;
        this.likes = data.likes;
        this.item["key"] = this.postId;
        for (let i = 0; i < this.likes.length; i++) {
          if (this.likes[i] === firebase.auth().currentUser.uid) {
            this.haveILiked = true;
          }
        }
      }
    });
    this.authService.getUserDetails(this.userId).then((res: any) => {
      this.fcm_token = res.fcm_token;
      //this.photoURL = res.photoURL;
    })
    this.generateFakeComments();
    this.getComment();
  }

  deleteComment(id, item) {
    firebase.database().ref('/feeds/' + this.postId + '/comments/' + id).remove().then(function () { })
    if (this.commentNumber === 0) {
      firebase.database().ref('/feeds/' + this.postId).update({
        commentLength: 0
      })
    } else {
      firebase.database().ref('/feeds/' + this.postId).update({
        commentLength: this.commentLength - 1
      })
    }
    let index = this.feedsComment.indexOf(item);
    if (index > -1) {
      this.feedsComment.splice(index, 1);
    }
    // })
  }


  async presentActionSheet(id, item) {
    const actionSheet = await this.actionSheetCtrl.create({
      //header: 'Albums',
      buttons: [{
        icon: 'flag-outline',
        text: 'Report comment',
        cssClass: 'ActionButton',
        handler: () => {
          console.log('Delete clicked');
          alert('Comment Report successfully')
        }
      }, {
        icon: 'trash-outline',
        text: 'Delete Comment',
        cssClass: 'ActionButton',
        handler: () => {
          this.deleteComment(id, item)
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

  send() {
    firebase.database().ref('/feeds/' + this.postId).child('comments').push({
      message: this.message,
      date: firebase.database.ServerValue.TIMESTAMP,
      photoURL: this.photoURL,
      userId: firebase.auth().currentUser.uid,
      displayName: this.displayName,
    })
    this.message = ''
    firebase.database().ref('/feeds/' + this.postId).update({
      commentLength: this.commentNumber + 1
    })
    if (firebase.auth().currentUser.uid != this.userId) {
      this.util.sendSimpleNotification(`${this.displayName} Comment on your post`, 'Maitu', this.fcm_token).subscribe((data) => {
        console.log('send notifications', data);
      }, error => {
        console.log(error);
      });
      firebase.database().ref('notices').push({
        read: false,
        senderId: firebase.auth().currentUser.uid,
        displayName: this.displayName,
        ownerId: this.userId,
        postId: this.postId,
        typer: 'comment',
        time: firebase.database.ServerValue.TIMESTAMP,
        photoURL: this.photoURL,
        type: 'feed'
      })
    }
  }

  generateFakeComments() {
    for (var i = 0; i < 10; i++)
    {
      this.fakeComments.push({
        width: this.randomWidth(180, 220),
        height: this.randomHeight()
      })
    }
  }

  ngOnInit() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.currentUserId = user.uid
        this.loaduserdetails(user.uid);
      }
    })
  }

  loaduserdetails(id) {
    this.authService.getUserDetails(id).then((res: any) => {
      this.displayName = res.firstName;
      this.photoURL = res.photoURL;
    })
  }

  getComment() {
    firebase.database().ref('/feeds/' + this.postId).child('comments').on('value', snapshot => {
      let feeds = [];
      snapshot.forEach(feed => {
        let item = feed.val();
        item.key = feed.key;
        item.userId = feed.val().userId;
        firebase.database().ref('users/' + item.userId).once('value', (snapshot) => {
          item.displayName = snapshot.val().firstName;
          item.photoURL = snapshot.val().photoURL;
        });
        feeds.push(item);
        this.feedsComment = feeds;
        this.commentNumber = this.feedsComment.length;
      });
      this.fakeComments = [];
    });
  }


  viewProfiles(userId) {
    if (this.currentUserId == userId) {
      this.router.navigate(['/my-profile'])
    } else {
      this.router.navigate(['/users-details', {
        id: userId
      }])
    }
  }

  goBack() {
    this.navCtrl.pop();
  }

  randomWidth(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);;
  }

  randomHeight() {
    let arr = [40, 50, 80]
    return arr[Math.floor(Math.random() * arr.length)]
  }

  likePost(post, postId) {

    if (this.currentUserId != post.UserId) {
      firebase.database().ref('notices').push({
        read: false,
        senderId: firebase.auth().currentUser.uid,
        displayName: this.displayName,
        ownerId: post.UserId,
        postId: postId,
        typer: 'like',
        time: firebase.database.ServerValue.TIMESTAMP,
        photoURL: this.photoURL,
        type: 'feed-like'
      })
    }

    let myId = this.currentUserId;
    let score;
    let likes = [];

    console.log("post: " + postId);
    for (let i = 0; i < this.item.length; i++)
      if (this.item[i].key === postId) {
        console.log("POST FOUND and liked");
        this.item[i].haveILiked = true;
        this.item[i].Score++;
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
    for (let i = 0; i < this.item.length; i++)
      if (this.item[i].key === postId) {
        console.log("POST FOUND and unliked");
        this.item[i].haveILiked = false;
        this.item[i].Score--;
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

}
