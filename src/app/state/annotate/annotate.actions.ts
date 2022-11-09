import { createAction, props } from "@ngrx/store";
import { ANNOTATION_TOOLS, ANNOTATION_TOOL_MODES } from "src/models/annotation_tools";


// ANNOTATE

export const setAnnotationImageZoom = createAction(
    '[Annotate] Set Image Zoom',
    props<{ zoom: number }>()
)

export const setMaskOpacity = createAction(
    '[Annotate] Set Mask Opacity',
    props<{ opacity: number }>()
)


export const selectMaskForAnnotation = createAction(
    '[Annotate] Select Mask FOr Annotation',
    props<{ id: number }>()
)

export const selectMasksForAnnotationView = createAction(
    '[Annotate] Select Masks For Annotation View',
    props<{ ids: number[] }>()
)

export const setMaskColor = createAction(
    '[Annotate] Set Mask Rendering Color',
    props<{ index: number, color: { hex: string; filter: string } }>()
)

export const requestImage = createAction(
    '[Annotate] Request Image',
    props<{ id: number }>()
)

// ANNOTATION TOOLS
export const setBrushType = createAction(
    '[Annotate] Set Brush Type',
    props<{ brushType: ANNOTATION_TOOLS }>()
)

export const setBrushMode = createAction(
    '[Annotate] Set Brush Mode',
    props<{ modeType: ANNOTATION_TOOL_MODES }>()
)

export const setBrushSize = createAction(
    '[Annotate] Set Brush Size',
    props<{ size: number }>()
)

export const AnnotateActions = {
    setAnnotationImageZoom,
    setMaskOpacity,
    selectMaskForAnnotation,
    selectMasksForAnnotationView,
    setMaskColor,
    requestImage,
    setBrushType,
    setBrushMode,
    setBrushSize
}