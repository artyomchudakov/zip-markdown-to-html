import showdown from 'showdown';

export function convertToHtml(fileData) {
  const converter = new showdown.Converter();
  const html = converter.makeHtml(fileData);
  return html;
}
