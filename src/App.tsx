import './App.css';
import { ChangeEvent, useState } from 'react';
import { useRemark } from 'react-remark';
import { OsnovaSanitizer } from './service/OsnovaSanitizer';
import { Html2Md } from './service/Html2Md';

function App() {
  const sanitizer = new OsnovaSanitizer('https://tjournal.ru');
  const html2Md = new Html2Md();

  const [rawMdContent, setRawMdContent] = useState('');
  const [renderedMdContent, setRenderedMdContent] = useRemark();
  const [renderedMdTitle, setRenderedMdTitle] = useRemark();

  const handleFileChosenEvent = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) {
      return;
    }
    const file = files[0];
    const fileReader = new FileReader();
    fileReader.addEventListener('loadend', (e: ProgressEvent<FileReader>) => {
      const fileContent = e.target?.result;
      if (!fileContent) {
        return;
      }
      const parser = new DOMParser();
      const document = parser.parseFromString(fileContent as string, 'text/html');

      const titles = document.getElementsByClassName('content-title');
      const title = titles.length ? titles[0].textContent || 'Без названия' : 'Без названия';
      setRenderedMdTitle(`# ${html2Md.convert(sanitizer.sanitizeTitle(title).trim())}`);

      const content = document.getElementsByClassName('content--full')[0].innerHTML;
      const cleanHtml = sanitizer.sanitizeContent(content);
      var markdown = html2Md.convert(cleanHtml);
      setRawMdContent(markdown);
      setRenderedMdContent(markdown);
    });
    fileReader.readAsText(file);
  };

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-5">
      <div className="col-span-2">
        <input type="file" accept=".html,.htm" onChange={handleFileChosenEvent} />
      </div>
      <div>
        <textarea className="h-full w-full"
          defaultValue={rawMdContent}
          onChange={({ currentTarget }) => setRenderedMdContent(currentTarget.value)}        
        />
      </div>
      <div>
        <div className="h-full w-full">
          <h2 className="text-center">{renderedMdTitle}</h2>
          <div>{renderedMdContent}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
