import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnnotateComponent } from './components/annotate/annotate.component';
import { BrowseComponent } from './components/browse/browse.component';
import { UploadComponent } from './components/upload/upload.component';
import { AnnotateGuard } from './guards/annotate.guard';
import { BrowseComponentGuard } from './guards/browse.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/upload',
    pathMatch: 'full'
  },
  {
    path: 'upload',
    component: UploadComponent
  },
  {
    path: 'browse',
    canActivate: [BrowseComponentGuard],
    component: BrowseComponent
  },
  {
    path: 'annotate/:imageId',
    component: AnnotateComponent,
    canActivate: [AnnotateGuard],
    canDeactivate: [AnnotateGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AnnotateGuard, BrowseComponentGuard]
})
export class AppRoutingModule { }
