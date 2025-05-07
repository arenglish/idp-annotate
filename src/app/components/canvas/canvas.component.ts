import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { BehaviorSubject, bufferTime, combineLatest, exhaustMap, filter, finalize, first, fromEvent, map, merge, mergeWith, Observable, of, pairwise, ReplaySubject, shareReplay, skipUntil, skipWhile, startWith, Subject, Subscription, switchMap, takeUntil, takeWhile, tap, timer, withLatestFrom, zip } from 'rxjs';
import { getServerAssetUrl } from 'src/app/pipes/server-asset.pipe';
import { ANNOTATION_TOOLS, ANNOTATION_TOOL_MODES, Brush } from 'src/models/annotation_tools';
import { Mask } from 'src/models/Database';
import { hexToRgb } from 'src/utils/color';
import { ImageSizeInfo } from '../annotate/annotate.component';

declare global {
  var UPNG: any;
}


const DEFAULT_TOOL = {
  type: ANNOTATION_TOOLS.BRUSH,
  size: 48,
  mode: ANNOTATION_TOOL_MODES.ADD
};

enum EVENT_TYPES {
  TouchEnd = 'touchend',
  TouchCancel = 'touchcancel',
  MouseUp = 'mouseup',
  MouseDown = 'mousedown'
}

type EventInfo = { event: MouseEvent | TouchEvent; coords: { x: number; y: number } }
type FillShapeEvent = 'Fill'
const FILL_SHAPE = 'Fill'

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CanvasComponent {
  private defaultGlobalCompositeOperation: any = 'source-over'
  private _tool$: BehaviorSubject<Brush> = new BehaviorSubject(DEFAULT_TOOL);
  public tool$: Observable<Brush> = this._tool$.asObservable();
  @Input() set tool(tool: Brush | null) {
    if (tool) {
      this._tool$.next({
        ...tool,
        size: Math.round((this.imageSizeInfo?.scale || 1) * tool.size)
      })
    }
  }

  private _disabled$ = new BehaviorSubject(true)
  public disabled$ = this._disabled$.asObservable()
  @Input() set disabled(d: boolean) {
    this._disabled$.next(d)
  }

  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('canvas_temp') canvasTemp: ElementRef;
  @ViewChild('brushCursor') brushCursor: ElementRef;
  cx: CanvasRenderingContext2D;
  drawingSubscription: Subscription;
  private _selectedMask$: Subject<Mask> = new ReplaySubject(1);
  public selectedMask$ = this._selectedMask$.asObservable();
  private defaultToolColor = '#fff'
  private toolColor = this.defaultToolColor

  @Input() set selectedMask(mask: Mask | null) {
    if (mask !== null) {
      this._selectedMask$.next(mask);
    }
  }

  subscriptions: Subscription[] = []
  private _imageSizeInfo$ = new BehaviorSubject<ImageSizeInfo>({
    id: 0,
    resolution: { width: 0, height: 0 },
    scale: 1,
    displayWidth: 0, displayHeight: 0
  })
  public imageSizeInfo$ = this._imageSizeInfo$.asObservable()
  @Input() set imageSizeInfo(info: ImageSizeInfo | null) {
    if (info) {
      this._imageSizeInfo$.next(info)
    }
  }

  pointerStyle$: Observable<{ class: string; size: number }> = combineLatest([this.tool$, this.imageSizeInfo$, this.disabled$]).pipe(
    map(([tool, imageSizeInfo, disabled]) => {
      if (disabled) {
        return {
          class: 'cursor_disabled',
          size: 0
        }
      }
      switch (tool.type) {
        case ANNOTATION_TOOLS.BRUSH:
          return {
            class: 'cursor_brush',
            size: Math.round(tool.size * imageSizeInfo.scale)
          };
        case ANNOTATION_TOOLS.FILL:
          return {
            class: 'cursor_fill',
            size: 0
          };
        default:
          return {
            class: '',
            size: 0
          }
      }
    }), shareReplay(1)
  )

  @Input() opacity: number = 1;

  pointerOrigin$: Observable<string> = this.pointerStyle$.pipe(map(style => `${style.size}px ${style.size}px`), shareReplay(1))

  @Output('updateMaskData') _updateMaskData: EventEmitter<{ id: number; data: string }> = new EventEmitter()
  private reset$: Subject<null | void> = new Subject<null | void>();

  private cursorDown$: Observable<EventInfo>;
  private cursorMove$: Observable<EventInfo>;
  private touchMove$: Observable<EventInfo>;
  private touchEnd$: Observable<EventInfo>;
  private cursorUp$: Observable<EventInfo>;
  private cursorDoubleClick$: Observable<EventInfo>;
  private linesToolFinish$: Observable<EventInfo>;
  public shapeDrawFirstTouchCoord: number[][]
  public shapeDrawPointCount: number = 0
  private fillCurrentShape$ = new Subject<FillShapeEvent>()

  public reset() {
    this.reset$.next()
  }

  public getToolEventFlow(tool: Brush) {
    switch (tool.type) {
      case ANNOTATION_TOOLS.BRUSH:
        return this.cursorDown$.pipe(
          switchMap(res => this.cursorMove$.pipe(takeUntil(this.cursorUp$), pairwise())),
          withLatestFrom(this.tool$),
          tap(([events, tool]) => {
            this.cx.lineWidth = tool.size
            this.cx.beginPath();
            this.cx.moveTo(events[0].coords.x, events[0].coords.y); // from
            this.cx.lineTo(events[1].coords.x, events[1].coords.y);
            this.cx.strokeStyle = this.toolColor

            if (tool.mode === ANNOTATION_TOOL_MODES.ADD) {
              this.cx.globalCompositeOperation = "source-over";
            } else if (tool.mode === ANNOTATION_TOOL_MODES.SUBTRACT) {
              this.cx.globalCompositeOperation = "destination-out";
            }
            this.cx.stroke()
            this.cx.globalCompositeOperation = this.defaultGlobalCompositeOperation
          })
        )
      case ANNOTATION_TOOLS.FILL:
        const done$ = new Subject<void>();
        return this.cursorDown$.pipe(
          exhaustMap(e => {
            const points = [[e.coords.x, e.coords.y]]
            this.shapeDrawFirstTouchCoord = points
            this.shapeDrawPointCount++
            this.cx.moveTo(points[0][0], points[0][1])
            this.cx.lineWidth = 1.5
            this.cx.strokeStyle = this.toolColor
            const canvasOriginal = this.canvas.nativeElement.toDataURL("image/png")

            const fillPoints = (points: number[][], color: string, context: CanvasRenderingContext2D, removeAndFill: boolean = false, strokeColor: string | null = null) => {
              context.moveTo(points[0][0], points[0][1])

              points.slice(1).forEach(point => {
                context.lineTo(point[0], point[1]);
              })

              if (removeAndFill) {
                context.globalCompositeOperation = "destination-out";
                context.fillStyle = 'white';
                context.fill()
              }
              context.globalCompositeOperation = "source-over";
              context.fillStyle = color;
              context.fill()

              if (strokeColor) {
                context.moveTo(points[points.length - 1][0], points[points.length - 1][1])
                context.lineTo(points[0][0], points[0][1])
                context.setLineDash([5, 3]);
                context.setLineDash([])
                context.strokeStyle = strokeColor;
                context.stroke();
              }

              context.globalCompositeOperation = this.defaultGlobalCompositeOperation;
            }
            // interval(100).pipe(
            //   tap(() => {

            //     fillPoints(points, 'rgba(255,255,255,.5)', this.canvasTemp.nativeElement.getContext('2d'), 'black');
            //   }),
            //   takeUntil(done$),
            //   takeUntil(this.reset$)
            // ).subscribe()

            return merge(this.cursorDown$, this.cursorDoubleClick$, this.touchEnd$, this.touchMove$, this.fillCurrentShape$).pipe(
              startWith(e),
              pairwise(),
              map(events => events[1] === FILL_SHAPE ? events as [any, FillShapeEvent] : events as [EventInfo, EventInfo]),
              switchMap(events => {
                this.shapeDrawPointCount++
                const cx = this.canvas.nativeElement.getContext('2d')
                cx.beginPath();

                if (events[1] === FILL_SHAPE || events[1].event.detail === 2) {
                  this.cx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
                  return zip([of(events), this.drawImToCanvas(this.canvas.nativeElement.getContext('2d'), canvasOriginal).pipe(
                    tap(() => {
                      const fillColor = tool.mode === ANNOTATION_TOOL_MODES.ADD ? this.toolColor : 'transparent'
                      fillPoints(points, fillColor, this.canvas.nativeElement.getContext('2d'), tool.mode === ANNOTATION_TOOL_MODES.SUBTRACT)
                      done$.next()
                    })
                  )])
                }

                return zip([of(events), of(null).pipe(
                  tap(() => {
                    const point = [events[1].coords.x, events[1].coords.y]
                    points.push(point)
                  })
                )])
              }),
              filter(([events]) => events[1] === FILL_SHAPE || events[1].event.detail !== 2),
              bufferTime(8),
              withLatestFrom(this.tool$),
              switchMap(([args, tool]) => {
                if (args.length === 0) {
                  return of()
                }
                return this.drawImToCanvas(this.canvas.nativeElement.getContext('2d'), canvasOriginal, 'copy').pipe(
                  tap(() => {
                    const fillColor = tool.mode === ANNOTATION_TOOL_MODES.ADD ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.2)'
                    fillPoints(points, fillColor, this.canvas.nativeElement.getContext('2d'), tool.mode === ANNOTATION_TOOL_MODES.SUBTRACT, 'black')
                  })
                )
              }),
              takeUntil(done$),
              takeUntil(this.reset$),
              finalize(() => this.shapeDrawPointCount = 0)
            )
          })
        )
      default:
        return of(null)
    }
  }

  fillCurrentShape() {
    this.fillCurrentShape$.next(FILL_SHAPE)
  }

  private getEventPosition(event: MouseEvent | TouchEvent) {
    const rect = this.canvas.nativeElement.getBoundingClientRect();

    if (event instanceof MouseEvent) {
      return {
        x: this.scaleInput(event.clientX - rect.left),
        y: this.scaleInput(event.clientY - rect.top)
      }
    } else {
      return {
        x: this.scaleInput(event.changedTouches[0].clientX - rect.left),
        y: this.scaleInput(event.changedTouches[0].clientY - rect.top)
      }
    }
  }

  ngAfterViewInit() {
    const canvasEl = this.canvas.nativeElement;

    this.cursorDown$ = merge(
      fromEvent(canvasEl, 'mousedown'), fromEvent(canvasEl, 'touchstart')).pipe(
        map(e => e as MouseEvent),
        map(event => {
          return {
            event,
            coords: this.getEventPosition(event)
          }
        })
      )

    this.touchMove$ = fromEvent(canvasEl, 'touchmove').pipe(
      map(e => e as MouseEvent),
      map(event => {
        return {
          event,
          coords: this.getEventPosition(event)
        }
      })
    )

    this.cursorMove$ = merge(
      fromEvent(canvasEl, 'mousemove'), fromEvent(canvasEl, 'touchmove')).pipe(
        map(e => e as MouseEvent),
        map(event => {
          return {
            event,
            coords: this.getEventPosition(event)
          }
        })
      )

    this.subscriptions.push(combineLatest([this.pointerStyle$, this.cursorMove$.pipe(bufferTime(6))]).pipe(
      filter(([pointerStyle, events]) => {
        return pointerStyle.class === 'cursor_brush' && events.length > 0
      }),
      tap(([pointerStyle, events]) => {
        this.brushCursor.nativeElement.style.left = this.scaleInput(events[events.length - 1].coords.x, false) - pointerStyle.size / 2 + 'px'
        this.brushCursor.nativeElement.style.top = this.scaleInput(events[events.length - 1].coords.y, false) - pointerStyle.size / 2 + 'px'
      })).subscribe())


    this.touchEnd$ = merge(
      merge(
        fromEvent(canvasEl, 'touchend'),
        fromEvent(canvasEl, 'touchcancel')
      ).pipe(map(e => e as MouseEvent),
        map(event => {
          return {
            event,
            coords: this.getEventPosition(event)
          }
        })
      )
    )

    this.cursorUp$ = merge(
      merge(
        fromEvent(canvasEl, 'mouseup'),
        fromEvent(canvasEl, 'mouseleave'),
        fromEvent(canvasEl, 'touchend'),
        fromEvent(canvasEl, 'touchcancel')
      ).pipe(map(e => e as MouseEvent),
        map(event => {
          return {
            event,
            coords: this.getEventPosition(event)
          }
        })
      )
    )

    this.cursorDoubleClick$ = merge(
      fromEvent(canvasEl, 'mousedown'),
      fromEvent(canvasEl, 'touchstart')
    ).pipe(
      map(e => e as MouseEvent),
      filter(e => e.detail === 2),
      map(event => {
        return {
          event,
          coords: this.getEventPosition(event)
        }
      })
    )


    this.cx = canvasEl.getContext('2d') as CanvasRenderingContext2D;

    this.cx.lineCap = 'round';
    this.cx.strokeStyle = this.toolColor;

    this.subscriptions.push(
      combineLatest([this.tool$, this.disabled$]).pipe(switchMap(([tool, disabled]) => disabled ? of() : this.getToolEventFlow(tool))).subscribe()
    )

    this.subscriptions.push(combineLatest([this.selectedMask$, this.reset$.pipe(startWith(null))]).pipe(
      tap(([mask, reset]) => {
        // this.toolColor = mask.color || this.defaultToolColor
        this.resetCanvas(mask.bitmap);
      })
    ).subscribe())
  }

  mergeExternalImage(imSrc: string, compositionOperation: any = 'source-over') {
    this.drawImToCanvas(this.cx, imSrc, compositionOperation)
  }

  drawImToCanvas(cx: CanvasRenderingContext2D, imSrc: string, compositionOperation: any = 'source-over') {
    const im = new Image();
    im.crossOrigin = "anonymous";

    const subj = new Subject<void>()
    fromEvent(im, 'load').pipe(
      tap(() => {
        cx.globalCompositeOperation = compositionOperation
        cx.drawImage(im, 0, 0);
        cx.globalCompositeOperation = this.defaultGlobalCompositeOperation
        subj.next();
      })
    ).subscribe()
    im.src = imSrc;

    return subj;
  }

  saveCanvas(emit = true) {
    const sub = new ReplaySubject<{ id: number; data: string }>(1)
    this.selectedMask$.pipe(
      first(),
      withLatestFrom(this.imageSizeInfo$),
      tap(([mask, sizeInfo]) => {
        const image = this.cx.getImageData(0, 0, sizeInfo.resolution.width, sizeInfo.resolution.height);
        const { data } = image;
        const { length } = data;
        const rgb = hexToRgb(mask.color!)

        // ensure image alpha is binary before saving
        for (let i = 0; i < length; i += 4) {
          const a = data[i + 3];

          if (a > 0) {
            data[i + 0] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
            data[i + 3] = 255;
          }
        }

        this.clearCanvas(this.canvas.nativeElement)
        this.clearCanvas(this.canvasTemp.nativeElement)
        this.cx.putImageData(image, 0, 0);
        const dataString: string = this.canvas.nativeElement.toDataURL("image/png")

        const updatedMask = {
          id: mask.id,
          data: dataString
        }

        if (emit) {
          this._updateMaskData.emit(updatedMask)
        }

        sub.next(updatedMask)
        // const png = UPNG.decode(this.cx.getImageData(0, 0, sizeInfo.resolution.width, sizeInfo.resolution.height).data.buffer)
        // const download = document.createElement('a');
        // download.href = dataString;
        // download.download = 'mask.png';
        // download.click();
      })
    ).subscribe()

    return sub
  }

  scaleInput(x: number, invert: boolean = true): number {
    return invert ? Math.round((1 / (this._imageSizeInfo$.getValue().scale || 1)) * x) : Math.round(this._imageSizeInfo$.getValue().scale * x)
  }

  private clearCanvas(canvas: HTMLCanvasElement) {
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
  }

  private resetCanvas(imSrc: string) {
    this.clearCanvas(this.canvas.nativeElement)
    this.clearCanvas(this.canvasTemp.nativeElement)

    if (imSrc) {
      this.drawImToCanvas(this.canvas.nativeElement.getContext('2d'), getServerAssetUrl(imSrc))
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
}
