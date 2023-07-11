import { Component } from '@angular/core';

@Component({
  selector: 'app-media-upload',
  templateUrl: './media-upload.component.html',
  styleUrls: ['./media-upload.component.scss']
})
export class MediaUploadComponent {
  mydata: { url: string; type: string }[] = [];

  onSelectFile(event: any) {
    const files = event.target.files;
    if (files) {
      for (const file of files) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          if (file.type.indexOf("image") > -1) {
            this.mydata.push({
              url: e.target.result,
              type: 'img'
            });
          } else if (file.type.indexOf("video") > -1) {
            this.mydata.push({
              url: e.target.result,
              type: 'video'
            });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }
}
