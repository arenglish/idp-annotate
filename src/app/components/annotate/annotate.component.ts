import { Component, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { findIndex, get } from 'lodash';
import { combineLatest, first, fromEvent, map, merge, Observable, of, shareReplay, startWith, switchMap, tap, zip } from 'rxjs';
import { Mask, SpectralImage, SpectralImageSlim } from 'src/models/Database';
import { Options } from '@angular-slider/ngx-slider';
import { CanvasComponent } from '../canvas/canvas.component';
import { StateService } from 'src/services/state.service';
import { AnnotateState } from 'src/app/state/annotate/annotate.state';
import { FullState } from 'src/app/state/main';
import { MaskEntityActions } from 'src/app/state/entities/masks.entities';

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
export class AnnotateComponent {
  brushSize$: Observable<number>;
  selectedImage$: Observable<SpectralImageSlim>;
  selectedMaskId$: Observable<number>;
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


  constructor(private store: Store<FullState>, public state: StateService) {
    this.brushSize$ = this.store.select(state => get(state, 'annotate.brush.size', 48)).pipe(shareReplay(1), startWith(48))
    this.selectedImage$ = state.annotation.selectedImage$

    this.selectedMaskId$ = this.state.annotation.selectedMaskId$.pipe(
      tap(m => console.log(m))
    )
    this.selectedMask$ = this.state.annotation.selectedMask$
    const zoom$ = this.store.select(state => state.annotate.imageZoom).pipe(shareReplay(1))

    this.imageMeta$ = combineLatest([zoom$, this.selectedImage$]).pipe(
      switchMap(([zoom, image]) => {
        const img = new Image();
        const listen = fromEvent(img, 'load');
        img.src = image.rgb
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
      tap(mask => {
        this.store.dispatch(MaskEntityActions.updateMask({
          mask: {
            ...mask,
            bitmap: maskData.data
          }
        }))
      })
    ).subscribe()
  }

}
