import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { first, tap } from 'rxjs';
import { FullState } from 'src/app/state/main';
import { TissueClass } from 'src/models/Database';
import { StateService } from 'src/services/state.service';

@Component({
  selector: 'app-tissue-class-viewer',
  templateUrl: './tissue-class-viewer.component.html',
  styleUrls: ['./tissue-class-viewer.component.scss']
})
export class TissueClassViewerComponent {
  @Output('tissueSelectionChange') tissueSelectionChange: EventEmitter<TissueClass[]> = new EventEmitter()

  @ViewChild('select') selectEl: ElementRef<HTMLSelectElement>;
  constructor(public state: StateService) { }

  onSelectionChange() {
    const selectedIds = Array.from(this.selectEl.nativeElement.options).filter(o => o.selected).map(o => parseInt(o.value, 10))

    this.state.tissueClasses$.pipe(
      first(),
      tap(tss => {
        const selected = selectedIds.map(id => tss.find(ts => ts.pk === id) as TissueClass)
        this.tissueSelectionChange.emit(selected)
      })
    ).subscribe()
  }
}
