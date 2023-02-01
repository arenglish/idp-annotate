import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { COLOR_FILTERS } from 'src/models/color-styles';
import { Mask } from 'src/models/Database';
import { ImageSizeInfo } from '../annotate/annotate.component';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerComponent {
  MASK_COLORS = COLOR_FILTERS
  private _imageData$: Subject<string> = new ReplaySubject(1)
  public imageData$ = this._imageData$.asObservable()
  @Input() set imageData(im: string | null | undefined) {
    if (im) {
      this._imageData$.next(im)
    }
  }
  _visibleMasks$ = new ReplaySubject<Mask[]>(1);
  visibleMasks$ = this._visibleMasks$.asObservable();
  @Input() set visibleMasks(visibleMasks: Mask[] | null | undefined) {
    if (visibleMasks !== null && visibleMasks !== undefined) {
      this._visibleMasks$.next(visibleMasks)
    }
  }

  @Input() imgClass = ''
  @Input() maskClass = ''
  @Input() maskOverlayClass = ''

  @Input() selectedMaskId: number | null | undefined;

  @Input() maskOpacity: number | null = 1;
  @Input() imageSizeInfo: ImageSizeInfo | null;

  trackBy(index: number, e: Mask) {
    return e.pk
  }
}
