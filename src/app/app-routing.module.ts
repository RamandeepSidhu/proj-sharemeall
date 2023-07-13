import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MediaUploadComponent } from './media-upload/media-upload.component';
import { PrivcayPolicayComponent } from './privcay-policay/privcay-policay.component';
import { AppComponent } from './app.component';

const routes: Routes = [
  // { path: '', component: AppComponent },
  { path: 'privacy-policy', component: PrivcayPolicayComponent },
  { path: 'media', component: MediaUploadComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
