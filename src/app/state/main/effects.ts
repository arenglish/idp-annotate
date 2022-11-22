import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, of } from 'rxjs';
import { map, mergeMap, catchError, switchMap } from 'rxjs/operators';
import { AppService } from 'src/services/app.service';
import { StateService } from 'src/services/state.service';
import { AnnotateActions } from '../annotate/annotate.actions';
import { ImageEntityActions } from '../entities/images.entities';
import { MaskEntityActions } from '../entities/masks.entities';

@Injectable()
export class AppEffects {
    loadSpims$ = createEffect(() => this.actions$.pipe(
        ofType(ImageEntityActions.requestImages),
        mergeMap(() => this.appService.getSpims()
            .pipe(
                map(res => {
                    return ImageEntityActions.loadImages({ images: res.spims })
                }),
                catchError(() => EMPTY)
            ))
    )
    );

    loadSpim$ = createEffect(() => this.actions$.pipe(
        ofType(AnnotateActions.requestImage),
        mergeMap(({ id }) => this.appService.getSpim(id)
            .pipe(
                switchMap(res => {
                    return [ImageEntityActions.loadImage({ image: res }), MaskEntityActions.loadMasks({ masks: res.masks })]
                }),
                catchError(() => EMPTY)
            ))
    )
    );

    updateMask$ = createEffect(() => this.actions$.pipe(
        ofType(MaskEntityActions.requestUpdateMask),
        mergeMap(({ mask, spimId }) => this.appService.updateMask(mask, spimId).pipe(map(res => {
            return MaskEntityActions.updateMask({ mask, id: mask.id })
        }), catchError(() => EMPTY)))
    ))

    createMask$ = createEffect(() => this.actions$.pipe(
        ofType(MaskEntityActions.requestCreateMask),
        mergeMap(({ mask, spimId }) => this.appService.createMask(mask, spimId).pipe(
            map(res => {
                return MaskEntityActions.updateMask({
                    mask: {
                        ...mask,
                        ...res,
                        id: res.pk!
                    },
                    id: mask.id
                })
            }
            ),
            catchError(() => EMPTY))
        )
    ))

    deleteMask$ = createEffect(() => this.actions$.pipe(
        ofType(MaskEntityActions.requestDeleteMask),
        mergeMap(({ maskId }) => this.appService.deleteMask(maskId).pipe(
            map(res => {
                return MaskEntityActions.removeMask({
                    maskId
                })
            }
            ),
            catchError(() => EMPTY))
        )
    ))

    mergeMasks$ = createEffect(() => this.actions$.pipe(
        ofType(MaskEntityActions.mergeMasks),
        mergeMap(({ mask1Id, mask2Id }) => {
            this.state.annotation.mergeMasks$.next({ mask1Id, mask2Id })
            return of()
        })
    ), { dispatch: false })

    constructor(
        private actions$: Actions,
        private appService: AppService,
        private state: StateService
    ) { }
}