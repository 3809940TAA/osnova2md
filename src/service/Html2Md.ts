import TurndownService from 'turndown';

export class Html2Md {
  private turndownService = new TurndownService();

  public convert(html: string): string {
    return this.turndownService.turndown(html);
  }
}
