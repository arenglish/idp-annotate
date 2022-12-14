import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { NgxUploaderModule } from 'ngx-uploader';
import { UploadComponent } from './components/upload/upload.component';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from 'src/environments/environment';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects'
import { AppService } from 'src/services/app.service';
import { AnnotateComponent } from './components/annotate/annotate.component';
import { BrowseComponent } from './components/browse/browse.component';
import { ReactiveFormsModule } from '@angular/forms';
import { GetDbStaticAssetPrefix } from './pipes/static-asset.pipe';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { CanvasComponent } from './components/canvas/canvas.component';
import { AnnotationControlsComponent } from './components/annotation-controls/annotation-controls.component';
import { AnnotationViewOptionsComponent } from './components/annotation-view-options/annotation-view-options.component';
import { StateService } from 'src/services/state.service';
import { ImageViewerComponent } from './components/image-viewer/image-viewer.component';
import { appReducer } from './state/main';
import { annotateReducer } from './state/annotate/annotate.state';
import { AppEffects } from './state/main/effects';
import { imageEntitiesReducer } from './state/entities/images.entities';
import { maskEntitiesReducer } from './state/entities/masks.entities';
import { MaskOverlayCanvasComponent } from './components/mask-overlay-canvas/mask-overlay-canvas.component';

@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    AnnotateComponent,
    BrowseComponent,
    GetDbStaticAssetPrefix,
    CanvasComponent,
    AnnotationControlsComponent,
    AnnotationViewOptionsComponent,
    ImageViewerComponent,
    MaskOverlayCanvasComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    StoreModule.forRoot({
      app: appReducer,
      images: imageEntitiesReducer,
      masks: maskEntitiesReducer,
      annotate: annotateReducer
    }),
    EffectsModule.forRoot([AppEffects]),
    NgxUploaderModule,
    ReactiveFormsModule,
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
      autoPause: true, // Pauses recording actions and state changes when the extension window is not open
    }),
    NgxSliderModule
  ],
  providers: [AppService, StateService],
  bootstrap: [AppComponent]
})
export class AppModule { }
