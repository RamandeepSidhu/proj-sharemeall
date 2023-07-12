import { Component } from '@angular/core';
import { ChatGptService } from '../Services/chat-gpt.service';
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
  isButtonDisabled!: false;
  isCopied: boolean = false;

  textList: textResponse[] = [{ sno: 1, text: '', response: '' }];
  showSpinner = false;
  cardText: any;
  writeText!: any;
  constructor(private openaiService: ChatGptService) { }

  generateText(dataList: textResponse[]) {
    this.showSpinner = true;
    dataList.forEach((data: textResponse) => {
      this.openaiService.generateText(data.text).then((text: any) => {
        data.response = text;
        this.textList.unshift({ sno: 0, text: data.text, response: text });
        this.cardText = this.textList.find(f => f.response);
        this.writeText = this.textList.find(f => f.text);
        this.showSpinner = false;
        this.isCopied = false;

      });
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

}
