import { createEntityAdapter, EntityAdapter } from "@ngrx/entity";
import { createAction, createFeatureSelector, createReducer, createSelector, on, props } from "@ngrx/store";
import { COLOR_FILTERS } from "src/models/color-styles";
import { Mask } from "src/models/Database";
import { getUniqueColor } from "src/utils/color";
import { ID_NOT_SET, randomId } from "src/utils/ids";
import { selectMaskForAnnotation } from "../annotate/annotate.actions";

const loadMasks = createAction('[Masks] Load Masks', props<{ masks: Mask[] }>());
const removeMask = createAction('[Masks] Remove Mask', props<{ maskId: number }>());
const createMask = createAction('[Masks] Create Mask');
const updateMask = createAction('[Masks] Update Mask', props<{ mask: Pick<Mask, 'id'> & Partial<Mask>, id: number }>());
const requestCreateMask = createAction('[Masks] Request Create Mask', props<{ mask: Mask, spimId: number }>());
const requestDeleteMask = createAction('[Masks] Request Delete Mask', props<{ maskId: number }>());
const requestUpdateMask = createAction('[Masks] Request Update Mask', props<{ mask: Mask, spimId: number, deleteMaskOfIdOnSuccess?: number }>());
const mergeMasks = createAction('[Masks] Merge Masks', props<{ mask1Id: number, mask2Id: number }>())
const clearMasks = createAction('[Masks] Clear All Masks')


export const MaskEntityActions = {
    loadMasks,
    clearMasks,
    removeMask,
    createMask,
    updateMask,
    requestCreateMask,
    requestDeleteMask,
    requestUpdateMask,
    mergeMasks
}

const adapter: EntityAdapter<Mask> = createEntityAdapter<Mask>();

export interface MaskEntitiesState {
    selectedMaskId: number;
}

const initialState = adapter.getInitialState({
    selectedMaskId: -1
})

export const maskEntitiesReducer = createReducer(initialState,
    on(loadMasks, (state, action) => {
        let s = adapter.removeAll(state)
        return adapter.addMany(action.masks.map((m, idx) => {
            return {
                ...m,
                color: COLOR_FILTERS[idx].hex
            }
        }), state)

    }),
    on(createMask, (state, action) => {
        let s = adapter.addOne({
            id: randomId(),
            tissueId: ID_NOT_SET,
            classId: ID_NOT_SET,
            bitmap: '',
            color: getUniqueColor(state.ids.map(id => state.entities[id]?.color).filter(c => !!c) as string[])
        }, state)

        if (s.ids.length === 1) {
            s = {
                ...s,
                selectedMaskId: s.ids[0] as number
            }
        }

        return s
    }),
    on(updateMask, (state, action) => {
        return adapter.updateOne({
            id: action.id,
            changes: action.mask
        }, state)
    }),
    on(removeMask, (state, action) => {
        return adapter.removeOne(action.maskId, state)
    }),
    on(selectMaskForAnnotation, (state, action) => {
        return {
            ...state,
            selectedMaskId: action.id
        }
    }),
    on(clearMasks, (state, action) => {
        return adapter.removeAll(state)
    })
)

const {
    selectIds,
    selectEntities,
    selectAll
} = adapter.getSelectors();

export const selectMaskEntityState = createFeatureSelector<typeof initialState>('masks');

export const MaskEntitySelectors = {
    selectedMaskId: createSelector(selectMaskEntityState, state => state.selectedMaskId),
    selectIds: createSelector(selectMaskEntityState, selectIds),
    selectEntities: createSelector(selectMaskEntityState, selectEntities),
    selectAll: createSelector(selectMaskEntityState, selectAll),
}