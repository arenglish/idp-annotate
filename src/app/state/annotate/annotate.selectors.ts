import { createSelector } from "@ngrx/store";
import { find, get } from "lodash";
import { FullState } from "../main";

export const AnnotateSelectors = {
    selectedImage: createSelector((state: FullState) => state, state => {
        return find(get(state.app, ['db', 'images']), im => im.id === state.annotate.selectedImageId)
    })
}