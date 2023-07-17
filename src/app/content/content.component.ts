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

  submitForm() {
    const accessToken = 'IGQVJXUUNBcGlJU3FvbnlVVkdUemlYTWJ3MXBHTVM1eGJ5NzRvUGVFVDNPb3p4azUwd2pZAR2ZAQQ0w2WGc3ZAkVyYWFRa1A4OHBtT1pnWk5Oa1UwTU5QVVkxeTk3TFBXNmlUTHh5cTBTVkNkZA0EwYW45awZDZD'; // Replace with your access token
    const caption = 'Chat-GPT answer goes here';

    const client_secret = "441a387e57311a85288e058f5377bcae"
    const Client_id = 250342871108791
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
    (window as any).FB.getLoginStatus((response: any) => {
      this.facebookUserAccessToken = response.authResponse?.accessToken;
    });
  }

  logInToFB() {
    (window as any).FB.login((response: any) => {
      this.facebookUserAccessToken = response.authResponse?.accessToken;
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
  loadFacebookSDK() {
    (window as any).fbAsyncInit = function () {
      FB.init({
        appId: '250342871108791',
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
      js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v17.0&appId=250342871108791&autoLogAppEvents=1';
      if (fjs && fjs.parentNode) {
        fjs.parentNode.insertBefore(js, fjs);
      }
    }(document, 'script', 'facebook-jssdk'));
  }

  checkLoginState() {
    FB.getLoginStatus((response: any) => {
      this.statusChangeCallback(response);
    });
  }

  statusChangeCallback(response: any) {
    console.log('statusChangeCallback');
    console.log(response);
    if (response.status === 'connected') {
      this.testAPI();
    } else {
    }
  }

  testAPI() {
    console.log('Welcome! Fetching your information....');
    FB.api(
      '/230689359885934',
      'GET',
      {},
      function (response: any) {
        console.log(response, ':::::::')
      }
    );
  }

}
  // testAPI(accessToken: any) {
  //   console.log(accessToken, 'acctoken')
  //   console.log('Welcome! Fetching your information....');

  //   const params = {
  //     access_token: "EAADjr33njLcBAOzvB9sR1cvJDGaMHci4ZCGUAMXZCg6dir4paAeOZAyJ4S15fnxEZA5kVZA5zFLgwQJqMR6qF6Og55oKhBrvnmSKA8OXTNXk3pMRCQ4ZCyotgfb4HdO33Ike8ZC4cufn8xHrQlTOSbU6UTgpBi72OX5FZCEJyBaDoo5sKHZAdWFWZBxCVbExwWxqPxms20F8BZAeOYTdOulBkFTfZAYVpp3vZBOQvFou1tjUte626kT3MTi7k",
  //   };

  //   // FB.api('/230689359885934', 'GET', params, function (response: any) {
  //   // });
  //   FB.api(
  //     '/230689359885934',
  //     'POST',
  //     params,
  //     { "fields": "id,name,email,posts{instagram_eligibility,is_published},photos,videos{embed_html,description,status,video_insights}", "transport": "cors" },
  //     function (respons: any) {
  //       console.log(respons)
  //     }
  //   );

  // }

  // checkLoginState() {
  //   FB.getLoginStatus((response: any) => {
  //     this.statusChangeCallback(response);
  //     if (response.status === 'connected') {
  //       var accessToken = response.authResponse.accessToken;
  //       console.log(accessToken, 'accessToken ')
  //     }
  //   });
  // }

  // statusChangeCallback(response: any) {
  //   if (response.status === 'connected') {
  //     this.testAPI(response);
  //   } else {
  //     const statusElement = document.getElementById('status');
  //     if (statusElement) {
  //       statusElement.innerHTML = 'Please log into this webpage.';
  //     }
  //   }
  // }
  // testAPI(accessToken: any) {
  //   console.log('Welcome! Fetching your information....');
  //   const params = {
  //     access_token: "EAADjr33njLcBAE6XG6OkYIxu1VWmeAublFuUc4lBYWKG31xBmHqJ9ZCLeZCFjwsDlKe5vVCtjZAYYKCAbGUCM5rPu27XnHWVZCAeOOO6KqXn9cfrzQm1ZCAtM2FT76Cuh3TH9AMcPdroRtNrUdy1vND7IlnkYWj60HOHjoCWkiUuKGY2yrsbvFXscw2nVorbrHd9AcKQtToNoUZB2C08sAjT3nCcihZCWdfCex8WaYQnYvZCd4jJtlNb",
  //     fields: 'id,name,email,videos{source},posts{id,source,caption},first_name',
  //   };
  //   FB.api('/230689359885934', 'POST', params, function (response: any) {
  //     console.log(response);
  //   });

  // }

  // logInToFB(access: any) {
  //   (window as any).FB.login((response: any) => {
  //     this.facebookUserAccessToken = response.authResponse?.accessToken;
  //     this.testAPI(this.facebookUserAccessToken);
  //     this.post();
  //   }, { scope: 'user_photos,user_videos,user_posts,publish_video,instagram_content_publish' });
  // }
