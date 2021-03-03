import React, { useState, useEffect } from 'react'
import Slider from '@material-ui/core/Slider';
import FieldUpdater from '../utils/FieldUpdater'
// import MutateAction from '../utils/MutateAction'
import Tooltip from '../utils/Tooltip'
import { toastError, SubHeading, FieldUpdaterWrapper } from '../utils'
import ExperimentDatasetColumnPreview from './ExperimentDatasetColumnPreview'
import ExperimentDatasetPreview from './ExperimentDatasetPreview'
import ExperimentDatasetColumnEDA from './ExperimentDatasetColumnEDA'
import { useQuery, useMutation } from 'react-apollo';
import { gql } from 'apollo-boost';
// import * as client from '../utils/client';
// import ExperimentDatasetPartition from './ExperimentDatasetPartition'
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import GrainIcon from '@material-ui/icons/Grain';
import { makeStyles } from '@material-ui/core/styles';
// import Box from '@material-ui/core/Box';
// import Button from '@material-ui/core/Button';
// import ButtonGroup from '@material-ui/core/ButtonGroup';
// import DeleteIcon from '@material-ui/icons/Delete';
// import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import { Grid, Select, Button } from "@material-ui/core";
import Divider from '@material-ui/core/Divider';
import Input from '@material-ui/core/Input';
// import {
//     // BrowserRouter as Router,
//     // Switch,
//     // Route,
//     Link,
//     NavLink,
//     useRouteMatch,
//     // useParams,
//     // useLocation,
//     // Redirect,
// } from "react-router-dom";
import { Card, Box } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Checkbox from '@material-ui/core/Checkbox';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import HorizontalSplitIcon from '@material-ui/icons/HorizontalSplit';
import SettingsIcon from '@material-ui/icons/Settings';
import TuneIcon from '@material-ui/icons/Tune';
import FeedbackIcon from '@material-ui/icons/Feedback';
import PageviewIcon from '@material-ui/icons/Pageview';
import { useTranslation } from "react-i18next";
import { Alert } from '@material-ui/lab';
import SimpleCard from './Card'


const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(18),
        flexBasis: '20%',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center'
    },
    headingIcon: {
        color:'#cccccc', paddingRight:'5px'
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
    column: {
        flexBasis: '40%'
    },
    swapButton: {
        marginLeft: theme.spacing(2),
    },
    divider: {
        marginTop: '15px',
        marginBottom: '15px',
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 400,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
    link: {
        color: 'blue'
    }
}));

const QUERY_EXPERIMENT_COLUMNS = gql`
    query queryExperimentColumns($id:Int!) {
        experiment(id: $id) {
            id
            __typename
            name
            splitTestdataRate
            splitColumnName
            splitColumnValueForValid
            splitColumnValueForTest
            resamplingStrategyHoldoutTrainSize
            firstDataset: dataset {
                id
            }
            dataset:preprocessedDataset {
                id
                columns {
                    id
                    name
                    datatype
                    datatypeOrigin
                    missing
                    min
                    max
                }
            }
        }
    }
`


const CheckboxFieldSingleUpdater = ({pk, field, value, label, helptext, disabled}) => {
    const [checked, setChecked] = useState(value)
    const [mutateExperiment] = useMutation(gql`
    mutation mutate_${field}($id: ID!, $input: PatchExperimentInput!) {
        patchExperiment(id: $id, input: $input) {
            experiment {
                id
                __typename
                ${field}
                includeClusterAlgorithms
            }
        }
    }`)
    const toggle = () => {
        // console.log(eventValue, value)
        const variables = { id: pk, input: { [field]: !checked } }
        mutateExperiment({ variables })
            .then((e) => setChecked(!checked))
            .catch((e) => {
                toastError(`정상적으로 수행되지 않았습니다. message: ${String(e)}`)
            })
    }

    useEffect(() => {
        setChecked(value)
    }, [value])

    return (
        <FormControlLabel
            control={<Checkbox checked={checked} onChange={toggle} />}
            disabled={disabled}
            helptext={helptext}
            label={label}
        />
    // <div className={disabled ? "wrap_check disabled" : "wrap_check"}>
    //     <InputCheckbox
    //         disabled={disabled}
    //         checked={checked}
    //         onChange={(e) => toggle()}
    //         className="inp_check modal_check"
    //         name={field}
    //         id={'ipk_' + field}
    //         type='checkbox' />
    //     <label className="label_check" htmlFor={'ipk_' + field}>
    //         <span className="ico_automl ico_check"></span>
    //         {/* {checked ? 'Yes' : 'No'} */}
    //         { label }
    //     </label>
    // </div>
    )
}



