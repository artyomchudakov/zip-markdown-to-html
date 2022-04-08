import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import JSZip from 'jszip';
import showdown from 'showdown';
import { saveAs } from 'file-saver';
import { Search } from 'gitea-react-toolkit';
/* Material-Ui 4 */
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Checkbox } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import './styles.css';

let initialZipFileLength = 0;

const ZipMarkdownToHtml = () => {
  const [input, setInput] = useState([]);
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleInput = (e) => setInput(e.target.files[0]);
  const handleCheckboxChange = (e) => setIsCheckboxChecked(e.target.checked);

  const convertFileInput = () => {
    if (input === undefined || input.length === 0) {
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
        initialZipFileLength =
          isCheckboxChecked === true ? allFilesLength : onlyMdFilesLength;
        Object.keys(zip.files).forEach((fileName) => {
          zip.files[fileName].async('string').then((fileData) => {
            if (fileName.match(/.md/)) {
              const converter = new showdown.Converter();
              const html = converter.makeHtml(fileData);
              const blob = new Blob([html]);
              const newFile = new File([blob], fileName.replace('.md', '.html'));
              filesArray.push(newFile);
            } else {
              if (isCheckboxChecked) {
                const blob = new Blob([fileData]);
                const nonMdFile = new File([blob], fileName);
                filesArray.push(nonMdFile);
              }
            }
          });
        });
        setConvertedFiles(filesArray);
      } catch (err) {
        console.error('Error: ', err.message);
      }
    };
    convert(input);
  };

  function fetchGiteaRepository(link) {
    setIsLoading(true);
    axios
      .get(`${link}/archive/master.zip`, { responseType: 'arraybuffer' })
      .then((response) => {
        const archive = new Blob([response.data], { type: 'application/zip' });
        setInput(archive);
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
    // console.log(initialZipFileLength);
    // console.log(convertedFiles.length);

    if (convertedFiles.length === initialZipFileLength) {
      // console.log("READY FOR DOWNLOAD");
      const zipFile = new JSZip();
      const files = convertedFiles;
      for (let file = 0; file < files.length; file++) {
        zipFile.file(files[file].name, files[file]);
      }
      zipFile.generateAsync({ type: 'blob' }).then((content) => {
        saveAs(content, 'converted.zip');
      });
    }
  };

  /* CircularProgress loading animation */
  useEffect(() => {
    setIsLoading(false);
  }, [input]);
  useEffect(() => {
    const interval = setInterval(() => {
      setIsLoading(true);
      if (convertedFiles.length === initialZipFileLength) {
        setIsLoading(false);
        return clearInterval(interval);
      }
    }, 100);
  }, [convertedFiles]);

  const loadingAnimation = useMemo(
    () => (
      <Backdrop open={true} style={{ zIndex: 1, color: '#fff' }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    ),
    []
  );

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
    <Container maxWidth="lg">
      {isLoading && loadingAnimation}
      {showAlert && emptyConversionAttempt}
      <section>
        <h1>CONVERT MULTIPLE MARKDOWN FILES TO HTML - AS ZIP</h1>
        <p>
          The application converts all markdown files to HTML and gives you the option to
          save a new zip archive with already converted files.
        </p>
        <p>
          Using the checkbox at the bottom of the page, you can include other (non-.md)
          files in the conversion result; if the checkbox is deactivated, other (non-.md)
          files will not be included in the result.
        </p>
        <p>
          <strong>Be sure to specify your choice before starting the conversion</strong>
        </p>
        <h3>Gitea React Toolkit Repositories</h3>
        <p>
          Select a repository using gitea-react-toolkit search. Click directly on the
          repository you want to convert.
        </p>
        <p>Once it is fetched from the server - Convert - Download - Enjoy!</p>
        <p>
          To view the repository on the server, click on the icon to the right of the
          repository
        </p>
      </section>
      {
        <div>
          <Paper style={{ maxHeight: '40vh', overflow: 'scroll' }} elevation={3}>
            <Search
              defaultOwner="unfoldingword"
              defaultQuery="en_t"
              onRepository={(data) => {
                const url = data.html_url;
                // fetchGiteaRepository(url, data.name);
                fetchGiteaRepository(url);
              }}
              config={{ server: 'https://bg.door43.org' }}
            />
          </Paper>
        </div>
      }
      {/* LOCAL CONVERSION and OTHER Buttons */}
      <section>
        <h3>Local Conversion</h3>
        <p>
          The same can be done locally from your computer. SELECT - CONVERT - DOWNLOAD
        </p>
      </section>
      <div>
        {/* File input */}
        <input
          style={{ display: 'none' }}
          type="file"
          id="fileInput"
          accept=".zip"
          onChange={handleInput}
          // onClick={(e) => (e.target.value = null)}
        />
        <label htmlFor="fileInput">
          <Button variant="contained" color="primary" component="span" align="center">
            select from PC
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
          label={`save ${
            isCheckboxChecked ? 'all' : 'only converted'
          } files to the conversion result`}
          control={
            <Checkbox
              checked={isCheckboxChecked}
              onChange={handleCheckboxChange}
              color="primary"
            />
          }
        />
      </div>
    </Container>
  );
};

export default ZipMarkdownToHtml;
