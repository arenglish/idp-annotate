import { Options } from '@angular-slider/ngx-slider';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { first, tap } from 'rxjs';
import { setBrushMode, setBrushSize, setBrushType, setMaskOpacity } from 'src/app/state/annotate/annotate.actions';
import { MaskEntityActions } from 'src/app/state/entities/masks.entities';
import { FullState } from 'src/app/state/main';
import { ANNOTATION_TOOLS, ANNOTATION_TOOL_MODES } from 'src/models/annotation_tools';
import { getMaskName } from 'src/models/Database';
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
    { name: ANNOTATION_TOOL_MODES[ANNOTATION_TOOL_MODES.ADD], type: ANNOTATION_TOOL_MODES.ADD, icon: 'assets/svg/plus_circle.svg' },
    { name: ANNOTATION_TOOL_MODES[ANNOTATION_TOOL_MODES.SUBTRACT], type: ANNOTATION_TOOL_MODES.SUBTRACT, icon: 'assets/svg/minus.svg' }
  ]
  toolTypesEnum = ANNOTATION_TOOLS
  toolModesEnum = ANNOTATION_TOOL_MODES
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

  mergeMasksButtonClicked(mask1Id: number | string, mask2Id: number | string) {
    this.state.annotation.masks$.pipe(
      first(),
      tap(masks => {
        if (typeof mask1Id === 'string') {
          mask1Id = parseInt(mask1Id, 10)
        }
        if (typeof mask2Id === 'string') {
          mask2Id = parseInt(mask2Id, 10)
        }
        const mask1 = masks.find(m => m.id === mask1Id)
        const mask2 = masks.find(m => m.id === mask2Id)

        if (!mask1 || !mask2) {
          return
        }

        if (confirm(`Merge "${getMaskName(mask2)}" into "${getMaskName(mask1)}"?`)) {
          this.store.dispatch(MaskEntityActions.mergeMasks({
            mask1Id,
            mask2Id
          }))
        }


      })
    ).subscribe()

  }
}
