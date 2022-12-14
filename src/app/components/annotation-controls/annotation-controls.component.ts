import { Options } from '@angular-slider/ngx-slider';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { setBrushMode, setBrushSize, setBrushType, setMaskOpacity } from 'src/app/state/annotate/annotate.actions';
import { FullState } from 'src/app/state/main';
import { ANNOTATION_TOOLS, ANNOTATION_TOOL_MODES } from 'src/models/annotation_tools';
import { StateService } from 'src/services/state.service';

@Component({
  selector: 'app-annotation-controls',
  templateUrl: './annotation-controls.component.html',
  styleUrls: ['./annotation-controls.component.scss']
})
export class AnnotationControlsComponent {
  toolTypes = [
    { name: ANNOTATION_TOOLS[ANNOTATION_TOOLS.BRUSH], type: ANNOTATION_TOOLS.BRUSH, icon: 'assets/svg/draw.svg' },
    { name: ANNOTATION_TOOLS[ANNOTATION_TOOLS.FILL], type: ANNOTATION_TOOLS.FILL, icon: 'assets/svg/poly_line.svg' }
  ]
  toolModes = [
    { name: ANNOTATION_TOOL_MODES[ANNOTATION_TOOL_MODES.ADD], type: ANNOTATION_TOOL_MODES.ADD, icon: 'assets/svg/plus_circle.svg'},
    { name: ANNOTATION_TOOL_MODES[ANNOTATION_TOOL_MODES.SUBTRACT], type: ANNOTATION_TOOL_MODES.SUBTRACT, icon: 'assets/svg/minus.svg'}
  ]
  sliderOptions: Options = {
    floor: 0,
    ceil: 100
  }
  constructor(private store: Store<FullState>, public state: StateService) { }

  setToolType(type: ANNOTATION_TOOLS) {
    this.store.dispatch(setBrushType({ brushType: type }))
  }

  setToolMode(type: ANNOTATION_TOOL_MODES) {
    this.store.dispatch(setBrushMode({ modeType: type }))
  }

  onOpacitySliderChange(opacity: number) {
    this.store.dispatch(setMaskOpacity({ opacity: opacity / 100 }))
  }

  onBrushSizeSliderChange(size: number) {
    this.store.dispatch(setBrushSize({ size }))
  }
}
