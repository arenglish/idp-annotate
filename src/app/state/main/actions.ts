import { createAction, props } from '@ngrx/store';
import { TissueClass } from 'src/models/Database';
import { SEGMENTATION_METHODS } from 'src/models/segmentation';

export const setAnnotateMode = createAction(
  '[App] Set Annotate Mode',
  props<{ active: boolean }>()
)

export const loadTissueClasses = createAction(
  '[App] Load TissueClasses',
  props<{ tissueClasses: TissueClass[] }>()
)

export const requestTissueClasses = createAction(
  '[App] Request TissueClasses'
)

export const addGeneratingMasksStatus = createAction(
  '[App] Add GeneratingMasks Status',
  props<{ spimId: number }>()
)

export const removeGeneratingMasksStatus = createAction(
  '[App] Remove GeneratingMasks Status',
  props<{ spimId: number }>()
)

export const requestGenerateSegmentedMasks = createAction('[App] Request Segmentation', props<{ spimId: number; segType?: SEGMENTATION_METHODS }>())
