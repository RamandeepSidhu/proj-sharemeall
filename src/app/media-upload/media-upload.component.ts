import { Component, Input } from '@angular/core';
import { ChatGptService } from '../Services/chat-gpt.service';
import { Token } from '@angular/compiler';
export class textResponse {
  sno: number = 1;
  text: string = '';
  response: string = '';
}
declare var FB: any;
@Component({
  selector: 'app-media-upload',
  templateUrl: './media-upload.component.html',
  styleUrls: ['./media-upload.component.scss']
})
export class MediaUploadComponent {
  mydata: { url: string; type: string; name?: string }[] = [];
  isButtonDisabled!: false;
  isPostAdded: boolean = false;
  isCopied: boolean = false;
  bioText: string = '';
  remainingWords: number = 350;
  textList: textResponse[] = [{ sno: 1, text: '', response: '' }];
  showSpinner = false;
  cardText: any;
  writeText!: any;
  isAIAssistOpen: boolean = false;
  hashtags = [
    { id: "spread", value: "#spread", color: 3, twitter: "8", instagram: null },
    { id: "forget", value: "#forget", color: 3, twitter: "8", instagram: null },
  ];
  myNewData: any;
  shareLink: any;
  newTextList: textResponse[] = [{ sno: 1, text: '', response: '' }];
  hastageCardText: any;
  facebookUserAccessToken: any;
  constructor(private openaiService: ChatGptService) { }
  ngOnInit() {
    this.post();
  }
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

  hastageText(dataList: textResponse[], searchText: any) {
    this.showSpinner = true;
    const generatedTextPromises = dataList.map((data: textResponse) => {
      const prompt = 'User: ' + searchText + '\nAI:';
      return this.openaiService.generateText(prompt).then((text: any) => {
        console.log(text);
        data.response = text;
        this.newTextList.unshift({ sno: 0, text: data.text, response: text });
        this.hastageCardText = this.newTextList.find(f => f.response);
        this.writeText = this.newTextList.find(f => f.text);
        this.filterHashtags();
        return { text, response: text };
      });
    });

    Promise.all(generatedTextPromises).then((results: any[]) => {
      const hashtagResponses = results.filter((result) => {
        const response = result.response.toLowerCase();
        return response.startsWith('#') || response.includes(' #');
      });

      this.hashtags = hashtagResponses.map((result) => {
        return result.response;
      });

      this.filterHashtags();
    });
  }

  // ChatGPT
  generateText(dataList: textResponse[], searchText: any) {
    this.showSpinner = true;
    const generatedTextPromises = dataList.map((data: textResponse) => {
      const prompt = 'User: ' + searchText + '\nAI:';

      return this.openaiService.generateText(data.text).then((text: any) => {
        console.log(text)
        data.response = text;
        this.textList.unshift({ sno: 0, text: data.text, response: text });
        this.cardText = this.textList.find(f => f.response);
        this.writeText = this.textList.find(f => f.text);
        this.isCopied = false;
        this.filterHashtags();

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
    const authorizationUrl =
      'https://www.instagram.com/accounts/login/?force_authentication=1&enable_fb_login=1&next=%2Foauth%2Fauthorize%2F%3Fredirect_uri%3Dhttps%3A%2F%2Fdevelopers.facebook.com%2Finstagram%2Ftoken_generator%2Foauth%2F%26client_id%3D670732831755066%26response_type%3Dcode%26scope%3Duser_profile%2Cuser_media%26state%3D%257B%2522app_id%2522%3A%2522670732831755066%2522%2C%2522user_id%2522%3A%252217841460905824907%2522%2C%2522nonce%2522%3A%25225WV0RznFRIM1IuMV%2522%257D%26logger_id%3D277dfd7e-3839-4ff9-b48e-248f6c68cd1d';

    window.open(authorizationUrl, '_blank');
  }

  updateCharacterCount() {
    const words = this.bioText.trim().split(/\s+/);
    const wordCount = words.length;
    if (this.bioText.length === 0) {
      this.remainingWords = 350;
    } else {
      this.remainingWords = Math.max(0, 350 - wordCount);
    }
  }

  addPost(response: string) {
    const words = response.trim().split(/\s+/);
    const wordCount = words.length;
    if (wordCount > 350) {
      this.bioText = words.slice(0, 350).join(' ');
    } else {
      this.bioText += response;
    }
    this.isPostAdded = true;
    this.isAIAssistOpen = !this.isAIAssistOpen;
    this.updateCharacterCount();

  }

  toggleAIAssist() {
    this.isAIAssistOpen = !this.isAIAssistOpen;
    this.isPostAdded = !this.isPostAdded;
  }

  addHashtagToBio(hashtag: string) {
    this.bioText += ' ' + hashtag;
  }
  isHashtagDropdownOpen = false;
  searchTerm: any = "";
  filteredHashtags: any = [];

  toggleHashtagDropdown() {
    this.isHashtagDropdownOpen = !this.isHashtagDropdownOpen;
    if (this.isHashtagDropdownOpen) {
      this.filterHashtags();
    }
  }

  filterHashtags() {
    this.filteredHashtags = this.hashtags.filter(
      (hashtag) => hashtag.value.toLowerCase().includes(this.searchTerm.toLowerCase())
        || this.bioText.toLowerCase().includes(hashtag.value.toLowerCase())
    );
  }

  truncateText(text: string, wordLimit: number): string {
    const words = text.trim().split(/\s+/);
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
  }
  selectHashtag(hashtag: { value: string; }) {
    this.bioText += " " + hashtag.value;
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
    const dataStore = {
      text: this.bioText,
      bio: this.mydata
    };
    this.logInToFB(dataStore);

    console.log(dataStore, 'datagghgStore')
  }

  // facebook integration
  checkLoginState() {
    FB.getLoginStatus((response: any) => {
      this.statusChangeCallback(response);
    });
  }

  statusChangeCallback(response: any) {
    console.log('statusChangeCallback');
    if (response.status === 'connected') {
      this.testAPI(response);
    } else {
      const statusElement = document.getElementById('status');
      if (statusElement) {
        statusElement.innerHTML = 'Please log into this webpage.';
      }
    }
  }
  testAPI(accessToken: any) {
    console.log('Welcome! Fetching your information....');
    const params = {
      access_token: "EAADjr33njLcBAOzvB9sR1cvJDGaMHci4ZCGUAMXZCg6dir4paAeOZAyJ4S15fnxEZA5kVZA5zFLgwQJqMR6qF6Og55oKhBrvnmSKA8OXTNXk3pMRCQ4ZCyotgfb4HdO33Ike8ZC4cufn8xHrQlTOSbU6UTgpBi72OX5FZCEJyBaDoo5sKHZAdWFWZBxCVbExwWxqPxms20F8BZAeOYTdOulBkFTfZAYVpp3vZBOQvFou1tjUte626kT3MTi7k",
      fields: 'id,name,email,posts{instagram_eligibility,is_published},photos,videos{embed_html,description,status,video_insights}',
    };
    FB.api('/230689359885934', 'POST', params, function (response: any) {
      console.log(response);
    });
  }


  logInToFB(access: any) {
    (window as any).FB.login((response: any) => {
      this.facebookUserAccessToken = response.authResponse?.accessToken;
      this.testAPI(this.facebookUserAccessToken);
      this.post();
    }, { scope: 'user_photos,user_videos,user_posts,publish_video,instagram_content_publish' });
  }
}



