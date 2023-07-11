import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MediaUploadComponent } from './media-upload/media-upload.component';
import { ContentComponent } from './content/content.component';

const routes: Routes = [
  { path: 'post', component: MediaUploadComponent },
  { path: 'content', component: ContentComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
