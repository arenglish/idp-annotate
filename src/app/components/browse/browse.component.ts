import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { get } from 'lodash';
import { combineLatest, distinctUntilChanged, forkJoin, fromEvent, map, Observable, of, ReplaySubject, shareReplay, startWith, switchMap, tap, withLatestFrom, zip } from 'rxjs';
import { getServerAssetUrl } from 'src/app/pipes/server-asset.pipe';
import { ImageEntityActions } from 'src/app/state/entities/images.entities';
import { FullState } from 'src/app/state/main';
import { requestGenerateSegmentedMasks } from 'src/app/state/main/actions';
import { environment } from 'src/environments/environment';
import { Mask, SpectralImageSlim, TissueClass } from 'src/models/Database';
import { SegmentationMethods, SEGMENTATION_METHODS } from 'src/models/segmentation';
import { StateService } from 'src/services/state.service';
import { ImageSizeInfo } from '../annotate/annotate.component';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BrowseComponent {
  SEG_METHODS = SEGMENTATION_METHODS
  segMethods = SegmentationMethods
  imageBasePath = 'static'
  apiUrl = environment.urls.api
  visibleMasks$: Observable<{ [index: number]: Mask[] }>
  showMasks: { [index: number]: boolean } = {}
  selectedTissueClasses$: ReplaySubject<TissueClass[]> = new ReplaySubject<TissueClass[]>(1)
  imSizeInfo$: Observable<{ [index: number]: ImageSizeInfo }>
  loadingSpimMasks$: Observable<{ [index: number]: boolean }>;
  hoveredSpimId: number = -1

  constructor(public state: StateService, private store: Store<FullState>) {
    this.loadingSpimMasks$ = this.store.select(state => state.app.generatingMasksForSpims).pipe(
      distinctUntilChanged(),
      map(ids => {
        return ids.reduce((acc, id) => {
          acc[id] = true;
          return acc
        }, {} as { [index: number]: boolean })
      }), shareReplay(1)
    )
    this.visibleMasks$ = combineLatest([this.state.images$, this.selectedTissueClasses$]).pipe(
      map(([ims, tsc]) => {
        return ims.reduce((acc, im) => {
          acc[im.id] = get(im, 'masks', []).filter(m => tsc.find(ts => ts.pk === m.tissueId))

          return acc
        }, {} as { [index: number]: Mask[] })
      }),
      startWith([])
    )

    this.imSizeInfo$ = this.state.images$.pipe(
      switchMap(images => {
        return forkJoin(images.map(im => {
          const img = new Image();
          const listen = fromEvent(img, 'load');
          img.src = getServerAssetUrl(im.rgb)
          return zip(listen, of(img)).pipe(map(([listener, img]) => {
            return {
              id: im.id,
              resolution: {
                height: img.naturalHeight,
                width: img.naturalWidth
              },
              displayWidth: (250 / img.naturalHeight) * img.naturalWidth,
              displayHeight: 250,
              scale: 0
            }
          }));
        })).pipe(
          map(info => {
            return info.reduce((acc, inf) => {
              acc[inf.id] = inf
              return acc
            }, {} as { [index: number]: ImageSizeInfo })
          })
        )
      }),
      shareReplay(1)
    )
  }


  tissueClassSelectionChange(selectedTissues: TissueClass[]) {
    this.selectedTissueClasses$.next(selectedTissues)
  }

  autoSegmentImage(spimId: number, event: Event) {
    const segmentationMethod = parseInt(get(event, 'target.value', '') as string, 10)
    if (isNaN(segmentationMethod)) {
      return;
    }
    let text;
    if (confirm(`Auto-segment this image with ${SEGMENTATION_METHODS[segmentationMethod]} method?`) == true) {
      this.store.dispatch(requestGenerateSegmentedMasks({ spimId: spimId, segType: segmentationMethod }))
    }
  }

  trackBy(index: number, obj: SpectralImageSlim) {
    return obj.id
  }

  deleteSpimButtonClicked(id: number) {
    this.store.dispatch(ImageEntityActions.requestDeleteImage({ id }))
  }
}
