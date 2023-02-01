import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, first, Observable, tap } from 'rxjs';
import { StateService } from 'src/services/state.service';
import { FullState } from './state/main';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'hsi_annotate';
  mode$: BehaviorSubject<{ name: string, route: string }>;
  // modes = [{ name: 'Upload', route: 'upload' }, { name: 'Browse', route: 'browse' }];
  modes = [{ name: 'Browse', route: 'browse' }];
  annotationMode$: Observable<boolean>;

  constructor(private store: Store<FullState>, private router: Router, public state: StateService) {
    this.annotationMode$ = this.store.select(state => state.app.annotationIsActive);
    this.mode$ = new BehaviorSubject(this.modes[0])
  }
}
