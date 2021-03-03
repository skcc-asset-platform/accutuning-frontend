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
    const { onClose, value: valueProp, choices, open, ...other } = props;
    const radioGroupRef = React.useRef(null);
    const classes = useStyles();

    const [state, setState] = React.useState(
        choices.reduce(function(result, item, index, array) {
            result[item] = valueProp.indexOf(item) >= 0;
            return result;
        }, {})
    );

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
    // const { corr, pairplot, va, vaa, parcoord, parcate } = state;
    const error = Object.values(state).filter((v) => v).length === 0;

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
                {choices.map((plot, idx) => 
                    <FormControlLabel
                        key={idx}
                        control={<Checkbox checked={state[plot]} onChange={handleChange} name={plot} />}
                        label={plot}
                    />
                )}
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
    choices: PropTypes.string.isRequired,
  };

  export default ConfirmationDialogRaw;

