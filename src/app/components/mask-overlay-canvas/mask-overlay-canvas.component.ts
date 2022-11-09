import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { first, fromEvent, tap } from 'rxjs';

@Component({
  selector: 'app-mask-overlay-canvas',
  templateUrl: './mask-overlay-canvas.component.html',
  styleUrls: ['./mask-overlay-canvas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaskOverlayCanvasComponent {
  @Input() width: number;
  @Input() height: number;
  @Input() color: string | undefined;
  @Input() imageData: string;

  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>

  ngAfterViewInit(): void {
    const cx = this.canvas.nativeElement.getContext('2d')
    const im = new Image();

    if (cx) {
      fromEvent(im, 'load').pipe(
        first(),
        tap(() => {
          // const imdata = im.
          // for(let i = 0; i < 2; i += 4) {
          //   const red = data[i];
          //   const green = data[i + 1];
          //   const blue = data[i + 2];
          //   const alpha = data[i + 3];
          // }
          cx.drawImage(im, 0, 0, this.width, this.height);
        })
      ).subscribe()
      im.src = this.imageData;
    }
  }

}
