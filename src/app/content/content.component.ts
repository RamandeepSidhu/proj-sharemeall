import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, throwError } from 'rxjs'; import { ChatGptService } from '../Services/chat-gpt.service'; declare var FB: any;

export class textResponse {
  sno: number = 1;
  text: string = '';
  response: string = '';
}
@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent {
  description: string = '';
  userMessage!: string;
  messages: string[] = [];
  formData: FormData = new FormData();


  constructor(private http: HttpClient, private chatService: ChatGptService,) {
    this.initFacebookSDK();
  }

  ngOnInit() {
    this.checkFacebookLoginStatus();
    // this.logInToFB()
  }

  images: string[] = [];
  myForm = new FormGroup({
    file: new FormControl('', [Validators.required]),
    fileSource: new FormControl()
  });

  async sendMessage(): Promise<void> {
    const userMessage = this.userMessage.trim();
    if (!userMessage) {
      return;
    }
    this.messages.push('User: ' + userMessage);
    this.userMessage = '';
    const aiMessage = await this.chatService.sendMessage(userMessage);
    this.messages.push('AI: ' + aiMessage);
  }

  textList: textResponse[] = [
    { sno: 1, text: '', response: '' }
  ];
  get f() {
    return this.myForm.controls;
  }

  // onSelectFile(event: any) {
  //   const files = event.target.files;
  //   if (files) {
  //     for (const file of files) {
  //       const reader = new FileReader();
  //       reader.onload = (e: any) => {
  //         if (file.type.indexOf("image") > -1) {
  //           this.mydata.push({
  //             url: e.target.result,
  //             type: 'img'
  //           });
  //         } else if (file.type.indexOf("video") > -1) {
  //           this.mydata.push({
  //             url: e.target.result,
  //             type: 'video'
  //           });
  //         }
  //       };
  //       reader.readAsDataURL(file);
  //     }
  //   }
  // }

  onFileChange(event: any) {
    if (event.target.files && event.target.files[0]) {
      var filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        var reader = new FileReader();

        reader.onload = (event: any) => {
          console.log(event.target.result);
          this.images.push(event.target.result);

          this.myForm.patchValue({
            fileSource: this.images
          });
        }

        reader.readAsDataURL(event.target.files[i]);
      }
    }
  }

  // https://api.instagram.com/oauth/authorize/?client_id=${Client_id}&redirect_uri=REDIRECT-URI&response_type=accessToken
  submitForm() {
    const accessToken = 'IGQVJXUUNBcGlJU3FvbnlVVkdUemlYTWJ3MXBHTVM1eGJ5NzRvUGVFVDNPb3p4azUwd2pZAR2ZAQQ0w2WGc3ZAkVyYWFRa1A4OHBtT1pnWk5Oa1UwTU5QVVkxeTk3TFBXNmlUTHh5cTBTVkNkZA0EwYW45awZDZD'; // Replace with your access token
    const caption = 'Chat-GPT answer goes here';

    const client_secret = "479cc270137a3219592eef5e4932a2cb"
    const Client_id = 1967700373565384
    const client_Token = "eddcf52af595a422557f985df72c4778"
    const redirectUri = `https://localhost:4200/index.html#/${accessToken}`;

    const url = `https://api.instagram.com/oauth/authorize/?client_id=${Client_id}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${client_Token}`

    this.formData.append('caption', caption);
    this.http.post(url, this.formData, {
      // params: {
      //   access_token: accessToken,
      // },
    }).subscribe(
      (response: any) => {
        console.log('Post upload successful:', response);
      },
      (error) => {
        console.error('Post upload error:', error);
      }
    );
  }

  // onSelectFile(event: any) {
  //   const files = event.target.files;
  //   if (files) {
  //     for (const file of files) {
  //       const reader = new FileReader();
  //       reader.onload = (e: any) => {
  //         const blob = new Blob([e.target.result], { type: file.type });
  //         this.mydata.push({
  //           url: URL.createObjectURL(blob),
  //           type: file.type
  //         });
  //         this.formData.append('files', blob, file.name); // Append the Blob object to the FormData
  //       };
  //       reader.readAsArrayBuffer(file);
  //     }
  //   }
  // }




  //  generateText(data:textResponse) {
  //    this.openaiService.generateText(data.text).then(res => {
  //     data.response = res;
  //     if(this.textList.length===data.sno){
  //       this.textList.push({sno:1,text:'',response:''});
  //     }
  //   });
  // }
  // 3064389983857861

  initFacebookSDK() {
    (window as any).fbAsyncInit = function () {
      FB.init({
        appId: '1967700373565384',
        xfbml: true,
        version: 'v17.0'
      });
      FB.AppEvents.logPageView();
    };

    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) { return; }
      js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      if (fjs && fjs.parentNode) {
        fjs.parentNode.insertBefore(js, fjs);
      }
    }(document, 'script', 'facebook-jssdk'));
  }

  imageUrl: string = '';
  postCaption: string = '';
  isSharingPost: boolean = false;
  facebookUserAccessToken: string | undefined;

  checkFacebookLoginStatus() {
    debugger
    (window as any).FB.getLoginStatus((response: any) => {
      this.facebookUserAccessToken = response.authResponse?.accessToken;
    });
  }

  logInToFB() {
    (window as any).FB.login((response: any) => {
      this.facebookUserAccessToken = response.authResponse?.accessToken;
      debugger
    }, { scope: 'instagram_basic,pages_show_list' });
  }

  logOutOfFB() {
    (window as any).FB.logout(() => {
      this.facebookUserAccessToken = undefined;
    });
  }

  async getFacebookPages() {
    const response: any = await this.http.get(
      `https://graph.facebook.com/me/accounts?access_token=${this.facebookUserAccessToken}`
    ).pipe(
      catchError(error => throwError(error))
    ).toPromise();

    return response.data;
  }

  async getInstagramAccountId(facebookPageId: string) {
    const response: any = await this.http.get(
      `https://graph.facebook.com/${facebookPageId}?access_token=${this.facebookUserAccessToken}&fields=instagram_business_account`
    ).pipe(
      catchError(error => throwError(error))
    ).toPromise();

    return response.authResponse.userID;
  }

  async createMediaObjectContainer(instagramAccountId: string) {
    const response: any = await this.http.post(
      `https://graph.facebook.com/${instagramAccountId}/media?access_token=${this.facebookUserAccessToken}`,
      { image_url: this.imageUrl, caption: this.postCaption }
    ).pipe(
      catchError(error => throwError(error))
    ).toPromise();

    return response.id;
  }

  async publishMediaObjectContainer(instagramAccountId: string, mediaObjectContainerId: string) {
    const response: any = await this.http.post(
      `https://graph.facebook.com/${instagramAccountId}/media_publish?access_token=${this.facebookUserAccessToken}`,
      { creation_id: mediaObjectContainerId }
    ).pipe(
      catchError(error => throwError(error))
    ).toPromise();

    return response.id;
  }

  async shareInstagramPost() {
    this.isSharingPost = true;

    try {
      const facebookPages = await this.getFacebookPages();
      const instagramAccountId = await this.getInstagramAccountId(facebookPages[0].id);
      const mediaObjectContainerId = await this.createMediaObjectContainer(instagramAccountId);

      await this.publishMediaObjectContainer(instagramAccountId, mediaObjectContainerId);

      this.isSharingPost = false;
      this.imageUrl = '';
      this.postCaption = '';
    } catch (error) {
      console.error(error);
      // Handle error
    }
  }
  // loadFacebookSDK() {
  //   (window as any).fbAsyncInit = function () {
  //     FB.init({
  //       appId: '1967700373565384',
  //       xfbml: true,
  //       version: 'v17.0'
  //     });
  //     FB.AppEvents.logPageView();
  //   };

  //   (function (d, s, id) {
  //     var js, fjs = d.getElementsByTagName(s)[0];
  //     if (d.getElementById(id)) { return; }
  //     js = d.createElement(s) as HTMLScriptElement;
  //     js.id = id;
  //     js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v17.0&appId=250342871108791&autoLogAppEvents=1';
  //     if (fjs && fjs.parentNode) {
  //       fjs.parentNode.insertBefore(js, fjs);
  //     }
  //   }(document, 'script', 'facebook-jssdk'));
  // }

  // checkLoginState() {
  //   FB.getLoginStatus((response: any) => {
  //     this.statusChangeCallback(response);
  //   });
  // }

  // statusChangeCallback(response: any) {
  //   console.log('statusChangeCallback');
  //   console.log(response);
  //   if (response.status === 'connected') {
  //     this.testAPI();
  //   } else {
  //     this.status = 'Please log into this webpage.';
  //   }
  // }

  // testAPI() {
  //   console.log('Welcome! Fetching your information....');
  //   FB.api('/me', (response: any) => {
  //     console.log('Successful login for: ' + response.name);
  //     this.status = 'Thanks for logging in, ' + response.name + '!';
  //   });
  // }

}
