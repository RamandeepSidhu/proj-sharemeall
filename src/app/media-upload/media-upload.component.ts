import { Component, Input } from '@angular/core';
import { ChatGptService } from '../Services/chat-gpt.service';
export class textResponse {
  sno: number = 1;
  text: string = '';
  response: string = '';
}
@Component({
  selector: 'app-media-upload',
  templateUrl: './media-upload.component.html',
  styleUrls: ['./media-upload.component.scss']
})
export class MediaUploadComponent {
  mydata: { url: string; type: string; name?: string }[] = [];
  isButtonDisabled!: false;
  isCopied: boolean = false;

  textList: textResponse[] = [{ sno: 1, text: '', response: '' }];
  showSpinner = false;
  cardText: any;
  writeText!: any;
  constructor(private openaiService: ChatGptService) { }

  onSelectFile(event: any) {
    const files = event.target.files;
    if (files) {
      for (const file of files) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          const url = event.target.result;
          const type = file.type.indexOf("image") > -1 ? "img" : "video";
          this.mydata.push({ url, type });
        };
        reader.readAsDataURL(file);
      }
    }
  }

  post() {
    setTimeout(() => {
      this.authorizeInstagram();
      localStorage.setItem('mydata', JSON.stringify(this.mydata));
      const dataList: textResponse[] = []; // Replace this with your actual dataList
      const generatedTextPromises = dataList.map((data: textResponse) => {
        return this.openaiService.generateText(data.text).then((text: any) => {
          data.response = text;
          return data;
        });
      });
      localStorage.setItem('mydata', JSON.stringify(this.mydata.map(item => ({ url: item.url ?? '', type: item.type }))));

      Promise.all(generatedTextPromises)
        .then((generatedTexts) => {
          localStorage.setItem('generatedTexts', JSON.stringify(generatedTexts));
          this.mydata = [];
        })
        .catch((error) => {
          console.error('Failed to generate text:', error);
          this.mydata = [];
        });
    }, 2000);
  }




  // ChatGPT
  generateText(dataList: textResponse[]) {
    this.showSpinner = true;
    const generatedTextPromises = dataList.map((data: textResponse) => {
      return this.openaiService.generateText(data.text).then((text: any) => {
        data.response = text;
        this.textList.unshift({ sno: 0, text: data.text, response: text });
        this.cardText = this.textList.find(f => f.response);
        this.writeText = this.textList.find(f => f.text);
        this.isCopied = false;
        return { text, response: text };
      });
    });

    Promise.all(generatedTextPromises)
      .then((generatedTexts) => {
        // Store generated texts in local storage
        localStorage.setItem('generatedTexts', JSON.stringify(generatedTexts));
        this.showSpinner = false;
      })
      .catch((error) => {
        console.error('Failed to generate text:', error);
        this.showSpinner = false;
      });
  }

  copyResponse(response: string) {
    navigator.clipboard.writeText(response)
      .then(() => {
        console.log('Response copied!');
      })
      .catch((error) => {
        console.error('Failed to copy response:', error);
      });
    this.isCopied = true;
  }
  authorizeInstagram() {
    // const clientId = '670732831755066';
    // const redirectUri = 'https://socialsizzle.herokuapp.com/auth/';
    // const scope = 'user_profile,user_media';

    const authorizationUrl =
      'https://www.instagram.com/accounts/login/?force_authentication=1&enable_fb_login=1&next=%2Foauth%2Fauthorize%2F%3Fredirect_uri%3Dhttps%3A%2F%2Fdevelopers.facebook.com%2Finstagram%2Ftoken_generator%2Foauth%2F%26client_id%3D670732831755066%26response_type%3Dcode%26scope%3Duser_profile%2Cuser_media%26state%3D%257B%2522app_id%2522%3A%2522670732831755066%2522%2C%2522user_id%2522%3A%252217841460905824907%2522%2C%2522nonce%2522%3A%25225WV0RznFRIM1IuMV%2522%257D%26logger_id%3D277dfd7e-3839-4ff9-b48e-248f6c68cd1d';

    window.open(authorizationUrl, '_blank');
  }
  @Input() url = location.href;

}
