import React from 'react';
import { Backdrop, CircularProgress } from '@material-ui/core';
import { useStyles } from '../style';
const LoadingAnimation = (props) => {
  const classes = useStyles();
  return (
    <Backdrop open={props.open} className={classes.backdrop}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default LoadingAnimation;
