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
