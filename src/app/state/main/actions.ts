import { createAction, props } from '@ngrx/store';

export const setAnnotateMode = createAction(
  '[App] Set Annotate Mode',
  props<{ active: boolean }>()
)
