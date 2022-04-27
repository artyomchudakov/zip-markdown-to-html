import React from 'react';
import { Alert, AlertTitle } from '@material-ui/lab';

const EmptyConversionAttempt = () => {
  return (
    <Alert severity="error">
      <AlertTitle>EMPTY CONVERSION ATTEMPT</AlertTitle>
      You didn't select anything, trying to convert an empty selection. <br />
      <strong>Select a repository or ZIP-archive from your computer.</strong>
    </Alert>
  );
};

export default EmptyConversionAttempt;
