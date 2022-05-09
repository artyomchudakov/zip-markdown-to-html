import React from 'react';

const AppDescription = () => {
  return (
    <section>
      <h1>CONVERT MULTIPLE MARKDOWN FILES TO HTML - AS ZIP</h1>
      <p>
        The application converts all markdown files inside selected Zip to HTML and gives
        you the option to save a new zip archive with already converted files.
      </p>
      <p>
        Using the checkbox at the bottom of the page, you can include other (non-.md)
        files in the conversion result; if the checkbox is deactivated, other (non-.md)
        files will not be included in the result.
      </p>
      <p>
        <strong>Be sure to specify your choice before starting the conversion</strong>
      </p>
      <h2>Gitea React Toolkit Repositories</h2>
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
  );
};

export default AppDescription;
