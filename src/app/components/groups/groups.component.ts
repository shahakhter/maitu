import { Component, Input, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
})
export class GroupsComponent implements OnInit {

  @Input('search-term')
  public term: string = null;

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

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
  ) {
    // this.firebaseService.fetchGroups().subscribe(data => {

    //   this.groups = data.map(e => {
    //     return {
    //       id: e.payload.doc.id,
    //       name: e.payload.doc.data()['name'],
    //       description: e.payload.doc.data()['description'],
    //       total_members: e.payload.doc.data()['total_members'],
    //     };
    //   });
    //   console.log(this.groups);

    // });
  }

  ngOnInit() {
  }

  goGroupDetails(item) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        data: JSON.stringify(item)
      }
    };
    this.router.navigate(['group-details'], navigationExtras);
  }
}
