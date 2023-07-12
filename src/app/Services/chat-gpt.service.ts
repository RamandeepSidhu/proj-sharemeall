import { Injectable } from '@angular/core';
import { Configuration, OpenAIApi } from 'openai';

@Injectable({
  providedIn: 'root'
})
export class ChatGptService {
  private openai: OpenAIApi;
  configuration = new Configuration({
    apiKey: "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",
  });

  constructor() {
    this.openai = new OpenAIApi(this.configuration);
  }

  generateText(prompt: string): Promise<string | undefined> {
    return this.openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 256
    }).then((response: any) => {
      return response.data.choices[0].text;
    }).catch((error: any) => {
      return '';
    });
  }

}
