import { Options } from '@angular-slider/ngx-slider';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, first, map, Observable, shareReplay, tap } from 'rxjs';
import { getStaticAssetUrl } from 'src/app/pipes/app-asset.pipe';
import { selectMaskForAnnotation, selectMasksForAnnotationView, setAnnotationImageZoom } from 'src/app/state/annotate/annotate.actions';
import { MaskEntityActions } from 'src/app/state/entities/masks.entities';
import { FullState } from 'src/app/state/main';
import { environment } from 'src/environments/environment';
import { Mask } from 'src/models/Database';
import { StateService } from 'src/services/state.service';

@Component({
  selector: 'app-annotation-view-options',
  templateUrl: './annotation-view-options.component.html',
  styleUrls: ['./annotation-view-options.component.scss']
})
export class AnnotationViewOptionsComponent {
  add_mask_icon = getStaticAssetUrl('assets/svg/plus_circle.svg')
  trash_icon = getStaticAssetUrl('assets/svg/trash.svg')
  edit_icon = getStaticAssetUrl('assets/svg/edit.svg')
  visibilityIcons = {
    visible: getStaticAssetUrl('assets/svg/visibility_on.svg'),
    visibility_disabled: getStaticAssetUrl('assets/svg/visibility_disabled.svg'),
    visibility_off: getStaticAssetUrl('assets/svg/visibility_off.svg')
  }
  private _masks$ = new BehaviorSubject<Mask[]>([]);
  public masks$ = this._masks$.asObservable()
  @Input() set masks(m: Mask[]) {
    this._masks$.next(m)
  };
  public maskIds$ = this.masks$.pipe(map((masks: any[]) => masks.map(m => m.id)))
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

  onMaskNameChange(event: Event, mask: Mask) {
    this.store.dispatch(MaskEntityActions.updateMask({
      mask: {
        id: mask.id,
        name: (event.target as any).value
      },
      id: mask.id
    }))
  }

  maskColorSet(mask: Mask, color: string) {
    this.masks$.pipe(
      first(),
      tap(masks => {
        const _m = masks.find(m => m.id == mask.id) as Mask
        this.store.dispatch(MaskEntityActions.updateMask({
          mask: {
            ..._m,
            color
          },
          id: mask.id
        }))
      }
      )
    ).subscribe()
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
