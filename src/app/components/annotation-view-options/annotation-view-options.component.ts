import { Options } from '@angular-slider/ngx-slider';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { get } from 'lodash';
import { BehaviorSubject, combineLatest, first, map, Observable, shareReplay, tap } from 'rxjs';
import { selectMaskForAnnotation, selectMasksForAnnotationView, setAnnotationImageZoom } from 'src/app/state/annotate/annotate.actions';
import { MaskEntityActions } from 'src/app/state/entities/masks.entities';
import { FullState } from 'src/app/state/main';
import { environment } from 'src/environments/environment';
import { Mask, SpectralImageSlim } from 'src/models/Database';
import { StateService } from 'src/services/state.service';

@Component({
  selector: 'app-annotation-view-options',
  templateUrl: './annotation-view-options.component.html',
  styleUrls: ['./annotation-view-options.component.scss']
})
export class AnnotationViewOptionsComponent {
  add_mask_icon = `${environment.appAssetsPath}/svg/plus_circle.svg`
  trash_icon = `${environment.appAssetsPath}/svg/trash.svg`
  visibilityIcons = {
    visible: `${environment.appAssetsPath}/svg/visibility_on.svg`,
    visibility_disabled: `${environment.appAssetsPath}/svg/visibility_disabled.svg`,
    visibility_off: `${environment.appAssetsPath}/svg/visibility_off.svg`
  }
  private _masks$ = new BehaviorSubject<Mask[]>([]);
  public masks$ = this._masks$.asObservable()
  @Input() set masks(m: Mask[]) {
    this._masks$.next(m)
  };
  public maskIds$ = this.masks$.pipe(map(masks => masks.map(m => m.id)))
  maskViewData$: Observable<(Mask & { checked: boolean; selected: boolean })[]>
  maskColors$: Observable<string[]>;
  sliderOptions: Options = {
    floor: 0,
    ceil: 100
  }
  constructor(private store: Store<FullState>, public state: StateService) {
    this.maskViewData$ = combineLatest([this.state.annotation.showMaskIds$, this.state.annotation.masks$, this.state.annotation.selectedMaskId$]).pipe(
      map(([showIds, masks, selectedId]) => {
        return masks.map(m => {
          return {
            ...m,
            checked: showIds.includes(m.id),
            selected: m.id === selectedId
          }
        })
      }),
      shareReplay(1)
    )
  }
  maskIdIsShown(id: number) {
    return this.state.annotation.showMaskIds$.pipe(
      first(),
      map(ids => {
        return ids.includes(id)
      }))
  }
  maskSelected(id: number) {
    this.store.dispatch(selectMaskForAnnotation({ id }));
  }

  addMaskButtonClicked() {
    this.store.dispatch(MaskEntityActions.createMask())
  }

  removeMaskButtonClicked(mask: Mask) {
    if (mask.id < 0) {
      this.store.dispatch(MaskEntityActions.removeMask({ maskId: mask.id }))
    } else {
      this.store.dispatch(MaskEntityActions.requestDeleteMask({ maskId: mask.id }))
    }
  }

  onShowMaskSelect(id: number) {
    this.maskViewData$.pipe(
      first(),
      tap(masks => {
        const ids = masks.filter(m => m.checked).map(m => m.id)
        const idx = ids.indexOf(id)
        if (idx > -1) {
          ids.splice(idx, 1)
        } else {
          ids.push(id)
        }

        this.store.dispatch(selectMasksForAnnotationView({ ids }))
      })
    ).subscribe()
  }

  onZoomSliderChange(zoom: number) {
    this.store.dispatch(setAnnotationImageZoom({ zoom }))
  }
}
