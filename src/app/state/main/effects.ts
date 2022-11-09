import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { map, mergeMap, catchError, switchMap } from 'rxjs/operators';
import { AppService } from 'src/services/app.service';
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

    constructor(
        private actions$: Actions,
        private appService: AppService
    ) { }
}