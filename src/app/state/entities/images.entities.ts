import { createEntityAdapter, EntityAdapter } from "@ngrx/entity";
import { createAction, createFeatureSelector, createReducer, createSelector, on, props } from "@ngrx/store";
import { SpectralImageSlim } from "src/models/Database";

const requestImages = createAction('[Images] Request Images');
const loadImages = createAction('[Images] Load Images', props<{ images: SpectralImageSlim[] }>());
const loadImage = createAction('[Images] Load Image', props<{ image: SpectralImageSlim }>());
const setSelectedImageId = createAction('[Images] Set Selected Image Id', props<{ id: number }>());

export const ImageEntityActions = {
    requestImages,
    loadImages,
    loadImage,
    setSelectedImageId
}
export const adapter: EntityAdapter<SpectralImageSlim> = createEntityAdapter<SpectralImageSlim>();

export interface ImageEntitiesState {
    selectedImageId: number;
}

const initialState = adapter.getInitialState({
    selectedImageId: -1
})


export const imageEntitiesReducer = createReducer(initialState,
    on(loadImages, (state, { images }) => {
        let s = adapter.removeAll(state)
        return adapter.addMany(images, s)
    }),
    on(loadImage, (state, { image }) => {
        let s = adapter.removeAll(state)
        return adapter.upsertOne(image, s)
    }),
    on(setSelectedImageId, (state, { id }) => {
        return {
            ...state,
            selectedImageId: id
        }
    })
)

const {
    selectIds,
    selectEntities,
    selectAll,
    selectTotal
} = adapter.getSelectors();

export const selectImageEntityState = createFeatureSelector<typeof initialState>('images');
export const ImageEntitySelectors = {
    selectedImageId: createSelector(selectImageEntityState, state => state.selectedImageId),
    selectTotal: createSelector(selectImageEntityState, selectTotal),
    selectIds: createSelector(selectImageEntityState, selectIds),
    selectEntities: createSelector(selectImageEntityState, selectEntities),
    selectAll: createSelector(selectImageEntityState, selectAll)
}