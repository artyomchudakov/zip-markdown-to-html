import { saveAs } from 'file-saver';

export function downloadZip(zipFile, convertedFiles) {
  for (let file = 0; file < convertedFiles.length; file++) {
    zipFile.file(convertedFiles[file].name, convertedFiles[file]);
  }
  zipFile.generateAsync({ type: 'blob' }).then((content) => {
    saveAs(content, 'converted.zip');
  });
}
