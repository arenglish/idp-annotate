import { createEntityAdapter, EntityAdapter, EntityState } from "@ngrx/entity";
import { createReducer, on } from "@ngrx/store";
import { uniq } from "lodash";
import { ANNOTATION_TOOLS, ANNOTATION_TOOL_MODES, Brush } from "src/models/annotation_tools";
import { COLOR_FILTERS } from "src/models/color-styles";
import { Mask } from "src/models/Database";
import { selectMaskForAnnotation, selectMasksForAnnotationView, setAnnotationImageZoom, setBrushMode, setBrushSize, setBrushType, setMaskColor, setMaskOpacity } from "./annotate.actions";

export interface AnnotateState extends EntityState<Mask> {
    maskOpacity: number;
    brush: Brush;
    selectedMaskIdsForView: number[];
    maskColors: { hex: string; filter: string }[];
    imageZoom: number;
}

export const AnnotateAdapter: EntityAdapter<Mask> = createEntityAdapter<Mask>();

const initialState: AnnotateState = AnnotateAdapter.getInitialState({
    maskOpacity: 100,
    brush: {
        type: ANNOTATION_TOOLS.BRUSH,
        size: 48,
        mode: ANNOTATION_TOOL_MODES.ADD
    },
    selectedMaskIdsForView: [],
    maskColors: [...COLOR_FILTERS],
    imageZoom: .5
})

export const annotateReducer = createReducer(
    initialState,
    on(setMaskOpacity, (state, action): AnnotateState => {
        return { ...state, maskOpacity: action.opacity }
    }),
    on(setAnnotationImageZoom, (state, action): AnnotateState => {
        return { ...state, imageZoom: action.zoom }
    }),
    on(setBrushType, (state, action): AnnotateState => {
        return { ...state, brush: { ...state.brush, type: action.brushType } }
    }),
    on(setBrushMode, (state, action): AnnotateState => {
        return { ...state, brush: { ...state.brush, mode: action.modeType } }
    }),
    on(setBrushSize, (state, action): AnnotateState => {
        return { ...state, brush: { ...state.brush, size: action.size } }
    }),
    on(selectMaskForAnnotation, (state, action): AnnotateState => {
        const showIds = uniq([...state.selectedMaskIdsForView, action.id])
        return { ...state, selectedMaskIdsForView: showIds }
    }),
    on(selectMasksForAnnotationView, (state, action) => {
        return { ...state, selectedMaskIdsForView: action.ids }
    }),
    on(setMaskColor, (state, action) => {
        const maskColors = [...state.maskColors]
        maskColors[action.index] = action.color
        return { ...state, maskColors }
    })

); 
