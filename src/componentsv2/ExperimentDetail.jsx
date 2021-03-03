import React from 'react'
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from "react-apollo";
import { useTranslation } from "react-i18next";
import gql from "graphql-tag";
// import { useQuery, useMutation, gql } from '@apollo/client';
import {
    Card,
    CardHeader,
    CardActions,
    CardContent,
    Button,
    ButtonGroup,
    Typography,
    // Chip,
    Grid,
    Box,
    InputLabel,
    MenuItem,
    FormHelperText,
    FormControl,
    FormControlLabel,
    Select,
    Checkbox,
    // Divider,
    DialogTitle,
    Dialog,
    DialogContent,
    DialogContentText,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    FormLabel,
    FormGroup,
    TextField,
    Paper,
    CircularProgress,
} from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import SettingsIcon from '@material-ui/icons/Settings';
import { makeStyles } from '@material-ui/core/styles';
import DatasetColumns, {TextConfigurationDialog} from './DatasetColumns'
import { Alert, AlertTitle } from '@material-ui/lab';
import {ModalBody, ModalContent, ModalHeader, toastError} from "../utils";
import ClassBalancer from "../components/ClassBalancer";
import Modal from 'react-modal';


const useStyles = makeStyles((theme) => ({
    root: {
        minWidth: 275,
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
    formControl: {
        marginRight: theme.spacing(1),
        minWidth: 120,
        marginBottom: theme.spacing(1),
    },
    jobs: {
        backgroundColor: theme.palette.background.paper,
    }
}));

const modalStyles = {
    content : {
        position: 'relative',
        border: '0',
        top                   : 'auto',
        left                  : 'auto',
        right                 : 'auto',
        bottom                : 'auto',
        // marginRight           : '-50%',
        // transform             : 'translate(-50%, -50%)'
    }
};


export const MON_QUERY = gql`
query EXPERIMENT_MON_QUERY($id: Int!) {
    env {
        activeContainerCount
        totalContainerCount
        licenseIsValid
    }
    experiment(id: $id) {
        id
        status
        processes(onlyLive: true) {
            id
            experimentProcessType
            elapsedSec
            stopRequest
        }
        lastDataset:preprocessedDataset {
            id
            processingStatus
            __typename
        }
        __typename
    }
}
`;

export const EXPERIMENT_QUERY = gql`
query EXPERIMENT_QUERY($id:Int!) {
    env {
        activeContainerCount
        totalContainerCount
        licenseIsValid
    }
    experiment(id: $id) {
        id
        status
        processes(onlyLive: true) {
            id
            experimentProcessType
            elapsedSec
            stopRequest
        }
        lastDataset:preprocessedDataset {
            id
            processingStatus
            __typename
        }
        name
        description
        createdAt
        estimatorType
        availableMetrics
        metric
        targetColumnName
        useSampling
        useClassBalancer
        samplingRatio
        samplingSize
        samplingTarget
        resamplingStrategy
        resamplingStrategyHoldoutTrainSize
        resamplingStrategyCvFolds
        splitTestdataRate
        __typename
    }
}
`;


const ExperimentTextFormControl = ({id, field, extraFields, label, value, helptext, fullWidth, disabled}) => {
    const [val, setVal] = useState(value)
    const [firstVal, setFirstVal] = useState(value)
    const [mutateExperiment] = useMutation(gql`
    mutation mutate_${field}($id: ID!, $input: PatchExperimentInput!) {
        patchExperiment(id: $id, input: $input) {
            experiment {
                id
                __typename
                ${field}
                ${extraFields}
            }
        }
    }`)

    return (
        <form noValidate autoComplete="off">
            {fullWidth ?
                <Grid container alignItems="flex-end">
                    <Grid item xs={9}>
                        <TextField
                            fullWidth={fullWidth}
                            id="standard-basic"
                            label={label}
                            disabled={disabled}
                            helperText={helptext}
                            onChange={(e) => setVal(e.target.value)} value={val}/>
                    </Grid>
                    <Grid item xs={3}>
                        <ButtonGroup size='small'>
                            <Button
                                color='primary'
                                onClick={() => {
                                    mutateExperiment({variables: {id, input: {[field]: val}}}).then(() => { setFirstVal(val)})
                                }}>Save</Button>
                            <Button
                                color='secondary'
                                disabled={val === firstVal}
                                onClick={() => setVal(value)}>Reset</Button>
                        </ButtonGroup>
                    </Grid>
                </Grid>
                :
                <Grid container alignItems="flex-end">
                    <Grid item>
                        <TextField
                            id="standard-basic"
                            label={label}
                            disabled={disabled}
                            helperText={helptext}
                            onChange={(e) => setVal(e.target.value)} value={val}/>
                    </Grid>
                    <Grid item>
                        <ButtonGroup size='small'>
                            <Button
                                color='primary'
                                onClick={() => {
                                    mutateExperiment({variables: {id, input: {[field]: val}}}).then(() => { setFirstVal(val) })
                                }}>Save</Button>
                            <Button
                                color='secondary'
                                disabled={val === firstVal}
                                onClick={() => setVal(value)}>Reset</Button>
                        </ButtonGroup>
                    </Grid>
                </Grid>
            }
        </form>
    )
}

const ExperimentMultipleCheckboxFormControl = ({id, field, extraFields, label, value, choices, helptext, disabled}) => {
    const classes = useStyles();
    const [mutateExperiment, { error }] = useMutation(gql`
    mutation mutate_${field}($id: ID!, $input: PatchExperimentInput!) {
        patchExperiment(id: $id, input: $input) {
            experiment {
                id
                __typename
                ${field}
                ${extraFields}
            }
        }
    }`)

    const [checked, setChecked] = useState(choices.map(option => {
        return (value && value.length > 0) ? value.includes(option) : false
    }))
    useEffect(() => {
        setChecked(
            choices.map(option => {
                return (value && value.length > 0) ? value.includes(option) : false
            })
        )
    }, [field, value, choices])
    const setCheckedIndex = (idx, e) => {
        // console.log(idx, e.target.value);
        const filteredOptions = [];
        const results = checked.map((chk, chkIdx) => {
            if (chkIdx === idx) {
                chk = !chk;
            }
            if (chk) {
                filteredOptions.push(choices[chkIdx])
            }
            return chk;
        })
        const variables = { id, input: { [field]: JSON.stringify(filteredOptions) } }
        mutateExperiment({ variables })
            .then(() => setChecked(results))
            .catch((e) => {
                alert(`정상적으로 수행되지 않았습니다. message: ${String(e)}`)
            })
    }

    return (
        <FormControl required error={error} component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">{label}</FormLabel>
            <FormGroup>
                {choices.map((e, idx) =>
                    <FormControlLabel
                        key={idx}
                        disabled={disabled}
                        control={<Checkbox checked={checked[idx]} onChange={e => setCheckedIndex(idx, e)} name={e} />}
                        label={e}
                    />
                )}
            </FormGroup>
            <FormHelperText>{helptext}</FormHelperText>
        </FormControl>
    )
}

function TargetColumnDialog(props) {
    const { id, onClose, selectedValue, open } = props;
    const EXPERIMENT_COLUMN_NAMES = gql`
  query experimentConfirm($id: Int!) {
      experiment (id: $id)  {
          id
          dataset:preprocessedDataset {
              id
              columns {
                  id
                  name
              }
          }
      }
  }`
    const { data, loading, error } = useQuery(EXPERIMENT_COLUMN_NAMES, { variables: {id}});

    const handleClose = () => {
        onClose(selectedValue);
    };

    if (loading) return 'loading..'
    if (error) return String(error)

    return (
        <Dialog onClose={handleClose} aria-labelledby="target-column-dialog-title" open={open}>
            <DialogTitle id="target-column--dialog-title">Select Target Column</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                    Let Google help apps determine location. This means sending anonymous location data to
                    Google, even when no apps are running.
                </DialogContentText>
                <ExperimentSelectFormControl
                    label='Target'
                    id={id}
                    value={selectedValue}
                    field='targetColumnName'
                    choices={data.experiment.dataset.columns.map(c => c.name)}
                    helptext=''
                    extraFields=''
                    disabled={false}/>
            </DialogContent>
        </Dialog>
    );
}


function ExperimentAdvancedSettingDialog(props) {
    const { t } = useTranslation();
    const { id, onClose, open } = props;
    const EXPERIMENT_COLUMN_NAMES = gql`
    query experimentConfiguration($id: Int!) {
        experiment (id: $id)  {
            id
            createdAt
            timeout
            description
            maxEvalTime
            useEarlystopping
            useEnsemble
            includeEstimatorsJson
            availableEstimators
            availableScalingMethods
            availableFeatureEngineerings
            availableClusterAlgorithms
            availableClusterDimReductionAlgs
            includeOneHotEncoding
            includeVarianceThreshold
            includeScalingMethodsJson
            includeFeatureEngineeringsJson
            includeClusterAlgorithmsJson
            includeClusterDimReductionAlgsJson
            workerScale
            logLevel
            randomState
            name
            estimatorType
            numClusters
            useCustomContainerResource
            customContainerCpuLimit
            customContainerGpuLimit
            customContainerMemoryLimit
            workspaceSize
        }
    }`
    const { data, loading, error } = useQuery(EXPERIMENT_COLUMN_NAMES, { variables: {id}});

    const handleClose = () => {
        onClose();
    };

    if (loading) return 'loading..'
    if (error) return String(error)

    return (
        <Dialog fullWidth={true} maxWidth={'md'} onClose={handleClose} aria-labelledby="experiment-advanced-configuration-dialog-title" open={open}>
            <DialogTitle id="experiment-advanced-configuration--dialog-title">Advanced Configuration</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                    AutoML 고급설정을 이용해서 사용자가 원하는 실험을 더 정교하게 구성할 수 있습니다.
                    {data.experiment ?
                        <Typography color='textSecondary'>
                            실험생성일자: {data.experiment.createdAt},  파일크기: {data.experiment.workspaceSize}b
                        </Typography>
                        :
                        null
                    }
                </DialogContentText>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Box mb={1}>
                            <ExperimentTextFormControl
                                label='Name'
                                id={id}
                                value={data.experiment.name}
                                field='name'
                                extraFields=''
                                disabled={false}
                            />
                        </Box>
                        <Box mb={1}>
                            <ExperimentTextFormControl
                                label='Description'
                                id={id}
                                value={data.experiment.description}
                                field='description'
                                extraFields=''
                                fullWidth
                                disabled={false}
                            />
                        </Box>
                        <Box mb={6}>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box style={{border: '1px dashed #2196f3'}}>
                            <Alert severity='info'>
                                <AlertTitle>AutoML Pipeline Components</AlertTitle>
                                <Box>
                                    이 선택사항은 automl구성에서 고려되며,
                                    최종결과에 반영되지 않을 수 있습니다.
                                </Box>
                            </Alert>
                            <Paper style={{padding: '8px', marginTop: '4px'}} elevation={0}>
                                {data.experiment.estimatorType === 'CLUSTERING' ?
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <ExperimentSelectFormControl
                                                label={t('Cluster #')}
                                                id={id}
                                                value={data.experiment.numClusters}
                                                choices={[null, '2', '3', '4', '5', '6', '7', '8', '9', '10']}
                                                field='numClusters'
                                                helpText=''
                                                extraFields=''
                                                disabled={false}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <ExperimentMultipleCheckboxFormControl
                                                label='Algorithms'
                                                id={id}
                                                value={data.experiment.includeClusterAlgorithmsJson}
                                                choices={data.experiment.availableClusterAlgorithms}
                                                field='includeClusterAlgorithmsJson'
                                                helptext=''
                                                extraFields=''
                                                disabled={false}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <ExperimentMultipleCheckboxFormControl
                                                label='Select dimension reduction algorithms'
                                                id={id}
                                                value={data.experiment.includeClusterDimReductionAlgsJson}
                                                choices={data.experiment.availableClusterDimReductionAlgs}
                                                field='includeClusterDimReductionAlgsJson'
                                                helptext=''
                                                extraFields=''
                                                disabled={false}
                                            />
                                        </Grid>
                                    </Grid>
                                    :
                                    <Grid container>
                                        <Grid item xs={6}>
                                            <ExperimentBooleanFormControl
                                                label='Ensemble'
                                                id={id}
                                                value={data.experiment.useEnsemble}
                                                field='useEnsemble'
                                                helptext=''
                                                extraFields={''}
                                                disabled={false}
                                            />
                                            <ExperimentMultipleCheckboxFormControl
                                                label='Algorithms'
                                                id={id}
                                                value={data.experiment.includeEstimatorsJson}
                                                choices={data.experiment.availableEstimators}
                                                field='includeEstimatorsJson'
                                                helptext=''
                                                extraFields=''
                                                disabled={false}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <ExperimentBooleanFormControl
                                                label='One Hot Encoding'
                                                id={id}
                                                value={data.experiment.includeOneHotEncoding}
                                                field='includeOneHotEncoding'
                                                helptext=''
                                                extraFields={''}
                                                disabled={false}
                                            />
                                            <ExperimentBooleanFormControl
                                                label='Variance Threshold'
                                                id={id}
                                                value={data.experiment.includeVarianceThreshold}
                                                field='includeVarianceThreshold'
                                                helptext=''
                                                extraFields={''}
                                                disabled={false}
                                            />
                                            <ExperimentMultipleCheckboxFormControl
                                                label='Scaling'
                                                id={id}
                                                value={data.experiment.includeScalingMethodsJson}
                                                choices={data.experiment.availableScalingMethods}
                                                field='includeScalingMethodsJson'
                                                helptext=''
                                                extraFields=''
                                                disabled={false}
                                            />
                                            <ExperimentMultipleCheckboxFormControl
                                                label='FeatureEngineering'
                                                id={id}
                                                value={data.experiment.includeFeatureEngineeringsJson}
                                                choices={data.experiment.availableFeatureEngineerings}
                                                field='includeFeatureEngineeringsJson'
                                                helptext=''
                                                extraFields=''
                                                disabled={false}
                                            />
                                        </Grid>
                                    </Grid>
                                }
                            </Paper>
                        </Box>
                    </Grid>
                    <Grid item xs={3}>
                        <ExperimentSelectFormControl
                            label='Total timeout(s)'
                            id={id}
                            value={data.experiment.timeout}
                            field='timeout'
                            choices={[0, 30, 120, 600, 1800, 3600, 7200, 9000, 12000, 18000, 30000, 60000, 90000]}
                            //   helptext='Total automl evaluation time'
                            extraFields=''
                            disabled={false}/>
                        <ExperimentSelectFormControl
                            label='Evaluation timeout(s)'
                            id={id}
                            value={data.experiment.maxEvalTime}
                            field='maxEvalTime'
                            choices={[0, 5, 10, 30, 100, 180, 300, 600, 900, 1200, 1500, 1800]}
                            //   helptext='per each trial evaluation'
                            extraFields=''
                            disabled={false}/>
                        <ExperimentBooleanFormControl
                            label='Earlystopping'
                            id={id}
                            value={data.experiment.useEarlystopping}
                            field='useEarlystopping'
                            helptext=''
                            extraFields={''}
                            disabled={false}
                        />
                        <ExperimentSelectFormControl
                            label='Logging Level'
                            id={id}
                            value={data.experiment.logLevel}
                            field='logLevel'
                            choices={['CRITICAL', 'INFO', 'WARNING', 'DEBUG']}
                            extraFields=''
                            disabled={false}/>
                        <ExperimentTextFormControl
                            label='Random seed'
                            id={id}
                            value={data.experiment.randomState}
                            field='randomState'
                            extraFields=''
                            disabled={false}/>
                    </Grid>
                    <Grid item xs={3}>
                        <ExperimentSelectFormControl
                            label='Parallel Count'
                            id={id}
                            value={data.experiment.workerScale}
                            field='workerScale'
                            choices={[1,2,3,4,5,6,7,8,9,10]}
                            extraFields=''
                            disabled={false}/>
                        <ExperimentBooleanFormControl
                            label='Custom Resource Limit'
                            id={id}
                            value={data.experiment.useCustomContainerResource}
                            field='useCustomContainerResource'
                            extraFields='customContainerCpuLimit customContainerMemoryLimit customContainerGpuLimit'
                            disabled={false}/>
                        <ExperimentTextFormControl
                            label='CPU Limit(unit: m)'
                            id={id}
                            value={data.experiment.customContainerCpuLimit}
                            field='customContainerCpuLimit'
                            extraFields=''
                            disabled={!data.experiment.useCustomContainerResource}/>
                        <ExperimentTextFormControl
                            label='Memory Limit(unit: Mb)'
                            id={id}
                            value={data.experiment.customContainerMemoryLimit}
                            field='customContainerMemoryLimit'
                            extraFields=''
                            disabled={!data.experiment.useCustomContainerResource}/>
                        {/* <ExperimentBooleanFormControl
                        label='Use GPU'
                        id={id}
                        value={false}
                        field='useGPU'
                        extraFields=''
                        disabled={true}
                        /> */}
                        <ExperimentTextFormControl
                            label='GPU Limit'
                            id={id}
                            value={data.experiment.customContainerGpuLimit}
                            field='customContainerGpuLimit'
                            extraFields=''
                            disabled={!data.experiment.useCustomContainerResource}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
}


function ExperimentAdvancedSettingFormControl({id}) {
    const [open, setOpen] = useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = (val) => {
        setOpen(false);
    };
    return (
        <>
            <Button variant="outlined" color="primary" size="small"
                    onClick={handleClickOpen}
                    endIcon={<SettingsIcon/>}
            >Advanced Settings</Button>
            {open ?
                <ExperimentAdvancedSettingDialog id={id} open={open} onClose={handleClose} />
                :
                null
            }
        </>
    )
}


function TargetColumnFormControl({id, value, disabled}) {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = (val) => {
        setOpen(false);
    };
    return (
        <Grid alignItems="flex-end" container spacing={1}>
            <Grid item>
                <FormControl>
                    <InputLabel id="experiment-targetColumName-label">Target</InputLabel>
                    <Select labelId="experiment-targetColumName-label" value={value} readOnly style={{minWidth: '100px'}} disabled={disabled}>
                        <MenuItem value={value}>{value}</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
            <Grid item>
                <Button size="small" variant="outlined" color="primary"
                        disabled={disabled}
                        onClick={handleClickOpen}
                >CHANGE</Button>
                {open ?
                    <TargetColumnDialog id={id} selectedValue={value} open={open} onClose={handleClose} />
                    :
                    null
                }
            </Grid>
        </Grid>
    );
}


const ExperimentSelectFormControl = ({id, field, extraFields, value, choices, label, helptext, disabled, readOnly}) => {
    const classes = useStyles();
    const [mutateExperiment] = useMutation(gql`
    mutation mutate_experiment_${field}($id: ID!, $input: PatchExperimentInput!) {
        patchExperiment(id: $id, input: $input) {
            experiment {
                id
                __typename
                ${field}
                ${extraFields}
            }
        }
    }`)

    return (
        <FormControl className={classes.formControl}>
            <InputLabel id={`experiment-${field}-label`}>{label}</InputLabel>
            <Select
                labelId={`experiment-${field}-label`}
                id={`experiment-${field}-select`}
                value={value}
                disabled={disabled}
                readOnly={readOnly}
                onChange={(e) => {
                    const variables = { id, input: { [field]: e.target.value } }
                    mutateExperiment({ variables })
                        .catch((e) => {
                            alert(`정상적으로 수행되지 않았습니다. message: ${String(e)}`)
                        })
                }}
            >
                {choices.map(c => <MenuItem value={c}>{String(c)}</MenuItem>)}
            </Select>
            <FormHelperText>{helptext}</FormHelperText>
        </FormControl>
    )
}

const ExperimentBooleanFormControl = ({id, field, extraFields, value, label, helptext, disabled, readOnly}) => {
    return <ExperimentSelectFormControl
        id={id}
        field={field}
        extraFields={extraFields}
        value={value}
        label={label}
        helptext={helptext}
        disabled={disabled}
        readOnly={readOnly}
        choices={[true, false]}
    />
}


// const CheckboxFieldSingleUpdater = ({pk, field, value, label, helptext, disabled}) => {
//     const [checked, setChecked] = useState(value)
//     const [mutateExperiment] = useMutation(gql`
//     mutation mutate_${field}($id: ID!, $input: PatchExperimentInput!) {
//         patchExperiment(id: $id, input: $input) {
//             experiment {
//                 id
//                 __typename
//                 ${field}
//                 includeClusterAlgorithms
//             }
//         }
//     }`)
//     const toggle = () => {
//         // console.log(eventValue, value)
//         const variables = { id: pk, input: { [field]: !checked } }
//         mutateExperiment({ variables })
//             .then((e) => setChecked(!checked))
//             .catch((e) => {
//                 alert(`정상적으로 수행되지 않았습니다. message: ${String(e)}`)
//             })
//     }

//     useEffect(() => {
//         setChecked(value)
//     }, [value])

//     return (
//         <FormControlLabel
//             control={<Checkbox checked={checked} onChange={toggle} />}
//             disabled={disabled}
//             helptext={helptext}
//             label={label}
//         />
//     // <div className={disabled ? "wrap_check disabled" : "wrap_check"}>
//     //     <InputCheckbox
//     //         disabled={disabled}
//     //         checked={checked}
//     //         onChange={(e) => toggle()}
//     //         className="inp_check modal_check"
//     //         name={field}
//     //         id={'ipk_' + field}
//     //         type='checkbox' />
//     //     <label className="label_check" htmlFor={'ipk_' + field}>
//     //         <span className="ico_automl ico_check"></span>
//     //         {/* {checked ? 'Yes' : 'No'} */}
//     //         { label }
//     //     </label>
//     // </div>
//     )
// }



export const ExperimentDetail = ({data, env}) => {

    const { t } = useTranslation();
    const [textConfigId, setTextConfigId] = useState(null);
    const [showAugment, toggleAugment] = useState(false);
    const classes = useStyles();
//     const [startExperiment] = useMutation(gql`
//     mutation startExperiment($id: ID!) {
//       startExperiment(id: $id) {
//         __typename
//         experiment {
//           __typename
//           id
//           status
//           startedAt
//         }
//       }
//     }
//   `);

//   const [stopExperimentProcess] = useMutation(gql`
//   mutation stopExperimentProcess($id: ID!) {
//       stopExperimentProcess(id: $id) {
//           __typename
//           experimentProcess {
//               __typename
//               id
//               experimentProcessType
//               stoppedAt
//               stopRequest
//           }
//       }
//   }
// `);

    return (
        <>
            <Grid item xs={12}>
                <Box component='div' p={0}>
                    <Box mb={2}>
                        {/* <Typography variant="h3" gutterBottom>
                        {data.name}
                        <Box component="span" ml={2}>
                            <Chip label={data.status.toUpperCase()} size="small"/>
                            <Chip label={'WORKSPACE SIZE: 4Gb'} size="small"/>
                        </Box>
                    </Typography> */}
                        <Typography variant="div" color="textSecondary">
                            {data.description}
                        </Typography>
                    </Box>
                    <Grid container spacing={1}>
                        <Grid item xs={3}>
                            <Grid container spacing={1}>
                                <Grid item xs={12}>
                                    <Card>
                                        <CardHeader title='GENERAL' subheader='Define problem / Basic Setting'/>
                                        <CardContent>
                                            <ExperimentSelectFormControl
                                                label='ProblemType'
                                                id={data.id}
                                                value={data.estimatorType}
                                                field='estimatorType'
                                                choices={['CLASSIFIER', 'REGRESSOR', 'CLUSTERING']}
                                                helptext=''
                                                extraFields={'metric availableMetrics'}
                                                disabled={false}/>
                                            <ExperimentSelectFormControl
                                                label='Metric'
                                                id={data.id}
                                                value={data.metric}
                                                field='metric'
                                                choices={data.availableMetrics.map(e => e.toUpperCase())}
                                                helptext=''
                                                extraFields={''}
                                                disabled={false}/>
                                            <br/>
                                            <TargetColumnFormControl
                                                id={data.id}
                                                value={data.targetColumnName}
                                                disabled={data.estimatorType === 'CLUSTERING'}
                                            />
                                        </CardContent>
                                        <CardActions>
                                            <ExperimentAdvancedSettingFormControl id={data.id}/>
                                        </CardActions>
                                    </Card>
                                </Grid>
                                {/* <Card>
                                <CardHeader title='SOURCE(FINAL)' subheader='Preprocessed dataset'/>
                                <CardContent>
                                    <Typography>
                                    size: 42k<br/>
                                    rows: 102,293<br/>
                                    columns: 102,293<br/>
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small">Download</Button>
                                </CardActions>
                            </Card> */}
                                <Grid item xs={12}>
                                    <Card>
                                        <CardHeader title='PARTITIONING' subheader='How to split data for machine-learning'/>
                                        <CardContent>
                                            <ExperimentSelectFormControl
                                                label='Resampling Strategy'
                                                id={data.id}
                                                value={data.resamplingStrategy}
                                                field='resamplingStrategy'
                                                helptext=''
                                                extraFields={''}
                                                disabled={false}
                                                choices={['HOLDOUT', 'CV']}
                                            />
                                            <ExperimentSelectFormControl
                                                label='Train size(holdout)'
                                                id={data.id}
                                                value={data.resamplingStrategyHoldoutTrainSize}
                                                field='resamplingStrategyHoldoutTrainSize'
                                                helptext=''
                                                extraFields={''}
                                                disabled={!(
                                                    data.resamplingStrategy === 'HOLDOUT'
                                                    // && useSplitByRandom
                                                )}
                                                choices={[0.5, 0.6, 0.7, 0.8, 0.9]}
                                            />
                                            <ExperimentSelectFormControl
                                                label='Folds(cv)'
                                                id={data.id}
                                                value={data.resamplingStrategyCvFolds}
                                                field='resamplingStrategyCvFolds'
                                                helptext=''
                                                extraFields={''}
                                                disabled={!(
                                                    data.resamplingStrategy === 'CV'
                                                )}
                                                choices={[3, 5, 10]}
                                            />
                                            <ExperimentSelectFormControl
                                                label='Test size'
                                                id={data.id}
                                                value={data.splitTestdataRate}
                                                field='splitTestdataRate'
                                                helptext=''
                                                extraFields={''}
                                                disabled={!(
                                                    true
                                                    // && useSplitByRandom
                                                )}
                                                choices={[
                                                    null,
                                                    0.2,
                                                    0.4,
                                                    0.6,
                                                    0.8,
                                                ]}
                                            />
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12}>
                                    <Card>
                                        <CardHeader title='SAMPLING' subheader='Adjust datasize for machine-learning'/>
                                        <CardContent>
                                            <ExperimentBooleanFormControl
                                                label='Sampling'
                                                id={data.id}
                                                value={data.useSampling}
                                                field='useSampling'
                                                helptext=''
                                                extraFields={''}
                                                disabled={false}
                                            />
                                            {/*<ExperimentSelectFormControl*/}
                                            {/*    label='Sampling Ratio'*/}
                                            {/*    id={data.id}*/}
                                            {/*    value={data.samplingRatio}*/}
                                            {/*    field='samplingRatio'*/}
                                            {/*    helptext=''*/}
                                            {/*    extraFields={''}*/}
                                            {/*    disabled={!data.useSampling}*/}
                                            {/*    choices={[0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9]}*/}
                                            {/*/>*/}
                                            <ExperimentSelectFormControl
                                                label='Sampling Target'
                                                id={data.id}
                                                value={data.samplingTarget}
                                                field='samplingTarget'
                                                helptext=''
                                                extraFields={''}
                                                disabled={!data.useSampling}
                                                choices={['ALL', 'TRAIN']}
                                            />
                                            <ExperimentTextFormControl
                                                label='Sampling Size'
                                                id={data.id}
                                                value={data.samplingSize}
                                                field='samplingSize'
                                                helptext=''
                                                extraFields={''}
                                                disabled={!data.useSampling || data.useClassBalancer}
                                            />
                                            {data.estimatorType === 'CLASSIFIER' ?
                                                <Box>
                                                    <Button size="small" variant="outlined" color="primary"
                                                            variant="outlined"
                                                            onClick={() => toggleAugment(true)}>{t('class balancer')}</Button>
                                                </Box>
                                                : null
                                            }

                                        </CardContent>
                                    </Card>
                                </Grid>
                                {/* <Grid item xs={12}>
                                <Card>
                                    <CardHeader title='AUTO LABELER' subheader='Text analyzing and generate tags automatically'/>
                                    <CardContent>
                                        <List dense={true}>
                                        {data.autolabelerTasks.map(l => <ListItem style={{backgroundColor: '#eeeeee'}}>
                                            <ListItemIcon>
                                                {l.textProcessingStep === 'INIT' || l.textProcessingStep === 'FINISH' || l.textProcessingStep === 'ERROR' ?
                                                    <CheckCircleIcon/> : <CircularProgress size="1.0rem" color="secondary" />}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={l.name}
                                                secondary={`${l.textProcessingAlStep === 0 ? 'ZEROSHOT' : `FEWSHOT`}(${l.textProcessingStep})`}
                                            />
                                            <ListItemIcon>
                                                <Button disabled={false}
                                                    onClick={() => setTextConfigId(l.id)}
                                                    size='small' variant="outlined" color="primary">Detail</Button>
                                            </ListItemIcon>
                                        </ListItem>)}
                                        {textConfigId ?
                                            <TextConfigurationDialog open={true} id={textConfigId} onClose={()=>setTextConfigId(null)} />
                                            :
                                            null
                                        }
                                        {data.autolabelerTasks.length === 0 ? <ListItem>
                                                        <ListItemIcon><CheckCircleIcon/></ListItemIcon>
                                                        <ListItemText primary={'NO TASKS'} secondary={'NO TASKS'}/>
                                                    </ListItem>: null}
                                        </List>
                                    </CardContent>
                                </Card>
                            </Grid> */}
                                {/* <Grid item xs={12}>
                                <Card style={{backgroundColor: '#efefef'}}>
                                    <CardHeader
                                        title={`${env.totalContainerCount - env.activeContainerCount} JOBS AVAILABLE`}
                                        />
                                    <CardContent>
                                        <Grid item xs={12}>
                                            <div className={classes.jobs}>
                                                <List dense={true}>
                                                    {data.processes.map(pr => <ListItem>
                                                        <ListItemIcon>
                                                            {pr.finishedAt ? <CheckCircleIcon/> : <CircularProgress size="1.0rem" color="secondary" />}
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={pr.experimentProcessType}
                                                            secondary={`RUNNING(${pr.elapsedSec}sec.)`}
                                                        />
                                                        <ListItemIcon>
                                                            <Button disabled={pr.stopRequest} size='small' variant="contained" color="secondary" startIcon={<StopIcon />} onClick={() => stopExperimentProcess({ variables: {id: pr.id } })}>Stop</Button>
                                                        </ListItemIcon>
                                                    </ListItem>)}
                                                    {data.processes.length === 0 ? <ListItem>
                                                        <ListItemIcon><CheckCircleIcon/></ListItemIcon>
                                                        <ListItemText primary={'NO RUNNING JOBS'} secondary={'NO RUNNING JOBS'}/>
                                                    </ListItem>: null}
                                                </List>
                                            </div>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid> */}
                                {/* <Grid item xs={12}>
                                <Button
                                    size="large"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={() => startExperiment({variables: {id: data.id}}).catch((e) => alert(e))}
                                    disabled={data.status !== 'ready'}
                                >START</Button>
                            </Grid> */}
                            </Grid>
                        </Grid>
                        <Grid item xs={9}>
                            <DatasetColumns
                                id={data.lastDataset.id}
                                status={data.lastDataset.processingStatus}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </Grid>
            <Modal isOpen={showAugment} style={modalStyles} onRequestClose={() => toggleAugment(false)}>
                <ClassBalancer experimentId={data.id} targetColumnName={data.targetColumnName}/>
            </Modal>
        </>
    )
}

export default ({id}) => {
    const { loading, error, data } = useQuery(EXPERIMENT_QUERY, {variables: {id}});
    useQuery(MON_QUERY, {pollInterval: 5000, variables: {id}});

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :({String(error)}</p>;

    return <>
        <Grid container alignContent="center">
            <ExperimentDetail env={data.env} data={data.experiment}/>
        </Grid>
    </>
}