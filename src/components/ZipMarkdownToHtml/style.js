import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: '960px',
    fontFamily: 'sans-serif',
    lineHeight: 1.5,
  },

  btnContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 5,
  },

  paper: {
    maxHeight: '40vh',
    overflow: 'scroll',
  },

  fileInput: {
    display: 'none',
  },
}));
