import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { find, get } from "lodash";
import { combineLatest, distinctUntilChanged, filter, map, Observable, of, OperatorFunction, shareReplay, Subject, tap, withLatestFrom } from "rxjs";
import { ImageEntitySelectors } from "src/app/state/entities/images.entities";
import { MaskEntitySelectors } from "src/app/state/entities/masks.entities";
import { FullState } from "src/app/state/main";
import { Brush } from "src/models/annotation_tools";
import { Mask, SpectralImageSlim, TissueClass } from "src/models/Database";

@Injectable()
export class StateService {
    public images$: Observable<SpectralImageSlim[]>;
    public tissueClasses$: Observable<TissueClass[]>;
    public annotation: {
        selectedMaskId$: Observable<number>;
        selectedMask$: Observable<Mask | null>;
        masks$: Observable<Mask[]>;
        selectedImage$: Observable<SpectralImageSlim>;
        showMaskIds$: Observable<number[]>;
        showMasks$: Observable<Mask[]>;
        maskOpacity$: Observable<number>;
        maskColors$: Observable<{ hex: string; filter: string }[]>;
        tool$: Observable<Brush>;
        mergeMasks$: Subject<{ mask1Id: number; mask2Id: number }>;
        saveActiveMask$: Subject<void>;
    }


    constructor(private store: Store<FullState>) {
        this.tissueClasses$ = this.store.select(state => {
            return state.tissueClasses
        }).pipe(distinctUntilChanged(), shareReplay(1))
        this.images$ = this.store.select(ImageEntitySelectors.selectAll)
        const masksEntities$ = this.store.select(MaskEntitySelectors.selectEntities);
        const masks$ = this.store.select(MaskEntitySelectors.selectAll);
        const selectedImageId$ = this.store.select(ImageEntitySelectors.selectedImageId)
        const selectedMaskId$ = this.store.select(MaskEntitySelectors.selectedMaskId)
        const selectedImage$ = combineLatest(this.store.select(ImageEntitySelectors.selectEntities), selectedImageId$).pipe(map(([imagesMap, selectedId]) => {
            return imagesMap[selectedId]
        }), filter(im => !!im) as OperatorFunction<undefined | SpectralImageSlim, SpectralImageSlim>, shareReplay(1))
        const selectedMask$ = combineLatest([selectedMaskId$, masksEntities$]).pipe(map(([id, masks]) => {
            return masks[id] || null
        }), shareReplay(1))
        const showMaskIds$ = this.store.select(state => state.annotate.selectedMaskIdsForView).pipe(shareReplay(1))
        const showMasks$ = combineLatest([showMaskIds$, masks$]).pipe(map(([maskIds, masks]) => {
            return masks.filter(mask => maskIds.includes(mask.id))
        }), shareReplay(1))

        const maskOpacity$ = this.store.select(state => state.annotate.maskOpacity).pipe(shareReplay(1))
        const maskColors$ = this.store.select(state => state.annotate.maskColors).pipe(shareReplay(1))
        const tool$ = this.store.select(state => state.annotate.brush)

        this.annotation = {
            selectedImage$,
            masks$,
            selectedMask$,
            selectedMaskId$,
            showMaskIds$,
            showMasks$,
            maskOpacity$,
            maskColors$,
            tool$,
            mergeMasks$: new Subject(),
            saveActiveMask$: new Subject()
        }


    }
}