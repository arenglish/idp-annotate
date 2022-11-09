import {
  createReducer,
  MetaReducer,
  on
} from '@ngrx/store';
import { setAnnotateMode } from './actions';
import { AnnotateState } from '../annotate/annotate.state';
import { environment } from 'src/environments/environment';
import { ImageEntitiesState } from '../entities/images.entities';
import { MaskEntitiesState } from '../entities/masks.entities';


export const initialState = {
  annotationIsActive: false
}
export interface State {
  annotationIsActive: boolean;
}

export type FullState = {
  app: State,
  annotate: AnnotateState,
  images: ImageEntitiesState,
  masks: MaskEntitiesState
}

export const appReducer = createReducer<State>(
  initialState,

  on(setAnnotateMode, (state, action) => {
    return { ...state, annotationIsActive: action.active }
  })
);


export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
