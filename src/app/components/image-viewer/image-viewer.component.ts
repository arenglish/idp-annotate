import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { COLOR_FILTERS } from 'src/models/color-styles';
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
  _visibleMasks$ = new ReplaySubject<{ id: number; bitmap: string; color: { hex: string; filter: string } }[]>(1);
  visibleMasks$ = this._visibleMasks$.asObservable();
  @Input() set visibleMasks(visibleMasks: { id: number; bitmap: string; color: { hex: string; filter: string } }[] | null) {
    if (visibleMasks) {
      this._visibleMasks$.next(visibleMasks)
    }
  }

  @Input() selectedMaskId: number | null;

  @Input() maskOpacity: number | null = 1;
  @Input() imageSizeInfo: ImageSizeInfo | null;

  trackBy(index: number) {
    return index
  }
}