const ExperimentSamplingConfigurationAccordion = ({useSampling, rowCount, samplingRatio, id, expanded, onChange}) => {
    const { t } = useTranslation();
    const classes = useStyles();
    // const {data, loading, error} = useQuery(gql`
    // query queryExperimentSamplingConfiguration ($id: Int!) {
    //     experiment(id: $id) {
    //         id
    //         __typename
    //         useSampling
    //         samplingRatio
    //     }
    // }
    // `, {variables: {id}});
    const [mutateExperiment] = useMutation(gql`
    mutation mutateSamplingRatio($id: ID!, $input: PatchExperimentInput!) {
        patchExperiment(id: $id, input: $input) {
            experiment {
                id
                __typename
                samplingRatio
            }
        }
    }`)
    const handleSliderChange = (event, newValue) => {
        handleChange(newValue);
    };

    const handleInputChange = (event) => {
        handleChange(event.target.value === '' ? '' : Number(event.target.value));
    };
    const handleChange = (samplingRatio) => {
        const variables = { id, input: { samplingRatio } }
        mutateExperiment({ variables })
            .catch((e) => {
                toastError(`정상적으로 수행되지 않았습니다. message: ${String(e)}`)
            })
    }
    // useEffect(() => {
    //     setChecked(
    //         options.map(option => {
    //             return (value && value.length > 0) ? value.includes(option) : false
    //         })
    //     )
    // }, [field, value, options])
    // if (loading) return 'loading'
    // if (error) return String(error)

    return (<Accordion expanded={expanded} onChange={onChange}>
        <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel-sampling-content"
            id="panel-sampling-header"
            >
            <Typography className={classes.heading}><GrainIcon className={classes.headingIcon}/>{t('Data Sampling')}</Typography>
            {expanded ?
                null
                :
                <Typography className={classes.secondaryHeading}>
                    {useSampling ? `${t('sampling')}(${t('ratio')}:${samplingRatio})`: t('NO SAMPLING')}
                </Typography>
            }
        </AccordionSummary>
        <AccordionDetails>
            <Typography className={classes.heading}></Typography>
                <Grid container spacing={3}>
                    {
                        useSampling ?
                            <Alert severity="warning">Sampling 수행 후, 약 {parseInt(rowCount * samplingRatio)}건이 모델 학습에 사용될 예정입니다.</Alert>
                            :
                            <Alert severity="warning">{parseInt(rowCount)}건이 모델 학습에 사용될 예정입니다.</Alert>
                    }
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={8}>

                        <CheckboxFieldSingleUpdater
                        pk={id}
                        field={'useSampling'}
                        value={useSampling}
                        label={t('USE SAMPLING')}
                        helptext={'data sampling'}
                        />
                            <Slider
                                // value={typeof samplingRatio === 'number' ? samplingRatio : 0}
                                value={samplingRatio}
                                onChange={handleSliderChange}
                                aria-labelledby="input-slider"
                                step={0.1}
                                marks
                                min={0.0}
                                max={1.0}
                            />
                        </Grid>
                        <Grid item>
                            <Input
                                // className={classes.input}
                                value={samplingRatio}
                                margin="dense"
                                onChange={handleInputChange}
                                // onBlur={handleBlur}
                                inputProps={{
                                    step: 0.1,
                                    min: 0,
                                    max: 1,
                                    type: 'number',
                                    'aria-labelledby': 'input-slider',
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Button disabled size="small" variant="contained" color="secondary">SHOW SAMPLING GUIDANCE</Button>
                    </Grid>
                </Grid>
        </AccordionDetails>
        </Accordion>
    )
}


const CheckboxFieldUpdater = ({pk, field, label, value, options, helptext, disabled}) => {
    const classes = useStyles();
    const [mutateExperiment, { error }] = useMutation(gql`
    mutation mutate_${field}($id: ID!, $input: PatchExperimentInput!) {
        patchExperiment(id: $id, input: $input) {
            experiment {
                id
                __typename
                ${field}
                includeClusterAlgorithms
            }
        }
    }`)

    const [checked, setChecked] = useState(options.map(option => {
        return (value && value.length > 0) ? value.includes(option) : false
    }))
    useEffect(() => {
        setChecked(
            options.map(option => {
                return (value && value.length > 0) ? value.includes(option) : false
            })
        )
    }, [field, value, options])
    const setCheckedIndex = (idx, e) => {
        // console.log(idx, e.target.value);
        const filteredOptions = [];
        const results = checked.map((chk, chkIdx) => {
            if (chkIdx === idx) {
                chk = !chk;
            }
            if (chk) {
                filteredOptions.push(options[chkIdx])
            }
            return chk;
        })
        const variables = { id: pk, input: { [field]: JSON.stringify(filteredOptions) } }
        console.log(variables)
        mutateExperiment({ variables })
            .then(() => setChecked(results))
            .catch((e) => {
                toastError(`정상적으로 수행되지 않았습니다. message: ${String(e)}`)
            })
    }

    return (
        <FormControl required error={error} component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">{label}</FormLabel>
            <FormGroup>
                {options.map((e, idx) =>
                    <FormControlLabel
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


const ExperimentConfiguration = ({ data, experiment, pk, refetch }) => {
    const classes = useStyles();
    const [expanded, setExpanded] = React.useState('panel1');
    const { t } = useTranslation();
    const [useSplitByRandom, setUseSplitByRandom] = useState(experiment.splitColumnName === null)
    const [mutateExperiment] = useMutation(gql`
    mutation($id: ID!, $input: PatchExperimentInput!) {
        patchExperiment(id: $id, input: $input) {
            experiment {
                id
                __typename
                splitColumnValueForValid
                splitColumnValueForTest
                splitColumnName
                clusterOptimizer
                numClusters
                timeout
                useEarlystopping
            }
        }
    }`)


    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };
    const splitColumnNames = data && data.experiment.dataset ? data.experiment.dataset.columns.filter(
        (item) => (item.datatypeOrigin === 'FLOAT64' || item.datatypeOrigin === 'INT64') && item.missing === 0
    ).map(c => c.name) : [experiment.splitColumnName]

    const splitColumn = experiment.splitColumnName && data && data.experiment.dataset ? data.experiment.dataset.columns.find(col => col.name === experiment.splitColumnName) : null;

    return (
        <div className={classes.root}>
            <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                >
                    <Typography className={classes.heading}><SettingsIcon className={classes.headingIcon}/> {t('General settings')}</Typography>
                    {expanded !== 'panel1' ?
                        <Typography className={classes.secondaryHeading}>
                            {experiment.estimatorType === 'CLUSTERING' ?
                                experiment.estimatorType
                                :
                                `${experiment.estimatorType}(${experiment.metric}), target column: ${experiment.targetColumnName}`
                            }
                        </Typography>
                        :
                        null
                    }
                </AccordionSummary>
                <AccordionDetails>
                    <Typography className={classes.heading}></Typography>
                    <Grid container spacing={3}>
                        <FieldUpdaterWrapper
                            path={`/experiments/${pk}/`}
                            showLabel={false}
                            onLoad={refetch}
                            field='estimatorType'
                            options={[
                                'CLASSIFIER',
                                'REGRESSOR',
                                'clustering',
                            ]}
                            value={experiment.estimatorType.toLowerCase()}>
                            {t('Estimator Type')} <Tooltip>{t('The type of problem to solve.')}</Tooltip>
                        </FieldUpdaterWrapper>
                        {experiment.estimatorType === 'CLUSTERING' ?
                            null
                            :
                            <>
                                <FieldUpdaterWrapper
                                    path={`/experiments/${pk}/`}
                                    onLoad={refetch}
                                    field='metric'
                                    options={experiment.availableMetrics}
                                    value={experiment.metric.toLowerCase()}>{t('Metric')}</FieldUpdaterWrapper>
                                <FieldUpdaterWrapper path={`/experiments/${pk}/`} onLoad={refetch}
                                    showLabel={false}
                                    field='targetColumnName'
                                    options={data && data.experiment.dataset ? data.experiment.dataset.columns.map(c => c.name) : [experiment.targetColumnName]}
                                    value={experiment.targetColumnName}>
                                    {t('Target')} <Tooltip>{t('The variable that needs to be predicted.')}</Tooltip>
                                </FieldUpdaterWrapper>
                            </>
                        }
                    </Grid>
                </AccordionDetails>
            </Accordion>
            <ExperimentSamplingConfigurationAccordion
                samplingRatio={experiment.samplingRatio}
                useSampling={experiment.useSampling}
                rowCount={experiment.dataset.rowCount}
                id={pk}
                expanded={expanded === 'sampling'}
                onChange={handleChange('sampling')}/>
            <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')} style={{display: experiment.estimatorType === 'CLUSTERING' ? 'none': null}}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2bh-content"
                    id="panel2bh-header"
                >
                    <Typography className={classes.heading}><HorizontalSplitIcon className={classes.headingIcon}/> {t('Data Partitions')}</Typography>
                    {expanded !== 'panel2' ?
                        <Typography className={classes.secondaryHeading}>
                            {experiment.resamplingStrategy} ({t('Split by')} {useSplitByRandom ? 'random': experiment.splitColumnName})
                        </Typography>
                        :
                        null
                    }
                </AccordionSummary>
                <AccordionDetails>
                    <Typography className={classes.heading}></Typography>
                        <Grid container spacing={3}>
                            {/* <Grid item xs={4}>{t('Split Information')}</Grid>
                            <Grid item xs={8}>
                                {data.experiment.trainRowsCnt ?
                                        <>
                                            train:{data.experiment.trainRowsCnt} (<a href={data.experiment.XTrainFile.url} className={classes.link}><u>X_train_file</u></a>, <a href={data.experiment.yTrainFile.url} className={classes.link}><u>y_train_file</u></a>)
                                            {data.experiment.validRowsCnt?<>/ valid:{data.experiment.validRowsCnt} (<a href={data.experiment.XValidFile.url} className={classes.link}><u>X_valid_file</u></a>, <a href={data.experiment.yValidFile.url} className={classes.link}><u>y_valid_file</u></a>)</>:null}
                                            {data.experiment.testRowsCnt? <>/ test:{data.experiment.testRowsCnt} (<a href={data.experiment.XTestFile.url} className={classes.link}><u>X_test_file</u></a>, <a href={data.experiment.yTestFile.url} className={classes.link}><u>y_test_file</u></a>)</> :null}
                                        </>
                                    :
                                    <>
                                    {t('no-split')}
                                    </>
                                }
                            </Grid> */}
                            <FieldUpdaterWrapper path={`/experiments/${pk}/`} onLoad={refetch} field='resamplingStrategy' options={['holdout', 'cv']} value={experiment.resamplingStrategy.toLowerCase()}>{t('Resampling Strategy')}</FieldUpdaterWrapper>
                            <Grid item xs={4}>{t('Split by random')}</Grid>
                            <Grid item xs={8}>
                                <div className="wrap_check">
                                    <input
                                        checked={useSplitByRandom}
                                        type='checkbox'
                                        id='useSplitByRandom'
                                        className="inp_check modal_check"
                                        onChange={(e) => {
                                            // console.log(e.target.checked)
                                            setUseSplitByRandom(e.target.checked)
                                            if (e.target.checked) {
                                                // splitColumnName set to null
                                                if (experiment.splitColumnName) {
                                                    mutateExperiment({ variables: { id: pk, input: { splitColumnName: null } } })
                                                }
                                            }
                                            else {
                                            }
                                        }}
                                    />
                                    <label className="label_check" htmlFor='useSplitByRandom'>
                                        <span className="ico_automl ico_check"></span>
                                        {t('random-split')}
                                    </label>
                                </div>
                            </Grid>
                            <Grid item xs={4}>
                                {t('Split by')} <Tooltip>{t('Split the data into train set and test set after sorting by the key values. \nCan only be applied to int/float columns without missing values.')}</Tooltip>
                            </Grid>
                            <Grid item xs={8}>
                                <div className={useSplitByRandom ? "wrap_select disabled" : "wrap_select"}>
                                    <select
                                        className="form-control"
                                        value={experiment.splitColumnName || ''}
                                        disabled={useSplitByRandom}
                                        onChange={(e) => {
                                            mutateExperiment({
                                                variables: {
                                                    id: pk, input: {
                                                        splitColumnName: e.target.value,
                                                        splitColumnValueForValid: null,
                                                        splitColumnValueForTest: null,
                                                    }
                                                }
                                            })
                                        }}>
                                        <option value=''>----</option>
                                        {splitColumnNames.map(
                                            option => <option key={option} value={option}>{String(option)}</option>
                                        )}
                                    </select>
                                </div>
                            </Grid>
                            <Grid item xs={4}></Grid>
                            <Grid item xs={8}>
                    {splitColumn ?
                        experiment.resamplingStrategy === 'HOLDOUT' ?
                            <>
                                {experiment.splitColumnValueForValid && experiment.splitColumnValueForTest
                                    ?
                                    <>
                                        <div>TRAIN: {splitColumn.min} ~ {experiment.splitColumnValueForValid}</div>
                                        <div>VALID: {experiment.splitColumnValueForValid} ~ {experiment.splitColumnValueForTest}</div>
                                        <div>TEST: {experiment.splitColumnValueForTest} ~ {splitColumn.max}</div>
                                    </>
                                    :
                                    <div>{t('Use the slider to select the TRAIN/VALID/TEST area')}</div>
                                }
                                <div style={{ width: '300px' }}>
                                    <Slider
                                        key='slider-tvt'
                                        track={false}
                                        aria-labelledby="track-false-slider"
                                        getAriaValueText={value => value}
                                        defaultValue={[100, 100]}
                                        marks={[
                                            { value: 0, label: splitColumn.min },
                                            { value: 100, label: splitColumn.max }
                                        ]}
                                        onChange={(e, newValue) => {
                                            mutateExperiment({
                                                variables: {
                                                    id: pk, input: {
                                                        splitColumnValueForValid: (splitColumn.min + (splitColumn.max - splitColumn.min) * newValue[0] / 100).toFixed(2),
                                                        splitColumnValueForTest: (splitColumn.min + (splitColumn.max - splitColumn.min) * newValue[1] / 100).toFixed(2),
                                                    }
                                                }
                                            })
                                        }}
                                        // valueLabelDisplay="on"
                                        valueLabelDisplay="auto"
                                    />
                                </div>
                            </>
                            :
                            <>
                                {experiment.splitColumnValueForTest
                                    ?
                                    <>
                                        <div>TRAIN: {splitColumn.min} ~ {experiment.splitColumnValueForTest}</div>
                                        <div>TEST: {experiment.splitColumnValueForTest} ~ {splitColumn.max}</div>
                                    </>
                                    :
                                    <div>{t('Use the slider to select the TRAIN/VALID/TEST area')}</div>
                                }
                                <div style={{ width: '300px' }}>
                                    <Slider
                                        key='slider-tt'
                                        track={false}
                                        aria-labelledby="track-false-slider"
                                        getAriaValueText={value => value}
                                        defaultValue={[100]}
                                        marks={[
                                            { value: 0, label: splitColumn.min },
                                            { value: 100, label: splitColumn.max }
                                        ]}
                                        onChange={(e, newValue) => {
                                            mutateExperiment({
                                                variables: {
                                                    id: pk, input: {
                                                        splitColumnValueForValid: null,
                                                        splitColumnValueForTest: (splitColumn.min + (splitColumn.max - splitColumn.min) * newValue[0] / 100).toFixed(2),
                                                    }
                                                }
                                            })
                                        }}
                                        // valueLabelDisplay="on"
                                        valueLabelDisplay="auto"
                                    />
                                </div>
                            </>
                        : null
                    }
                        </Grid>
                        {experiment.resamplingStrategy === 'CV' ?
                            <FieldUpdaterWrapper path={`/experiments/${pk}/`} onLoad={refetch} field='resamplingStrategyCvFolds' options={[3, 5, 10]} value={experiment.resamplingStrategyCvFolds}>CV Folds</FieldUpdaterWrapper>
                            :
                            null
                        }
                        {experiment.resamplingStrategy === 'HOLDOUT' && useSplitByRandom ?
                            <FieldUpdaterWrapper path={`/experiments/${pk}/`} onLoad={refetch} field='resamplingStrategyHoldoutTrainSize' options={[0.5, 0.6, 0.7, 0.8, 0.9]} value={experiment.resamplingStrategyHoldoutTrainSize}>{t('Holdout Split Ratio')}</FieldUpdaterWrapper>
                            :
                            null
                        }
                        {useSplitByRandom ?
                            <FieldUpdaterWrapper path={`/experiments/${pk}/`}
                                field='splitTestdataRate'
                                value={experiment.splitTestdataRate}
                                allowNull={true}
                                options={[
                                    0.2,
                                    0.4,
                                    0.6,
                                    0.8,
                                ]}>{t('Test ratio')}</FieldUpdaterWrapper>
                            :
                            null
                        }
                        </Grid>
                </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel3bh-content"
                    id="panel3bh-header"
                >
                    <Typography className={classes.heading}><TuneIcon className={classes.headingIcon}/> {t('Advanced settings')}</Typography>
                    {expanded !== 'panel3' ?
                        <Typography className={classes.secondaryHeading}>
                            {experiment.estimatorType === 'CLUSTERING' ?
                                <>
                                    {/* {`${experiment.includeClusterAlgorithms.length} algorithms`} */}
                                    {`${experiment.numClusters || 'AUTO'} clusters`}
                                </>
                                :
                                <>
                                    {JSON.parse(experiment.includeEstimatorsJson).length}
                                    {' '}
                                    {t('algorithms')}
                                    {' '}
                                    {experiment.useEnsemble ? t('with ensemble') : null}
                                </>
                            }
                        </Typography>
                        :
                        null
                    }
                </AccordionSummary>
                <AccordionDetails>
                    <Typography className={classes.heading}></Typography>
                        {experiment.estimatorType === 'CLUSTERING' ?
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <FormControl className={classes.formControl}>
                                        <InputLabel shrink id="cluster-number-selector-label">
                                            {t('Number of Cluster')}
                                        </InputLabel>
                                        <Select
                                            labelId="cluster-number-selector-label"
                                            id="cluster-number-selector"
                                            value={experiment.numClusters}
                                            displayEmpty
                                            className={classes.selectEmpty}
                                            onChange={(e) =>
                                                mutateExperiment({
                                                    variables: {
                                                        id: pk,
                                                        input: {
                                                            numClusters: e.target.value
                                                        }
                                                    }
                                                }).catch((e) => {
                                                    toastError(`정상적으로 수행되지 않았습니다. message: ${String(e)}`)
                                                })
                                            }
                                        >
                                            <MenuItem value={null}>{t('AUTOSEARCH')}</MenuItem>
                                            {['2', '3', '4', '5', '6', '7', '8', '9', '10'].map(e => (
                                                <MenuItem value={e}>{e}</MenuItem>
                                            ))}
                                        </Select>
                                        <FormHelperText>숫자를 지정시, 특정 분류 알고리즘은 고려하지 않고 탐색을 수행합니다.</FormHelperText>
                                        </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl className={classes.formControl}>
                                        <InputLabel shrink id="cluster-timeout-selector-label">
                                            {t('Timeout')}
                                        </InputLabel>
                                        <Select
                                            labelId="cluster-timeout-selector-label"
                                            id="cluster-timeout-selector"
                                            value={experiment.timeout}
                                            displayEmpty
                                            className={classes.selectEmpty}
                                            onChange={(e) =>
                                                mutateExperiment({
                                                    variables: {
                                                        id: pk,
                                                        input: {
                                                            timeout: e.target.value
                                                        }
                                                    }
                                                }).catch((e) => {
                                                    toastError(`정상적으로 수행되지 않았습니다. message: ${String(e)}`)
                                                })
                                            }
                                        >
                                            {[0, 30, 120, 600, 1800, 3600, 7200, 9000, 12000, 18000, 30000, 60000, 90000].map(e => (
                                                <MenuItem value={e}>{e}</MenuItem>
                                            ))}
                                        </Select>
                                        <FormHelperText>{t('The time limit for the entire experiment by seconds')}</FormHelperText>
                                        </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl className={classes.formControl}>
                                        <InputLabel shrink id="cluster-maxevaltime-selector-label">
                                            {t('Timeout per Trial')}
                                        </InputLabel>
                                        <Select
                                            labelId="cluster-matevaltime-selector-label"
                                            id="cluster-maxevaltime-selector"
                                            value={experiment.maxEvalTime}
                                            displayEmpty
                                            className={classes.selectEmpty}
                                            onChange={(e) =>
                                                mutateExperiment({
                                                    variables: {
                                                        id: pk,
                                                        input: {
                                                            maxEvalTime: e.target.value
                                                        }
                                                    }
                                                }).catch((e) => {
                                                    toastError(`정상적으로 수행되지 않았습니다. message: ${String(e)}`)
                                                })
                                            }
                                        >
                                            {[0, 5, 10, 30, 100, 180, 300, 600, 900, 1200, 1500, 1800].map(e => (
                                                <MenuItem value={e}>{e}</MenuItem>
                                            ))}
                                        </Select>
                                        <FormHelperText>{t('Each evaluation Timeout (sec)')}</FormHelperText>
                                        </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl className={classes.formControl}>
                                        <FormControlLabel
                                            control={
                                            <Checkbox
                                                checked={experiment.useEarlystopping}
                                                onChange={(event)=>{
                                                    mutateExperiment({
                                                        variables: {
                                                            id: pk,
                                                            input: {
                                                                useEarlystopping: event.target.checked
                                                            }
                                                        }
                                                    }).catch((e) => {
                                                        toastError(`정상적으로 수행되지 않았습니다. message: ${String(e)}`)
                                                    })
                                                }}
                                                color="primary"
                                            />
                                            }
                                            label={t('EarlyStopping')}
                                        />
                                        <FormHelperText>{t('If this option is enabled, it stops the experiment if the best score is not improving during certain number of evaluations')}</FormHelperText>
                                    </FormControl>
                                </Grid>
                                {/* <Grid item xs={12}>
                                    <FormControl className={classes.formControl}>
                                        <InputLabel shrink id="cluster-optimizer-selector-label">
                                            {t('Clustering-Optimizer')}
                                        </InputLabel>
                                        <Select
                                            labelId="cluster-optimizer-selector-label"
                                            id="cluster-optimizer-selector"
                                            value={experiment.clusterOptimizer}
                                            displayEmpty
                                            className={classes.selectEmpty}
                                            onChange={(e) =>
                                                mutateExperiment({
                                                    variables: {
                                                        id: pk, input: {
                                                            clusterOptimizer: e.target.value,
                                                        }
                                                    }
                                                }).catch((e) => {
                                                    toastError(`정상적으로 수행되지 않았습니다. message: ${String(e)}`)
                                                })
                                            }
                                        >
                                            {['RANDOM', 'SMAC'].map(e => (
                                                <MenuItem value={e}>{e}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid> */}
                                {/* <Grid item xs={12}>
                                    <CheckboxFieldUpdater
                                        pk={pk}
                                        options={experiment.availableClusterDimReductionAlgs}
                                        label={'Select dimension reduction algorithms'}
                                        // helptext='select one at least'
                                        disabled={false}
                                        value={experiment.includeClusterDimReductionAlgs}
                                        field={'includeClusterDimReductionAlgsJson'}
                                    ></CheckboxFieldUpdater>
                                    <CheckboxFieldUpdater
                                        pk={pk}
                                        options={experiment.availableClusterAlgorithms}
                                        label={'Select cluster algorithms'}
                                        // helptext='select one at least'
                                        disabled={false}
                                        value={experiment.includeClusterAlgorithms}
                                        field={'includeClusterAlgorithmsJson'}
                                    ></CheckboxFieldUpdater>
                                </Grid> */}
                            </Grid>
                            :
                            <Grid container spacing={3}>
                                <FieldUpdaterWrapper
                                    path={`/experiments/${pk}/`}
                                    onLoad={refetch}
                                    showLabel={false}
                                    field='timeout'
                                    options={[0, 30, 120, 600, 1800, 3600, 7200, 9000, 12000, 18000, 30000, 60000, 90000]}
                                    value={experiment.timeout}>
                                    {t('Time Out (sec)')} <Tooltip>{t('The time limit for the entire experiment by seconds.')}</Tooltip>
                                </FieldUpdaterWrapper>
                                <FieldUpdaterWrapper
                                    path={`/experiments/${pk}/`}
                                    onLoad={refetch}
                                    showLabel={false}
                                    type='checkbox'
                                    field='useEarlystopping'
                                    value={experiment.useEarlystopping}>
                                    {t('EarlyStopping')} <Tooltip>{t('If this option is enabled, it stops the experiment if the best score is not improving during certain number of evaluations')}</Tooltip>
                                </FieldUpdaterWrapper>
                                <FieldUpdaterWrapper path={`/experiments/${pk}/`} onLoad={refetch} field='maxEvalTime' options={[0, 5, 10, 30, 100, 180, 300, 600, 900, 1200, 1500, 1800]} value={experiment.maxEvalTime}>{t('Each evaluation Timeout (sec)')}</FieldUpdaterWrapper>
                                <Divider className={classes.divider}/>
                                <FieldUpdaterWrapper
                                    path={`/experiments/${pk}/`}
                                    type='checkbox'
                                    onLoad={refetch}
                                    field={'useEnsemble'}
                                    value={experiment.useEnsemble}
                                >{t('Use Ensemble Builder')}</FieldUpdaterWrapper>
                                <Divider className={classes.divider}/>
                                <FieldUpdaterWrapper
                                    path={`/experiments/${pk}/`}
                                    onLoad={refetch}
                                    field='includeEstimatorsJson'
                                    type='checkbox'
                                    options={experiment.availableEstimators}
                                    value={JSON.parse(experiment.includeEstimatorsJson)}
                                >{t('Include Estimators')}</FieldUpdaterWrapper>
                                <Divider className={classes.divider}/>
                                <FieldUpdaterWrapper path={`/experiments/${pk}/`} onLoad={refetch} type='checkbox' field='includeOneHotEncoding' value={experiment.includeOneHotEncoding}>
                                    <label htmlFor="pre_1HotEncod" className="label_check"><span
                                        className="ico_automl ico_check"></span>{t('One Hot Encoding')}</label>
                                    <Tooltip>{t('about-ohe')}</Tooltip>
                                </FieldUpdaterWrapper>
                                <Divider className={classes.divider}/>
                                <FieldUpdaterWrapper path={`/experiments/${pk}/`} onLoad={refetch} type='checkbox' field='includeVarianceThreshold' value={experiment.includeVarianceThreshold}>
                                    <label htmlFor="pre_VarThreshold" className="label_check"><span
                                        className="ico_automl ico_check"></span>{t('Variance Threshold')}</label>
                                    <Tooltip>{t('about-varthreshold')}</Tooltip>
                                </FieldUpdaterWrapper>
                                <Divider className={classes.divider}/>
                                <FieldUpdaterWrapper path={`/experiments/${pk}/`} onLoad={refetch} showLabel={false} type='checkbox' field='includeScalingMethodsJson' options={experiment.availableScalingMethods} value={experiment.includeScalingMethods}>
                                    <label htmlFor="pre_Scaling" className="label_check"><span
                                        className="ico_automl ico_check"></span>{t('Scaling')}</label>
                                    <Tooltip>{t('about-scaling')}</Tooltip>
                                </FieldUpdaterWrapper>
                                <Divider className={classes.divider}/>
                                <FieldUpdaterWrapper path={`/experiments/${pk}/`} onLoad={refetch} type='checkbox' field='includeFeatureEngineeringsJson' options={experiment.availableFeatureEngineerings} value={experiment.includeFeatureEngineerings}>
                                    <label htmlFor="pre_FtrSlcon" className="label_check"><span
                                        className="ico_automl ico_check"></span>{t('Feature Engineering')}</label>
                                    <Tooltip>{t('about-featureengineering')}</Tooltip>
                                </FieldUpdaterWrapper>
                            </Grid>
                        }
                </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')} style={{display: experiment.estimatorType === 'CLUSTERING' ? 'none': null}}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel4bh-content"
                    id="panel4bh-header"
                >
                    <Typography className={classes.heading}><FeedbackIcon className={classes.headingIcon}/> {t('Experimental')}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography className={classes.heading}></Typography>
                    <Grid container spacing={3}>
                        {/* <Grid item xs={4} justify="center" alignItems="center" alignContent="center">
                            <Typography>{t('Use Reinforcement learning to build a pipeline')}</Typography>
                        </Grid>
                        <Grid item xs={8} alignContent="center">
                            <CheckboxFieldSingleUpdater
                                pk={pk}
                                field={'useAlphaautoml'}
                                label={''}
                                value={experiment.useAlphaautoml} />
                        </Grid> */}
                        {/* <FieldUpdaterWrapper path={`/experiments/${pk}/`} onLoad={refetch} field='timeoutMonitor' value={experiment.timeoutMonitor}>Timeout Monitoring Method </FieldUpdaterWrapper> */}
                        {/* <FieldUpdaterWrapper path={`/experiments/${pk}/`} onLoad={refetch} field='scaleUnit' value={experiment.scaleUnit}>Scale out Unit</FieldUpdaterWrapper> */}
                        <FieldUpdaterWrapper path={`/experiments/${pk}/`} showLabel={false} onLoad={refetch} field='randomState' type='text' value={experiment.randomState}>{t('Random Seed')}<Tooltip>{t('Fix all algorithm seeds')}</Tooltip> </FieldUpdaterWrapper>
                        <FieldUpdaterWrapper
                            path={`/experiments/${pk}/`}
                            onLoad={refetch}
                            showLabel={false}
                            field={'workerScale'}
                            options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                            value={experiment.workerScale}>
                            {t('number-container')} <Tooltip>{t('number-container-description')}</Tooltip>
                        </FieldUpdaterWrapper>
                        <Grid item xs={4}>{t('Log Level')}</Grid>
                        <Grid item xs={8}>
                                <FieldUpdater path={`/experiments/${pk}/`} onLoad={refetch} field='logLevel' value={experiment.logLevel} />
                                {/* {' '} */}
                                {/* <Button variant="contained" component="a" href={`/r/${pk}/events`}>LOG FILES</Button> */}
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </div>
    )
}


export default ({ experiment, refetch, open }) => {
    const pk = experiment.id;
    // const [ columnsView, setColumnsView ] = useState(false)
    const { data, loading, error } = useQuery(QUERY_EXPERIMENT_COLUMNS, { variables: { id: pk } })
    const classes = useStyles();
    const { t } = useTranslation();

    if (loading) return 'loading'
    if (error) return String(error)

    return (
        <section className="section_content">
            <SubHeading>{t('General Settings Overview for the experiment selected')}</SubHeading>
            {data && data.experiment ?
                <>
                    <ExperimentConfiguration
                        data={data}
                        experiment={experiment}
                        pk={pk}
                        refetch={refetch}
                    />
                    {/* <Box mt={2}>
                    <Grid
                        container
                        direction="row"
                        justify="flex-start"
                        alignItems="flex-start"
                        spacing={2}
                    >
                        <Grid item sm={3} xs={6}><SimpleCard/></Grid>
                        <Grid item sm={3} xs={6}><SimpleCard/></Grid>
                        <Grid item sm={3} xs={6}><SimpleCard/></Grid>
                        <Grid item sm={3} xs={6}><SimpleCard/></Grid>
                    </Grid>
                    </Box> */}
                    <Card style={{marginTop: '15px', padding: '16px'}}>
                        <Typography className={classes.heading}>
                            <PageviewIcon className={classes.headingIcon}/>
                            {t('Data Preview')}
                            {/* <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                disableElevation
                                className={classes.swapButton}
                                startIcon={<SwapHorizIcon />}
                                onClick={() => setColumnsView(true)}
                            >
                                Column View
                            </Button> */}
                        </Typography>
                        <div className="area_scroll">
                            <ExperimentDatasetPreview id={data.experiment.dataset.id} />
                        </div>
                    </Card>
                    <Card style={{marginTop: '15px', padding: '16px'}}>
                        <Typography className={classes.heading}>
                            <PageviewIcon className={classes.headingIcon}/>
                            {t('Data Columns')}
                            {/* <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                disableElevation
                                className={classes.swapButton}
                                startIcon={<SwapHorizIcon />}
                                onClick={() => setColumnsView(false)}
                            >
                                Data Preview
                            </Button> */}
                        </Typography>
                        <div className="area_scroll">
                            <ExperimentDatasetColumnPreview id={data.experiment.dataset.id} />
                        </div>
                    </Card>
                    <Card style={{marginTop: '15px', padding: '16px'}}>
                        <Typography className={classes.heading}>
                            <PageviewIcon className={classes.headingIcon}/>
                            {t('EDA')} {experiment.targetColumnName ? ` (target: ${experiment.targetColumnName})` : null}
                        </Typography>
                        <div className="area_scroll">
                            <ExperimentDatasetColumnEDA datasetId={data.experiment.dataset.id} targetColumnName={experiment.targetColumnName}/>
                        </div>
                    </Card>
                </>
                :
                null
            }
        </section>
    )
}
