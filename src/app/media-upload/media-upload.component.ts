import { Component, Input } from '@angular/core';
import { ChatGptService } from '../Services/chat-gpt.service';
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
    // Add more hashtags here
  ]; myNewData: any;
  shareLink: any;
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

  // post() {
  //   setTimeout(() => {
  //     this.authorizeInstagram();
  //     localStorage.setItem('mydata', JSON.stringify(this.mydata));
  //     const dataList: textResponse[] = []; // Replace this with your actual dataList
  //     const generatedTextPromises = dataList.map((data: textResponse) => {
  //       return this.openaiService.generateText(data.text).then((text: any) => {
  //         data.response = text;
  //         return data;
  //       });
  //     });
  //     localStorage.setItem('mydata', JSON.stringify(this.mydata.map(item => ({ url: item.url ?? '', type: item.type }))));

  //     Promise.all(generatedTextPromises)
  //       .then((generatedTexts) => {
  //         localStorage.setItem('generatedTexts', JSON.stringify(generatedTexts));
  //         this.mydata = [];
  //       })
  //       .catch((error) => {
  //         console.error('Failed to generate text:', error);
  //         this.mydata = [];
  //       });
  //   }, 2000);
  // }
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

      const imageUrl = this.mydata[0]?.url; // Get the image URL
      const generatedTextsValue = localStorage.getItem('generatedTexts'); // Get the generated texts

      this.shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(generatedTextsValue || '')}&picture=${encodeURIComponent(imageUrl || '')}`;

      console.log(this.shareLink);

      window.open(this.shareLink, '_blank');

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
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    const dragDropLabel: any = document.getElementById("dragDropLabel");
    dragDropLabel.classList.add("highlight");
  }

  onDragLeave(event: DragEvent): void {
    const dragDropLabel: any = document.getElementById("dragDropLabel");
    dragDropLabel.classList.remove("highlight");
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const dragDropLabel: any = document.getElementById("dragDropLabel");
    dragDropLabel.classList.remove("highlight");
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    const files = event.dataTransfer?.files;
    if (files) {
      fileInput.files = files;
    }
  }
  updateCharacterCount() {
    const words = this.bioText.trim().split(/\s+/);
    const wordCount = words.length;

    if (this.bioText.length === 0) {
      this.remainingWords = 350;
    } else {
      this.remainingWords = Math.max(0, this.remainingWords - wordCount);
    }
  }
  toggleAIAssist() {
    this.isAIAssistOpen = !this.isAIAssistOpen;
    this.isPostAdded = !this.isPostAdded;

  }
  // Inside MediaUploadComponent class
  addPost(response: string) {

    this.bioText += response; // Append the response to the bioText
    this.isPostAdded = true;
    this.isAIAssistOpen = !this.isAIAssistOpen;



  }

  isHashtagDropdownOpen = false;
  searchTerm = "";
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
  initFacebookSDK() {
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
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      if (fjs && fjs.parentNode) {
        fjs.parentNode.insertBefore(js, fjs);
      }
    }(document, 'script', 'facebook-jssdk'));
  }
}
