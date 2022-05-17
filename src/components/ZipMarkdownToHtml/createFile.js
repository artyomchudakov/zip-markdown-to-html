export function createFile(fileData, fileName) {
  const blob = new Blob([fileData]);
  const newFile = new File([blob], fileName);
  return newFile;
}
