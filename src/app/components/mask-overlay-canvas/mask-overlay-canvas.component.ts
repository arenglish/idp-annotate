import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { buffer, catchError, combineLatest, filter, first, fromEvent, map, of, ReplaySubject, Subject, Subscription, tap } from 'rxjs';
import { getServerAssetUrl } from 'src/app/pipes/server-asset.pipe';
import { hexToRgb } from 'src/utils/color';

@Component({
  selector: 'app-mask-overlay-canvas',
  templateUrl: './mask-overlay-canvas.component.html',
  styleUrls: ['./mask-overlay-canvas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaskOverlayCanvasComponent {
  @Input() width: number;
  @Input() height: number;
  private _color$ = new ReplaySubject<string>(1)
  public color$ = this._color$.asObservable()
  @Input() set color(c: string | undefined | null) {
    if (c !== undefined && c !== null) {
      this._color$.next(c)
    }
  }

  private _imageData$ = new ReplaySubject<string>(1);
  public imageData$ = this._imageData$.asObservable()
  @Input() set imageData(d: string | undefined | null) {
    if (d !== undefined && d !== null) {
      this._imageData$.next(d)
    }
  }

  private viewInitialized$ = new ReplaySubject<void>(1)

  private subscriptions: Subscription[] = []

  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>
  @Input() canvasClass: string = ''

  constructor() {
    this.subscriptions.push(combineLatest([this._color$, this._imageData$, this.viewInitialized$]).pipe(
      tap(([color, data, viewInit]) => {
        this.redraw(color, data)
      })
    ).subscribe())
  }

  ngAfterViewInit() {
    this.viewInitialized$.next()
  }

  redraw(color: string, data: string) {
    const cx = this.canvas.nativeElement.getContext('2d')
    const im = new Image();
    im.crossOrigin = "anonymous";

    if (cx) {
      fromEvent(im, 'load').pipe(
        first(),
        tap(() => {
          cx.drawImage(im, 0, 0, this.width, this.height);

          const image = cx.getImageData(0, 0, this.width, this.height);
          const { data } = image;
          const { length } = data;

          for (let i = 0; i < length; i += 4) { // red, green, blue, and alpha
            const r = data[i + 0];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a > 0) {
              const rgb = hexToRgb(color)
              data[i + 0] = rgb.r;
              data[i + 1] = rgb.g;
              data[i + 2] = rgb.b;
            }
          }

          cx.putImageData(image, 0, 0);
        }),
        catchError(err => of(console.log(err)))
      ).subscribe()
      im.src = getServerAssetUrl(data);
    }
  }

}
