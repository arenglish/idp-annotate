import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY, of, zip } from 'rxjs';
import { map, mergeMap, catchError, switchMap, withLatestFrom, tap, first } from 'rxjs/operators';
import { AppService } from 'src/services/app.service';
import { StateService } from 'src/services/state.service';
import { FullState } from '.';
import { AnnotateActions } from '../annotate/annotate.actions';
import { ImageEntityActions } from '../entities/images.entities';
import { MaskEntityActions } from '../entities/masks.entities';
import { addGeneratingMasksStatus, loadTissueClasses, removeGeneratingMasksStatus, requestGenerateSegmentedMasks, requestTissueClasses } from './actions';

@Injectable()
export class AppEffects {
    loadSpims$ = createEffect(() => this.actions$.pipe(
        ofType(ImageEntityActions.requestImages),
        mergeMap(() => this.appService.getSpims()
            .pipe(
                map(res => {
                    return ImageEntityActions.loadImages({ images: res.spims })
                }),
                catchError((err) => {
                    console.log(err)
                    return EMPTY
                }
                )
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
                catchError((err) => {
                    console.log(err)
                    return EMPTY
                }
                )
            ))
    )
    );

    deleteSpim$ = createEffect(() => this.actions$.pipe(
        ofType(ImageEntityActions.requestDeleteImage),
        mergeMap(({ id }) => this.appService.deleteSpim(id).pipe(
            first(),
            map(res => {
                return ImageEntityActions.removeImage({ id })
            }),
            catchError((err) => {
                console.log(err)
                return EMPTY
            }
            ))
        )
    )
    );

    loadTissueClasses$ = createEffect(() => this.actions$.pipe(
        ofType(requestTissueClasses),
        mergeMap(() => this.appService.getTissueClasses()
            .pipe(
                map(tissueClasses => {
                    return loadTissueClasses({ tissueClasses: tissueClasses.TissueClass })
                }),
                catchError((err) => {
                    console.log(err)
                    return EMPTY
                }
                )
            ))
    )
    );

    updateMask$ = createEffect(() => this.actions$.pipe(
        ofType(MaskEntityActions.requestUpdateMask),
        mergeMap(({ mask, spimId, deleteMaskOfIdOnSuccess }) => this.appService.updateMask(mask, spimId).pipe(switchMap(res => {
            if (deleteMaskOfIdOnSuccess !== undefined) {
                return this.appService.deleteMask(deleteMaskOfIdOnSuccess).pipe(tap(() => {
                    this.store.dispatch(MaskEntityActions.removeMask({ maskId: deleteMaskOfIdOnSuccess }))
                }))
            } else {
                return of()
            }
        }), map(res => {
            return MaskEntityActions.updateMask({ mask, id: mask.id })
        }), catchError((err) => {
            console.log(err)
            return EMPTY
        }
        )))
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
            catchError((err) => {
                console.log(err)
                return EMPTY
            }
            ))
        )
    ))

    deleteMask$ = createEffect(() => this.actions$.pipe(
        ofType(MaskEntityActions.requestDeleteMask),
        mergeMap(({ maskId }) => this.appService.deleteMask(maskId).pipe(
            map(res => {
                return MaskEntityActions.removeMask({
                    maskId
                })
            }),
            catchError((err) => {
                console.log(err)
                return EMPTY
            })
        )
        )
    ))

    mergeMasks$ = createEffect(() => this.actions$.pipe(
        ofType(MaskEntityActions.mergeMasks),
        mergeMap(({ mask1Id, mask2Id }) => {
            this.state.annotation.mergeMasks$.next({ mask1Id, mask2Id })
            return of()
        }),
        catchError((err) => {
            console.log(err)
            return EMPTY
        })
    ), { dispatch: false })

    generateSegmentedMasks$ = createEffect(() => this.actions$.pipe(
        ofType(requestGenerateSegmentedMasks),
        mergeMap(({ spimId, segType }) => {
            this.store.dispatch(addGeneratingMasksStatus({ spimId }))
            return this.appService.generateSegmentedMasks(spimId, segType).pipe(
                withLatestFrom(this.store.select(state => state.images.selectedImageId)),
                switchMap(([res, selectedSpimId]) => {
                    const additionalActions = []

                    if (spimId === selectedSpimId) {
                        additionalActions.push(MaskEntityActions.clearMasks())
                        additionalActions.push(MaskEntityActions.loadMasks({ masks: res.masks }))
                    }
                    return [ImageEntityActions.updateImage({ id: spimId, image: { masks: res.masks } }), removeGeneratingMasksStatus({ spimId })]
                }
                ),
                catchError((err) => {
                    console.log(err)
                    this.store.dispatch(removeGeneratingMasksStatus({ spimId }))
                    return EMPTY
                }
                ))
        }
        )
    ))

    constructor(
        private actions$: Actions,
        private appService: AppService,
        private state: StateService,
        private store: Store<FullState>
    ) { }
}