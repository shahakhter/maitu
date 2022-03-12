import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-whats-hot',
  templateUrl: './whats-hot.component.html',
  styleUrls: ['./whats-hot.component.scss'],
})
export class WhatsHotComponent implements OnInit {

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
  posts = [
    {
      'image': './assets/imgs/post-1.jpg',
      'group': 'Lovely Pets',
      'profile': './assets/imgs/23.jpg',
      'name': 'Katy Perry',
      'description': 'How many pets do you have?'
    },
    {
      'image': './assets/imgs/post-2.jpg',
      'group': 'Nature',
      'profile': './assets/imgs/24.jpg',
      'name': 'Lucy',
      'description': 'Its an awesome day.'
    },
    {
      'image': './assets/imgs/post-3.jpg',
      'group': 'Traveling',
      'profile': './assets/imgs/25.jpg',
      'name': 'Ariana',
      'description': 'Who wants to go there?'
    }
  ]
  constructor(
    private dataService: DataService,
  ) { 
    this.loadData();
  }

  ngOnInit() { }

  loadData() {
    this.dataService.getFeeds(this.page).then(
      (res: any) => { 
        this.feeds = res.results;
        this.dummyBook = [];
      });
  }

}
