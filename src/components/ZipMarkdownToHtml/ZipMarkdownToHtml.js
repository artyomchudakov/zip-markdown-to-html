import React, { useEffect, useState } from 'react';
import { AppDescription, LocalConversionDescription } from './AppDescription';
import axios from 'axios';
import JSZip from 'jszip';
import showdown from 'showdown';
import { saveAs } from 'file-saver';
import { Search } from 'gitea-react-toolkit';
/* Material-Ui 4 */
import {
  Backdrop,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  Paper,
} from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';

import { useStyles } from './style';

let initialZipFileLength = 0;

const ZipMarkdownToHtml = () => {
  const [fileInput, setFileInput] = useState();
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [isIncludeAllFilesChecked, setIsIncludeAllFilesChecked] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const classes = useStyles();

  const handleUserFileInput = (e) => setFileInput(e.target.files[0]);
  const handleCheckboxChange = (e) => setIsIncludeAllFilesChecked(e.target.checked);

  const convertFileInput = () => {
    if (!fileInput) {
      setShowAlert(true);
      return;
    }
    setIsLoading(true);
    const filesArray = [];

    const convert = async (toConvert) => {
      try {
        const zipFile = new JSZip();
        const zip = await zipFile.loadAsync(toConvert);
        const allFilesLength = Object.keys(zip.files).length;
        const onlyMdFilesLength = Object.keys(zip.files).filter((file) =>
          file.match(/.md/)
        ).length;
        initialZipFileLength = isIncludeAllFilesChecked
          ? allFilesLength
          : onlyMdFilesLength;
        for (let fileName of Object.keys(zip.files)) {
          zip.files[fileName].async('string').then((fileData) => {
            if (fileName.match(/.md/)) {
              const converter = new showdown.Converter();
              const html = converter.makeHtml(fileData);
              const blob = new Blob([html]);
              const newFile = new File([blob], fileName.replace('.md', '.html'));
              filesArray.push(newFile);
            } else {
              if (isIncludeAllFilesChecked) {
                const blob = new Blob([fileData]);
                const nonMdFile = new File([blob], fileName);
                filesArray.push(nonMdFile);
              }
            }
          });
        }
        setConvertedFiles(filesArray);
      } catch (err) {
        console.error('Error: ', err.message);
      }
    };
    convert(fileInput);
  };

  function fetchGiteaRepository(link) {
    setIsLoading(true);
    axios
      .get(`${link}/archive/master.zip`, { responseType: 'arraybuffer' })
      .then((response) => {
        const archive = new Blob([response.data], { type: 'application/zip' });
        setFileInput(archive);
        setIsLoading(false);
      })
      .catch((err) => console.error(err.message));
  }

  const downloadResult = () => {
    if (convertedFiles.length === 0) return;

    if (convertedFiles.length < initialZipFileLength) {
      const progress = `${Math.floor(
        (convertedFiles.length / initialZipFileLength) * 100
      )}% Files were processed. please try again in a few seconds`;
      alert(progress);
    }

    if (convertedFiles.length === initialZipFileLength) {
      const zipFile = new JSZip();
      for (let file = 0; file < convertedFiles.length; file++) {
        zipFile.file(convertedFiles[file].name, convertedFiles[file]);
      }
      zipFile.generateAsync({ type: 'blob' }).then((content) => {
        saveAs(content, 'converted.zip');
      });
    }
  };

  /* CircularProgress loading animation */
  useEffect(() => {
    const interval = setInterval(() => {
      setIsLoading(true);
      if (convertedFiles.length === initialZipFileLength) {
        setIsLoading(false);
        return clearInterval(interval);
      }
    }, 100);
  }, [convertedFiles]);

  /* Alert if user tries to convert empty selection */
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowAlert(false);
    }, 2000);
    return () => {
      clearTimeout(timeout);
    };
  }, [showAlert]);

  const emptyConversionAttempt = (
    <Alert severity="error">
      <AlertTitle>EMPTY CONVERSION ATTEMPT</AlertTitle>
      You didn't select anything, trying to convert an empty selection. <br />
      <strong>Select a repository or ZIP-archive from your computer.</strong>
    </Alert>
  );

  return (
    <Container className={classes.root}>
      {showAlert && emptyConversionAttempt}
      <AppDescription />
      {
        <div>
          <Paper className={classes.paper} elevation={3}>
            <Search
              defaultOwner="unfoldingword"
              defaultQuery="en_t"
              onRepository={(data) => {
                fetchGiteaRepository(data.html_url);
              }}
              config={{ server: 'https://bg.door43.org' }}
            />
          </Paper>
        </div>
      }
      {/* LOCAL CONVERSION and OTHER Buttons */}
      <LocalConversionDescription />
      <div className={classes.btnContainer}>
        {/* File input */}
        <input
          className={classes.fileInput}
          type="file"
          id="fileInput"
          accept=".zip"
          onChange={handleUserFileInput}
        />
        <label htmlFor="fileInput">
          <Button variant="contained" color="primary" component="span" align="center">
            upload
          </Button>
        </label>
        {/* Convert file Button */}
        <Button variant="contained" color="secondary" onClick={convertFileInput}>
          convert
        </Button>
        {/* Download Button with Checkbox */}
        <Button variant="contained" color="primary" onClick={downloadResult}>
          download
        </Button>
      </div>
      <div>
        <FormControlLabel
          label={`include ${
            isIncludeAllFilesChecked ? 'all' : 'only converted'
          } files to the conversion result`}
          control={
            <Checkbox
              checked={isIncludeAllFilesChecked}
              onChange={handleCheckboxChange}
              color="primary"
            />
          }
        />
      </div>
      <Backdrop open={isLoading} className={classes.backdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  );
};

export default ZipMarkdownToHtml;
