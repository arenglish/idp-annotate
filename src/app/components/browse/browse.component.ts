import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { StateService } from 'src/services/state.service';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent {
  imageBasePath = 'static'
  apiUrl = environment.apiUrl

  constructor(public state: StateService) { }
}
