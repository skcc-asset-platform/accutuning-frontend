import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';


const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
    },
    formControl: {
      margin: theme.spacing(3),
    },
  }));


function ConfirmationDialogRaw(props) {
    const { onClose, value: valueProp, open, ...other } = props;
    const radioGroupRef = React.useRef(null);
    const classes = useStyles();

    //corr, pairplot, va, vaa, parcoord, parcate
    const [state, setState] = React.useState({
        corr: valueProp.indexOf('corr') >= 0,
        pairplot: valueProp.indexOf('pairplot') >= 0,
        va: valueProp.indexOf('va') >= 0,
        vaa: valueProp.indexOf('vaa') >= 0,
        parcoord: valueProp.indexOf('parcoord') >= 0,
        parcate: valueProp.indexOf('parcate') >= 0,
    });

    const handleChange = (event) => {
        setState({ ...state, [event.target.name]: event.target.checked });
    };

    // React.useEffect(() => {
    //   if (!open) {
    //     valueProp.map(name => setState({ ...state, [name]: true }));
    //     console.log('effect', open, valueProp)
    //   }
    // }, [valueProp, open]);

    // console.log(value, state)

    const handleEntering = () => {
      if (radioGroupRef.current != null) {
        radioGroupRef.current.focus();
      }
    };

    const handleCancel = () => {
      onClose();
    };

    const handleOk = () => {
      onClose(Object.keys(state).filter(m => state[m]));
    };

    // const handleChange = (event) => {
    //   setValue(event.target.value);
    // };
    const { corr, pairplot, va, vaa, parcoord, parcate } = state;
    const error = [corr, pairplot, va, vaa, parcoord, parcate].filter((v) => v).length === 0;

    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        maxWidth="xs"
        onEntering={handleEntering}
        aria-labelledby="confirmation-dialog-title"
        open={open}
        {...other}
      >
        <DialogTitle id="confirmation-dialog-title">Available Plots</DialogTitle>
        <DialogContent dividers>
          {/* <RadioGroup
            aria-label="ringtone"
            name="ringtone"
            value={value}
            onChange={handleChange}
          >
            {options.map((option) => (
              <FormControlLabel value={option} key={option} control={<Radio />} label={option} />
            ))}
          </RadioGroup> */}
          <FormControl
                ref={radioGroupRef}
                required error={error} component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">생성을 원하는 plot을 선택해주세요.</FormLabel>
            <FormGroup>
            <FormControlLabel
                control={<Checkbox checked={corr} onChange={handleChange} name="corr" />}
                label="CORRELATION MATRIX"
            />
            <FormControlLabel
                control={<Checkbox checked={pairplot} onChange={handleChange} name="pairplot" />}
                label="PAIR PLOT"
            />
            <FormControlLabel
                control={<Checkbox checked={vaa} onChange={handleChange} name="vaa" />}
                label="VARIABLE ANALYSIS (ALL COLUMNS)"
            />
            <FormControlLabel
                control={<Checkbox checked={va} onChange={handleChange} name="va" />}
                label="VARIABLE ANALYSIS (TARGET)"
            />
            <FormControlLabel
                control={<Checkbox checked={parcoord} onChange={handleChange} name="parcoord" />}
                label="PARALLEL COORDINATES"
            />
            <FormControlLabel
                control={<Checkbox checked={parcate} onChange={handleChange} name="parcate" />}
                label="PARALLEL COORDINATES(parcate)"
            />
            </FormGroup>
            <FormHelperText>한 개 이상 지정해주세요.</FormHelperText>
        </FormControl>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleOk} color="primary">
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  ConfirmationDialogRaw.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    value: PropTypes.string.isRequired,
  };

  export default ConfirmationDialogRaw;

