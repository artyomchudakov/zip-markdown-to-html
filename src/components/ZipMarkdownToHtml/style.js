import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: '960px',
    fontFamily: 'sans-serif',
    lineHeight: 1.5,
  },

  btnContainer: {
    '& > *': {
      margin: theme.spacing(0, 1),
    },
  },

  paper: {
    maxHeight: '40vh',
    overflow: 'scroll',
  },

  fileInput: {
    display: 'none',
  },
}));
