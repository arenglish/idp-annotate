import {
  createReducer,
  MetaReducer,
  on
} from '@ngrx/store';
import { addGeneratingMasksStatus, loadTissueClasses, removeGeneratingMasksStatus, setAnnotateMode } from './actions';
import { AnnotateState } from '../annotate/annotate.state';
import { environment } from 'src/environments/environment';
import { ImageEntitiesState } from '../entities/images.entities';
import { MaskEntitiesState } from '../entities/masks.entities';
import { TissueClass } from 'src/models/Database';


export const initialState = {
  annotationIsActive: false,
  generatingMasksForSpims: []
}
export interface State {
  annotationIsActive: boolean;
  generatingMasksForSpims: number[];
}

export type FullState = {
  app: State,
  annotate: AnnotateState,
  images: ImageEntitiesState,
  masks: MaskEntitiesState,
  tissueClasses: TissueClass[]
}

export const appReducer = createReducer<State>(
  initialState,

  on(setAnnotateMode, (state, action) => {
    return { ...state, annotationIsActive: action.active }
  }),
  on(addGeneratingMasksStatus, (state, action) => {
    return { ...state, generatingMasksForSpims: [...state.generatingMasksForSpims, action.spimId] }
  }),
  on(removeGeneratingMasksStatus, (state, action) => {
    const newArr = [...state.generatingMasksForSpims]
    newArr.splice(state.generatingMasksForSpims.indexOf(action.spimId), 1)
    return { ...state, generatingMasksForSpims: newArr }
  })
);

export const tissueClassesReducer = createReducer<TissueClass[]>(
  [],
  on(loadTissueClasses, (state, action) => {
    return [...action.tissueClasses]
  })
)


export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
