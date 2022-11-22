import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { findIndex, get } from 'lodash';
import { combineLatest, first, fromEvent, map, merge, Observable, of, shareReplay, startWith, Subscription, switchMap, tap, withLatestFrom, zip } from 'rxjs';
import { Mask, SpectralImage, SpectralImageSlim } from 'src/models/Database';
import { Options } from '@angular-slider/ngx-slider';
import { CanvasComponent } from '../canvas/canvas.component';
import { StateService } from 'src/services/state.service';
import { AnnotateState } from 'src/app/state/annotate/annotate.state';
import { FullState } from 'src/app/state/main';
import { MaskEntityActions } from 'src/app/state/entities/masks.entities';
import { ANNOTATION_TOOLS } from 'src/models/annotation_tools';
import { getServerAssetUrl } from 'src/app/pipes/server-asset.pipe';

export interface ImageSizeInfo {
  id: number;
  resolution: {
    height: number;
    width: number;
  };
  displayWidth: number;
  displayHeight: number;
  scale: number;
}

@Component({
  selector: 'app-annotate',
  templateUrl: './annotate.component.html',
  styleUrls: ['./annotate.component.scss']
})
export class AnnotateComponent implements OnDestroy {
  toolTypes = ANNOTATION_TOOLS;
  brushSize$: Observable<number>;
  selectedImage$: Observable<SpectralImageSlim>;
  selectedMask$: Observable<Mask>;
  annotationState$: Observable<AnnotateState>;
  sliderOptions: Options = {
    floor: 0,
    ceil: 100
  }
  imageMeta$: Observable<ImageSizeInfo>;
  maxImageWidth = 1200;
  @ViewChild(CanvasComponent) canvasComponent: CanvasComponent;
  visibleMasksData$: Observable<{ id: number; bitmap: string; color: { hex: string; filter: string } }[]>;
  imageZoom$: Observable<number>;
  subscriptions: Subscription[] = []


  constructor(private store: Store<FullState>, public state: StateService) {
    this.subscriptions.push(
      this.state.annotation.mergeMasks$.pipe(
        switchMap(op => {
          if (op) {
            return this.state.annotation.masks$.pipe(
              map(masks => masks.find(m => m.id == op.mask2Id)),
              tap(mask => this.canvasComponent.mergeExternalImage(getServerAssetUrl(mask?.bitmap || '')))
            )
          }
          else {
            return of()
          }
        })
      ).subscribe()
    )
    this.brushSize$ = this.store.select(state => get(state, 'annotate.brush.size', 48)).pipe(shareReplay(1), startWith(48))
    this.selectedImage$ = state.annotation.selectedImage$

    this.selectedMask$ = this.state.annotation.selectedMask$
    const zoom$ = this.store.select(state => state.annotate.imageZoom).pipe(shareReplay(1))

    this.imageMeta$ = combineLatest([zoom$, this.selectedImage$]).pipe(
      switchMap(([zoom, image]) => {
        const img = new Image();
        const listen = fromEvent(img, 'load');
        img.src = getServerAssetUrl(image.rgb)
        return zip(listen, of(img), of(image), of(zoom));
      }),
      map(([event, img, im, zoom]) => {
        return {
          id: im.id,
          resolution: {
            height: img.naturalHeight,
            width: img.naturalWidth
          },
          displayWidth: img.naturalWidth * zoom,
          displayHeight: img.naturalHeight * zoom,
          scale: zoom
        }
      }),
      shareReplay(1)
    )

    this.visibleMasksData$ = combineLatest([this.state.annotation.masks$, this.state.annotation.maskColors$, this.state.annotation.showMaskIds$]).pipe(
      map(([masks, colors, maskIds]) => {
        return maskIds.map(id => {
          const maskIdx = findIndex(masks, m => m.id == id)
          return {
            id,
            bitmap: get(masks, [maskIdx, 'bitmap']),
            color: colors[maskIdx]
          }
        })
      })
    )

  }

  updateMaskData(maskData: { id: number; data: string }) {
    this.selectedMask$.pipe(
      first(),
      withLatestFrom(this.selectedImage$),
      tap(([mask, spim]) => {
        if (mask.id < 0) {
          this.store.dispatch(MaskEntityActions.requestCreateMask({
            mask: {
              ...mask,
              bitmap: maskData.data
            },
            spimId: spim.id
          }))
        } else {
          this.store.dispatch(MaskEntityActions.requestUpdateMask({
            mask: {
              ...mask,
              bitmap: maskData.data
            },
            spimId: spim.id
          }))
        }

      })
    ).subscribe()
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

}
