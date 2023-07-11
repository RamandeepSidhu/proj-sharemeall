import { Component } from '@angular/core';
// declare var $: any; // Add this line

@Component({
  selector: 'app-media-upload',
  templateUrl: './media-upload.component.html',
  styleUrls: ['./media-upload.component.scss']
})
export class MediaUploadComponent {
  // mydata: { url: string; type: string; name?: string }[] = [];

  // onSelectFile(e:anyvent: any) {
  //   const files = event.target.files;
  //   if (files) {
  //     for (const file of files) {
  //       const reader = new FileReader();
  //       reader.onload = (e:any: any) => {
  //         const url = e.target.result;
  //         const type = file.type.indexOf("image") > -1 ? "img" : "video";
  //         this.mydata.push({ url, type });
  //       };
  //       reader.readAsDataURL(file);
  //     }
  //   }
  // }

  // uploadMedia() {
  //   setTimeout(() => {
  //     window.open('https://www.instagram.com/', '_blank');
  //     this.mydata = [];
  //   }, 2000);
  // }
  mydata: { url: string; type: string }[] = [];
  slickCarouselOptions: any = {
    slidesToShow: 4,
    slidesToScroll: 4,
    prevArrow: '<button type="button" class="slick-prev">Previous</button>',
    nextArrow: '<button type="button" class="slick-next">Next</button>',
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

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

  uploadMedia() {
    setTimeout(() => {
      window.open('https://www.instagram.com/', '_blank');
      this.mydata = [];
    }, 2000);
  }

}