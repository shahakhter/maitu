import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private http: HttpClient,
  ) { }

  async getFeeds(page) {
    return new Promise(resolve => {
      this.http.get(`https://randomuser.me/api/?page=${page}&results=5&seed=feed`).subscribe(
        data => {
          resolve(data);
        },
        err => {
          console.log(err);
        });
    });
  }

  async getMoreFeeds(page) {
    return new Promise(resolve => {
      this.http.get('https://randomuser.me/api/?page='+ page +'&results=7&seed=feed').subscribe(
        data => {
          resolve(data);
        },
        err => {
          console.log(err);
        });
    });
  }
}
