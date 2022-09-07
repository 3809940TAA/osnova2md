import sanitizeHtml, { IFrame } from 'sanitize-html';

export class OsnovaSanitizer {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public sanitizeTitle(dirtyTitle: string): string {
    return sanitizeHtml(dirtyTitle);
  }

  public sanitizeContent(dirtyContent: string): string {
    return sanitizeHtml(dirtyContent, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      allowedAttributes: {
        a: ['href', 'name', 'target', 'class'],
        img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
        div: [
          'data-image-src',
          'data-video-iframe',
          'class',
        ],
      },
      enforceHtmlBoundary: true,
      selfClosing: sanitizeHtml.defaults.selfClosing.concat(['div']),
      exclusiveFilter: (frame: IFrame) => {
        if (frame.tag === 'div' && frame.attribs['class']) {
          const classValue = frame.attribs['class'] as string;
          return (
            classValue.includes('content-info--full') ||
            classValue.includes('content--short') ||
            classValue.includes('content-header--short') ||
            classValue.includes('andropov_link__description') ||
            classValue.includes('andropov_link__host')
          );
        }
        return frame.tag === 'span' && !frame.text.trim();
      },
      transformTags: {
        div: (tagName: string, attribs: any) => {
          if (attribs['data-image-src']) {
            return {
              tagName: 'img',
              attribs: {
                src: attribs['data-image-src'],
              },
            };
          }
          if (attribs['data-video-mp4']) {
            return {
              tagName: 'p',
              attribs: {},
              text: attribs['data-video-mp4'],
            };
          }
          if (
            attribs['class'] &&
            (attribs['class'] as string).includes('gall__item') &&
            attribs['style']
          ) {
            const style = attribs['style'];
            const tokens = style.match(/url\((.*)\)/);
            return {
              tagName: 'img',
              attribs: {
                src: tokens[1],
                title: `Картинка ${attribs['data-index']}`,
              },
            };
          }
          if (attribs['data-video-iframe']) {
            return {
              tagName: 'p',
              attribs: {},
              text: attribs['data-video-iframe'],
            };
          }
          return {
            tagName: tagName,
            attribs: attribs,
          };
        },
        a: (tagName: string, attribs: any) => {
          if (
            attribs['href'] &&
            (attribs['href'] as string).startsWith(`${this.baseUrl}/tag/`)
          ) {
            return {
              tagName: 'span',
              attribs: {},
            };
          }
          if (attribs['class'] && (attribs['class'] as string).includes('content-link')) {
            return {
              tagName: 'p',
              attribs: {},
              text: attribs['href'],
            };
          }
          return {
            tagName: tagName,
            attribs: attribs,
          };
        },
      },
    });
  }
}
