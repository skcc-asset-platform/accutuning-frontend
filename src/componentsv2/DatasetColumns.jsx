/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
// import { useQuery, useMutation, gql } from '@apollo/client';
import { useQuery, useMutation } from "react-apollo";
import gql from "graphql-tag";

import SaveIcon from '@material-ui/icons/Save';
import { useTranslation } from "react-i18next";
import MicroBarChart from 'react-micro-bar-chart'

import { Alert, AlertTitle, Pagination} from '@material-ui/lab';
import SettingsIcon from '@material-ui/icons/Settings';
import {
    Button, Box, ButtonGroup, Grid, TextField,
    makeStyles,
    Checkbox,
    Select,
    FormControl,
    InputLabel,
    MenuItem,
    FormGroup,
    FormControlLabel,
    FormHelperText,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    RadioGroup,
    Radio,
    Slider,
    FormLabel,
    CircularProgress,
    DialogTitle,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogActions,
    CardContent,
    CardHeader,
    Card,
} from '@material-ui/core';

import TextConfiguration from './TextConfiguration'

const useStyles = makeStyles((theme) => ({
    formControl: {
        marginRight: theme.spacing(1),
        minWidth: 120,
    },
    thead: {
        // borderTop: '1px solid gray',
        backgroundColor: '#eeeeee',
    },
    tbody: {
        borderBottom: '1px solid black',
    },
    td: {
        // borderBottom: '1px solid #d6d6d6';
        borderRight: '1px dashed #d6d6d6',
        // .tbl_g thead tr th:last-child, .tbl_g tbody tr td:last-child, .tbl_thead thead tr th:last-child, .tbl_tbody tr td:last-child {
        //     border-right: 0 !important;
        // }
    },
    root: {
        width: "auto",
        // marginTop: theme.spacing.unit * 3,
        overflowX: "auto"
      },
      table: {
        minWidth: 500
      },
      container: {
        [theme.breakpoints.up('sm')]: {
            maxWidth: theme.breakpoints.width('sm'),
        },
        [theme.breakpoints.up('md')]: {
            maxWidth: theme.breakpoints.width('md'),
        },
        [theme.breakpoints.up('lg')]: {
            maxWidth: theme.breakpoints.width('lg'),
        },
        [theme.breakpoints.up('xl')]: {
            maxWidth: theme.breakpoints.width('xl'),
        }
    }
}));

const QUERY_DATASET_COLUMNS = gql`
query queryColumns($id:Int! $search: String $first: Int $skip: Int $datatype: String) {
    dataset (id: $id) {
        id
        createdAt
        name
        rowCount
        colCount
        preprocessorFile {
            url
        }
        preprocessorInfo
        isProcessed
        processedAt
        processingStatus
        lastError
        pagingCount (search: $search, datatype:$datatype)
        pagingColumns (search: $search, first: $first, skip: $skip datatype:$datatype) {
            id
            createdAt
            idx
            name
            datatype
            imputation
            availableImputation
            unique
            missing
            missingRatio
            mean
            min
            max
            mostFrequent
            transformationStrategy
            availableTransformationStrategy
            freqIdxJson
            freqJson
            taskType
            isFeature
        }
        processedDataset {
            id
        }
        experiment {
            estimatorType
            targetColumnName
        }
        source {
            file {
                url
                sizeHumanized
            }
        }
    }
}
`

function Datetime64ConfigurationDialog(props) {
    const { id, onClose, open } = props;
    const DATETIME64_CONFIGURATION = gql`
    query datetime64Config($id: Int!) {
        column (id: $id)  {
            id
            datetime64ConvertFormat
            datetime64Populate
            datetime64AsTimestamp
            __typename
        }
    }`
    const { data, loading, error } = useQuery(DATETIME64_CONFIGURATION, { variables: {id}});

    const handleClose = () => {
      onClose();
    };

    if (loading) return 'loading..'
    if (error) return String(error)

    return (
      <Dialog onClose={handleClose} aria-labelledby="datetime64-configuration-dialog-title" open={open}>
        <DialogTitle id="datetime64-configuration--dialog-title">Datetime64 Type Configuration</DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              Let Google help apps determine location. This means sending anonymous location data to
              Google, even when no apps are running.
            </DialogContentText>
            <ColumnTextFormControl
              label='Custom Datetime Format'
              id={id}
              value={data.column.datetime64ConvertFormat}
              field='datetime64ConvertFormat'
              helptext=''
              extraFields=''
              disabled={false}/>
            <ColumnCheckboxFormControl
              label='Populate Feature'
              id={id}
              value={data.column.datetime64Populate}
              field='datetime64Populate'
              helptext=''
              extraFields=''
              disabled={false}/>
            <ColumnCheckboxFormControl
              label='Convert as number(timestamp)'
              id={id}
              value={data.column.datetime64AsTimestamp}
              field='datetime64AsTimestamp'
              helptext=''
              extraFields=''
              disabled={false}/>
          </DialogContent>
      </Dialog>
    );
}


export function TextConfigurationDialog(props) {
    const { id, onClose, open } = props;
    return <Dialog maxWidth='xl' onClose={onClose} aria-labelledby="text-labeling-configuration-dialog-title" open={open}>
        <DialogTitle id="text-labeling-configuration--dialog-title">Text Labeling Configuration</DialogTitle>
        <DialogContent>
            <TextConfiguration id={id}/>
        </DialogContent>
    </Dialog>
}

function LaggingConfigurationDialog(props) {
    const { id, onClose, open } = props;
    const QUERY_COLUMN = gql`
    query ($id:Int!) {
        column(id: $id) {
            id
            __typename
            lagsType
            lagsNumber
            lagsNumber2
        }
    }`
    const MUTATE_DATASET_COLUMN = gql`
    mutation ($id:ID!, $input: PatchColumnInput!) {
        patchColumn(id: $id, input: $input) {
            column {
                id
                __typename
                lagsType
                lagsNumber
                lagsNumber2
            }
        }
    }
    `
    const {data, loading, error} = useQuery(QUERY_COLUMN, {variables: {id}});
    const [mutateColumn] = useMutation(MUTATE_DATASET_COLUMN)

    const handleChange = (event) => {
        mutateColumn({variables: {id, input: {lagsType: event.target.value}}});
    };

    if (loading) return 'loading..'
    if (!data || !data.column) return 'no data'
    if (error) return String(error)

    return (
        <Dialog onClose={onClose} aria-labelledby="datetime64-configuration-dialog-title" open={open}>
            <DialogTitle id="datetime64-configuration--dialog-title">Lagging Configuration</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                    전처리 후 미리보기에서 변환된 결과 데이터를 확인하세요.
                    <br/>
                    오름차순으로 정렬되어 있는 시계열 데이터 기준으로 볼 때 -는 과거의 데이터이고, +는 미래의 데이터입니다
                </DialogContentText>
                <FormControl component="fieldset">
                <FormLabel component="legend">Select Lag Type</FormLabel>
                <RadioGroup row aria-label="lagType" name="lagType" value={data.column.lagsType || 'SINGLE'} onChange={handleChange}>
                    <FormControlLabel value="SINGLE" control={<Radio />} label="Single" />
                    <FormControlLabel value="RANGED" control={<Radio />} label="Ranged" />
                </RadioGroup>
                </FormControl>
                {data.column.lagsType === 'RANGED' ?
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Lag Range ({data.column.lagsNumber}~{data.column.lagsNumber2})</FormLabel>
                        <Box component="div" style={{width: '500px'}} mt={10}>
                        <Slider
                            key='ranged-slider'
                            track={true}
                            aria-labelledby="track-false-slider"
                            getAriaValueText={value => value}
                            valueLabelDisplay="on"
                            defaultValue={[data.column.lagsNumber, data.column.lagsNumber2]}
                            min = {-20}
                            max = {20}
                            step = {1}
                            marks={[
                                { value: -20, label: 'Past' },
                                { value: -10 },
                                { value: 0 },
                                { value: 10 }, 
                                { value: 20, label: 'Future' },
                            ]}
                            onChange={(e, value) => {
                                mutateColumn({
                                    variables: {
                                        id, input: {
                                            lagsNumber: value[0],
                                            lagsNumber2: value[1],
                                        }
                                    }
                                })
                            }}
                        /></Box>
                    </FormControl>
                    :
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Lag Value ({data.column.lagsNumber})</FormLabel>
                        <Box component="div" style={{width: '500px'}} mt={10}>
                        <Slider
                            key='single-slider'
                            track={false}
                            aria-labelledby="track-false-slider"
                            getAriaValueText={value => value}
                            defaultValue={data.column.lagsNumber}
                            min = {-20}
                            max = {20}
                            step = {1}
                            marks={[
                                { value: -20, label: 'Past' },
                                { value: -10 },
                                { value: 0 },
                                { value: 10 }, 
                                { value: 20, label: 'Future' },
                            ]}
                            onChange={(e, value) => {
                                mutateColumn({
                                    variables: {
                                        id: id, input: {
                                            lagsNumber: value,
                                            lagsNumber2: null,
                                        }
                                    }
                                })
                            }}
                            valueLabelDisplay="on"
                        /></Box>
                    </FormControl>
                }
            </DialogContent>
        </Dialog>
    )
}


function ExperimentDatasetConfigurationDialog(props) {
    const { id, onClose, open } = props;
    const DATASET_CONFIGURATION = gql`
    query datasetConfig($id: Int!) {
        dataset (id: $id)  {
            id
            outlierUse
            outlierStrategy
            outlierThreshold
            imputerUse
            colTransUse
        }
    }`
    const { data, loading, error } = useQuery(DATASET_CONFIGURATION, { variables: {id}});

    const handleClose = () => {
      onClose();
    };

    if (loading) return 'loading..'
    if (error) return String(error)

    return (
      <Dialog onClose={handleClose} aria-labelledby="dataset-configuration-dialog-title" open={open}>
        <DialogTitle id="dataset-configuration--dialog-title">Dataset Configuration (Outlier)</DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              Let Google help apps determine location. This means sending anonymous location data to
              Google, even when no apps are running.
            </DialogContentText>
            <DatasetBooleanFormControl
              label='Use outlier'
              id={id}
              value={data.dataset.outlierUse}
              field='outlierUse'
              helptext=''
              extraFields=''
              disabled={false}/>
            <DatasetSelectFormControl
              label='outlierThreshold'
              id={id}
              value={data.dataset.outlierThreshold}
              field='outlierThreshold'
              choices={[0.2, 0.4, 0.6, 0.8]}
              helptext=''
              extraFields=''
              disabled={!data.dataset.outlierUse}/>
            <DatasetSelectFormControl
              label='outlierStrategy'
              id={id}
              value={data.dataset.outlierStrategy}
              field='outlierStrategy'
              choices={['BOX_PLOT_RULE', 'Z_SCORE']}
              helptext=''
              extraFields=''
              disabled={!data.dataset.outlierUse}/>
          </DialogContent>
      </Dialog>
    );
  }


// const ExperimentDatasetConfiguration = ({dataset, refetch, onRequestClose}) => {
//     // const { t } = useTranslation();
//     // const FieldUpdaterWrapper = (props) => (
//     //     <div className="item_dl type_inline">
//     //         <dt>{props.children}</dt>
//     //         <dd><FieldUpdater {...props}/></dd>
//     //     </div>
//     // )
//     return (
//         <Box>
//             {/* <ModalHeader title={t('Preprocess Configuration')}/>
//             <ModalBody>
//                 <div className="list_evaluation">
//                     <FieldUpdaterWrapper type='checkbox' showLabel={false} path={`/datasets/${dataset.id}/`} onLoad={() => refetch()} field='outlierUse' value={dataset.outlierUse}>{t('Remove Outlier')}</FieldUpdaterWrapper>

//                     {dataset.outlierUse ? <Box mt={1}>
//                             <Alert severity="info">아래 설정은 이상치 제거 수행예정인 전체 컬럼에 대해서 일괄로 적용됩니다.</Alert>
//                             <Box p={2} mt={0} style={{border: '1px solid #eeeeee'}}>
//                                 <FieldUpdaterWrapper path={`/datasets/${dataset.id}/`} onLoad={() => refetch()} field='outlierThreshold' options={[0.2, 0.4, 0.6, 0.8]} value={dataset.outlierThreshold}>{t('outlierThreshold')}</FieldUpdaterWrapper>
//                                 <FieldUpdaterWrapper path={`/datasets/${dataset.id}/`} onLoad={() => refetch()} field='outlierStrategy' options={['BOX_PLOT_RULE', 'Z_SCORE']} value={dataset.outlierStrategy}>{t('outlierStrategy')}</FieldUpdaterWrapper>
//                             </Box>
//                         </Box>
//                         :
//                         null
//                     }
//                     <hr/>
//                     <FieldUpdaterWrapper type='checkbox' showLabel={false} path={`/datasets/${dataset.id}/`} onLoad={() => refetch()} field='imputerUse' value={dataset.imputerUse}>{t('Use N/A imputer')}</FieldUpdaterWrapper>
//                     <FieldUpdaterWrapper type='checkbox' showLabel={false} path={`/datasets/${dataset.id}/`} onLoad={() => refetch()} field='colTransUse' value={dataset.colTransUse}>{t('Use Transformer')}</FieldUpdaterWrapper>
//                 </div>
//             </ModalBody>
//             <div className="footer_popup">
//                 <button className="btn_close" onClick={onRequestClose}><span className="ico_automl ico_close">{t('Close Popup')}</span></button>
//             </div> */}
//         </Box>
//     )
// }

// const ExperimentAugmentConfiguration = ({dataset}) => {
//     const { t } = useTranslation();
//     const [mutateDataset] = useMutation(gql`
//     mutation mutate_sampling($id: ID!, $input: PatchDatasetInput!) {
//         patchDataset(id: $id, input: $input) {
//             dataset {
//                 id
//                 __typename
//                 samplingSize
//                 useSampler
//                 useClassBalancer
//             }
//         }
//     }`)
//     // let data, label;
//     // dataset.columns.map(column => column.name === dataset.experiment.targetColumnName ? (
//     //     data =column.freqJson,
//     //     label =column.freqIdxJson) : null );
//     // const FieldUpdaterWrapper = (props) => (
//     //     <div className="item_dl type_inline">
//     //         <dt>{props.children}</dt>
//     //         <dd><FieldUpdater {...props}/></dd>
//     //     </div>
//     // )

//     return (
//         <div>
//             {/* <ModalHeader title={t('Sampling Configuration')}/>
//             <ModalBody>
//                 <FormGroup row>
//                     <FormControlLabel
//                             control={
//                             <Checkbox
//                                 checked={dataset.useSampler}
//                                 onChange={(e) => mutateDataset({variables: {
//                                     id: dataset.id,
//                                     input: {useSampler: e.target.checked}
//                                 }}).catch((e) => {
//                                     toastError(`정상적으로 수행되지 않았습니다. message: ${String(e)}`)
//                                 })}
//                                 color="primary"
//                             />
//                             }
//                             label={t('Use sampler')}
//                         />
//                     <TextField
//                         // defaultValue={dataset.rowCount}
//                         value={dataset.samplingSize}
//                         variant="filled"
//                         size="small"
//                         id="outlined-basic"
//                         fullWidth
//                         label={t('Sampling size') + '(max: 100000)'}
//                         disabled={!dataset.useSampler}
//                         onChange={(e) => {
//                             const samplingSize = e.target.value > 100000 ? 100000 : e.target.value;
//                             const variables = {
//                                 id: dataset.id,
//                                 input: { samplingSize }
//                             }
//                             mutateDataset({ variables })
//                                 .catch((e) => {
//                                     toastError(`정상적으로 수행되지 않았습니다. message: ${String(e)}`)
//                                 })
//                         }}
//                         />
//                     <FormControlLabel
//                             control={
//                             <Checkbox
//                                 checked={dataset.useClassBalancer}
//                                 onChange={(e) => mutateDataset({variables: {
//                                     id: dataset.id,
//                                     input: {useClassBalancer: e.target.checked}
//                                 }}).catch((e) => {
//                                     toastError(`정상적으로 수행되지 않았습니다. message: ${String(e)}`)
//                                 })}
//                                 name="checkedB"
//                                 color="primary"
//                                 disabled={!dataset.useSampler || dataset.experiment.estimatorType !== 'CLASSIFIER'}
//                             />
//                             }
//                             label={t('Use class balancer') + ' ('+ t('CLASSIFIER only')+')'}
//                         />
//                 </FormGroup>
//                 <Box>
//                 {dataset.experiment.estimatorType === 'CLASSIFIER' && dataset.useClassBalancer ?
//                         <ClassBalancer datasetId={dataset.id}
//                             targetColumnName={dataset.experiment.targetColumnName}
//                             />
//                             :
//                             null
//                     }
//                 </Box>
//             </ModalBody> */}
//         </div>
//     )
// }



const DatasetSelectFormControl = ({id, field, extraFields, value, choices, label, helptext, disabled, readOnly}) => {
    const classes = useStyles();
    const [mutateDataset] = useMutation(gql`
    mutation mutate_dataset_${field}($id: ID!, $input: PatchDatasetInput!) {
        patchDataset(id: $id, input: $input) {
            dataset {
                id
                __typename
                ${field}
                ${extraFields}
            }
        }
    }`)

    return (
        <FormControl className={classes.formControl}>
        <InputLabel id={`dataset-${field}-label`}>{label}</InputLabel>
        <Select
            labelId={`dataset-${field}-label`}
            id={`dataset-${field}-select`}
            value={value}
            disabled={disabled}
            readOnly={readOnly}
            onChange={(e) => {
                const variables = { id, input: { [field]: e.target.value } }
                mutateDataset({ variables })
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


const DatasetBooleanFormControl = ({id, field, extraFields, value, label, helptext, disabled, readOnly}) => {
    return <DatasetSelectFormControl
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



export const ColumnSelectFormControl = ({id, field, extraFields, value, choices, label, helptext, disabled, readOnly}) => {
    const classes = useStyles();
    const [mutateColumn] = useMutation(gql`
    mutation mutate_column_${field}($id: ID!, $input: PatchColumnInput!) {
        patchColumn(id: $id, input: $input) {
            column {
                id
                __typename
                ${field}
                ${extraFields}
            }
        }
    }`)

    return (
        <FormControl className={classes.formControl}>
        {label ?
            <InputLabel id={`column-${field}-label`}>{label}</InputLabel>
            :
            null
        }
        <Select
            labelId={`column-${field}-label`}
            id={`column-${field}-select`}
            value={value}
            disabled={disabled}
            readOnly={readOnly}
            onChange={(e) => {
                const variables = { id, input: { [field]: e.target.value } }
                mutateColumn({ variables })
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


const ColumnTextFormControl = ({id, field, extraFields, label, value, helptext, fullWidth, disabled}) => {
    const [val, setVal] = useState(value)
    const [mutateColumn] = useMutation(gql`
    mutation mutate_${field}($id: ID!, $input: PatchColumnInput!) {
        patchColumn(id: $id, input: $input) {
            column {
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
                                onClick={() => mutateColumn({variables: {id, input: {[field]: val}}})}>Save</Button>
                            <Button
                                color='secondary'
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
                                onClick={() => mutateColumn({variables: {id, input: {[field]: val}}})}>Save</Button>
                            <Button
                                color='secondary'
                                onClick={() => setVal(value)}>Reset</Button>
                        </ButtonGroup>
                    </Grid>
                </Grid>
            }
        </form>
    )
}

export const ColumnCheckboxFormControl = ({id, field, value, label, helptext, extraFields, disabled}) => {
    const [checked, setChecked] = useState(value)
    const [mutateColumn] = useMutation(gql`
    mutation mutate_column_${field}($id: ID!, $input: PatchColumnInput!) {
        patchColumn(id: $id, input: $input) {
            column {
                id
                __typename
                ${field}
                ${extraFields}
            }
        }
    }`)
    const toggle = () => {
        // console.log(eventValue, value)
        const variables = { id, input: { [field]: !checked } }
        mutateColumn({ variables })
            .then((e) => setChecked(!checked))
            .catch((e) => {
                alert(`정상적으로 수행되지 않았습니다. message: ${String(e)}`)
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
    )
}


const ExperimentDatasetPreview = ({id}) => {
    const {data, loading, error} = useQuery(gql`
    query datasetPreview($id:Int!) {
        dataset(id: $id) {
            id
            __typename
            previewHead
        }
    }
    `, {
        variables: {id}
    });
    const CTableHead = ({data}) => {
        return <TableRow>
            {data.map(k => <TableCell key={k}>{k}</TableCell>)}
        </TableRow>
    }

    const CTableBody = ({data}) => {
        return <TableRow>
            {Object.keys(data).map(key => <TableCell key={key}>{data[key]}</TableCell>)}
        </TableRow>
    }


    const classes = useStyles()

    if (loading) return 'loading..'
    if (error) return 'error'

    const previewData = JSON.parse(data.dataset.previewHead);

    return (
        <TableContainer className={classes.container}>
            <Table stickyHeader className={classes.table}>
                <TableHead>
                    <CTableHead data={Object.keys(previewData[0])}/>
                </TableHead>
                <TableBody>
                    {previewData.map((row, idx) => <CTableBody key={idx} data={row}/>)}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

const ExperimentDatasetColumns = ({id}) => {
    const { t } = useTranslation();
    const classes = useStyles()
    const [columnConfig, setColumnConfig] = useState(null);
    // const [getColumn, { loading, data }] = useLazyQuery(QUERY_SINGLE_COLUMN);
    const fields = [
        'Use',
        'Name',
        'Datatype',
        'Missing',
        'Imputation',
        'Remove outlier',
        'Transform',
        'Most Frequent',
        'Unique',
        'Mean',
        'Min',
        'Max',
        'Distribution',
    ];

    const REACT_APP_EX_ROW_COUNT = 10;
    const [columnPage, setColumnPage] = React.useState(1);
    const columnFirst = REACT_APP_EX_ROW_COUNT;
    const [columnSkip, setColumnSkip] = useState(0);
    const [columnFilterText, setColumnFilterText] = useState(null)
    const [columnPageCount, setColumnPageCount] = useState(1);
    const [columnFilterDataType, setColumnFilterDataType] = useState(null);

    const {data, error, refetch} = useQuery(QUERY_DATASET_COLUMNS, {
        variables: {id, first: columnFirst, skip: columnSkip, search: columnFilterText, datatype: columnFilterDataType}
    })

    useEffect(() => {
        if (data) {
            setColumnPageCount(Math.ceil(data.dataset.pagingCount/ REACT_APP_EX_ROW_COUNT));
          }
    }, [data]);

    const handleColumnPage = (event, value) => {
        setColumnPage(value);
        setColumnSkip((value - 1) * REACT_APP_EX_ROW_COUNT);
    };

    const handleDataType = (value) => {
        setColumnFilterDataType(value);
        // setColumnPage(1);
        // setColumnSkip(0);
    };

    const handleSearchText = (value) => {
        setColumnFilterText(value);
        // setColumnPage(1);
        // setColumnSkip(0);
    };
    // const [preprocess] = useMutation(gql`mutation preprocess($id:ID!) {
    //     preprocess (id: $id) {
    //         dataset {
    //             id
    //             processingStatus
    //         }
    //         error
    //         errorMessage
    //     }
    // }`)
    const [updateRecommendationConfig] = useMutation(gql`mutation patchRecmdConfig($id:ID!) {
        patchRecommendationConfig (id: $id) {
            dataset {
                id
                processingStatus
            }
        }
    }`)
    // const [unlinkDataset] = useMutation(gql`mutation unlinkDataset($id: ID! ) {
    //     unlinkDataset(id: $id) {
    //         ok
    //         errorMessage
    //     }
    // }`)
    const [showConfig, toggleConfig] = useState(false)
    // const [showAugment, toggleAugment] = useState(false)
    // const [showViz, toggleViz] = useState(false)
    // const [showInfo, toggleInfo] = useState(false)

    if (error) return String(error)

    const pageCount = columnPageCount
    const handlePage = handleColumnPage
    const page = columnPage
    let columnConfigDialog = null

    if (columnConfig && columnConfig.transformationStrategy === 'POPULATE_DATETIME_FIELD') {
        columnConfigDialog = <Datetime64ConfigurationDialog open={true} id={columnConfig.id} onClose={()=>setColumnConfig(null)} />
    }
    else if (columnConfig && columnConfig.transformationStrategy === 'ADD_LAGS') {
        columnConfigDialog = <LaggingConfigurationDialog open={true} id={columnConfig.id} onClose={()=>setColumnConfig(null)} />
    }
    else if (columnConfig && columnConfig.transformationStrategy === 'NL_LABELING') {
        columnConfigDialog = <TextConfigurationDialog open={true} id={columnConfig.id} onClose={()=>setColumnConfig(null)} />
    }

    return (
        <>
            {/* <Alert severity='warning'>
                5 Columns include NaN values. Check the imputation method.
            </Alert> */}

            <Grid container justify="space-between">
                <Grid item>
                    {data && data.dataset ?
                        <ButtonGroup variant="outlined" aria-label="preprocessor button groups">
                            {/* <Button color='primary' variant="contained" onClick={() => preprocess({variables: {id}})}>
                                {t('Preprocess Only')}
                            </Button> */}
                            <Button variant="outlined" component="a" href={data.dataset.source.file.url} startIcon={<SaveIcon/>}>
                                {t('Export')}
                                <Box component="span" color="gray">({data.dataset.source.file.sizeHumanized})</Box>
                            </Button>
                            {/* <Button variant="outlined" onClick={
                                () => unlinkDataset({variables: {id}}).then((e)=>{
                                    // refetchList()
                                }).catch((e) => { alert(e) })
                            } startIcon={<DeleteIcon/>}>{t('Delete')}</Button> */}
                            <Button variant="outlined" onClick={() => updateRecommendationConfig({variables: {id}}).then((e)=>{
                                refetch()
                                alert('Recommendation has been set.')
                            }).catch((e) => alert(e))}>{t('Recommend')}</Button>
                            {/* <Button variant="outlined" onClick={() => toggleViz(true)}>{t('Visualization')}</Button> */}
                            <Button variant="outlined" onClick={() => toggleConfig(true)}>{t('Configuration')}</Button>
                            {showConfig ?
                                <ExperimentDatasetConfigurationDialog
                                    id={id}
                                    open={showConfig}
                                    onClose={() => toggleConfig(false)}
                                    />
                                :
                                null
                            }
                            {/* <Button variant="outlined" onClick={() => toggleAugment(true)}>{t('Sampling')}</Button> */}
                        </ButtonGroup>
                        :
                        null
                    }
                </Grid>
                <Grid item>
                    <FormControl variant="outlined" size="small" style={{minWidth: 120}}>
                        <InputLabel size="small" id="demo-simple-select-outlined-label">DATATYPE</InputLabel>
                        <Select
                            size="small"
                            labelId="demo-simple-select-outlined-label"
                            id="demo-simple-select-outlined"
                            value={columnFilterDataType}
                            onChange={e => handleDataType(e.target.value)}
                            label="DATATYPE"
                        >
                            <MenuItem value="">
                                ALL
                            </MenuItem>
                            <MenuItem value={'object'}>OBJECT</MenuItem>
                            <MenuItem value={'int64'}>INT64</MenuItem>
                            <MenuItem value={'float64'}>FLOAT64</MenuItem>
                            <MenuItem value={'datetime64'}>DATETIME64</MenuItem>
                            <MenuItem value={'text'}>TEXT</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        style={{marginLeft: '4px'}}
                        size="small"
                        id="outlined-basic"
                        label="SEARCH BY NAME"
                        variant="outlined"
                        value={columnFilterText}
                        onChange={(e) => handleSearchText(e.target.value)}
                        />
                </Grid>
            </Grid>
        <TableContainer className={classes.container}>
        <Table>
        <TableHead className={classes.thead}>
            <TableRow>
                {fields.map(field => <TableCell className={classes.td} key={field}>{t(field)}</TableCell>)}
            </TableRow>
        </TableHead>
        <TableBody className={classes.tbody}>
            {data && data.dataset ? data.dataset.pagingColumns.map(col => {
                const PropTd = ({ name }) => <TableCell align='right' className={classes.td}>{`${col[name]}`}</TableCell>
                return <TableRow key={col.id}>
                    {/* {fields.map(field => <PropTd key={field} name={field} />)} */}
                    {/* <PropTd name='id' /> */}
                    <TableCell className={classes.td}>
                        <ColumnCheckboxFormControl
                            id={col.id}
                            field={'isFeature'}
                            value={col.isFeature}
                            label=''
                            helptext=''
                            extraFields=''
                            disabled={false}
                            />
                    </TableCell>
                    <TableCell className={classes.td}>{col.name}</TableCell>
                    <TableCell className={classes.td}>
                        <ColumnSelectFormControl
                            id={col.id}
                            field='datatype'
                            value={col.datatype}
                            label=''
                            helptext=''
                            extraFields='availableTransformationStrategy availableImputation imputation transformationStrategy'
                            disabled={false}
                            choices={['FLOAT64', 'INT64', 'OBJECT', 'DATETIME64', 'TEXT']}
                            />
                    </TableCell>
                    <TableCell className={classes.td} align='right'>
                        {col.missing}
                        {col.missingRatio ? `(${col.missingRatio})` : null}
                    </TableCell>
                    <TableCell className={classes.td}>
                        <ColumnSelectFormControl
                            id={col.id}
                            field='imputation'
                            value={col.imputation}
                            label=''
                            helptext=''
                            extraFields=''
                            disabled={col.missing === 0}
                            choices={col.availableImputation}
                            />
                    </TableCell>
                    <TableCell className={classes.td} align='center'>
                        <ColumnCheckboxFormControl
                            id={col.id}
                            field='useOutlier'
                            value={col.useOutlier}
                            label=''
                            helptext=''
                            extraFields=''
                            disabled={col.taskType !== 'continuous'}
                            />
                    </TableCell>
                    <TableCell className={classes.td}>
                        <ColumnSelectFormControl
                            id={col.id}
                            field='transformationStrategy'
                            value={col.transformationStrategy}
                            label=''
                            helptext=''
                            extraFields=''
                            disabled={false}
                            choices={col.availableTransformationStrategy}
                            />
                        {col.transformationStrategy === 'POPULATE_DATETIME_FIELD' || col.transformationStrategy === 'NL_LABELING' || col.transformationStrategy === 'ADD_LAGS'?
                            <Button color="primary" variant="outlined" size="small" onClick={() => setColumnConfig(col)}>config</Button>
                            :
                            null
                        }
                    </TableCell>
                    <PropTd name='mostFrequent' />
                    <PropTd name='unique' />
                    <PropTd name='mean' />
                    <PropTd name='min' />
                    <PropTd name='max' />
                    <TableCell className={classes.td}>
                        <MicroBarChart data={JSON.parse(col.freqJson)}/>
                    </TableCell>
                </TableRow>
            }) : null}
        </TableBody>
        </Table>
        <Box my={2} display="flex" justifyContent="center">
            <Pagination count={pageCount} page={page} onChange={handlePage} showFirstButton showLastButton/>
        </Box>
        {columnConfigDialog}
            {/* {
                dataset.processedDataset ?
                    <ExperimentDatasetColumns id={dataset.processedDataset.id} iteration={iteration ? iteration + 1 : 1}/>
                    :
                    null
            } */}
            {/* <Modal isOpen={datetimeConfig !== null} style={modalStyles} onRequestClose={() => setDatetimeConfig(null)}>
                {datetimeConfig?
                    (datetimeConfig.transformationStrategy === 'POPULATE_DATETIME_FIELD' ?
                    <ModalContent>
                        <ModalHeader title={`Datetime64 Configuration : ${datetimeConfig.name}`}></ModalHeader>
                        <ModalBody>
                            <Datetime64Configuration col={datetimeConfig} dataset={dataset} refetch={refetch}/>
                        </ModalBody>
                    </ModalContent>
                    :
                    datetimeConfig.transformationStrategy === 'ADD_LAGS' ?
                    <ModalContent>
                        <ModalHeader title={`Add Column Lag Configuration : ${datetimeConfig.name}`}></ModalHeader>
                        <ModalBody>
                            <ColumnLagConfiguration id={datetimeConfig.id}/>
                        </ModalBody>
                    </ModalContent>
                    :
                    <ModalContent>
                        <ModalHeader title={`Text Tagging Configuration : ${datetimeConfig.name}`}>
                            <div className='help-text'>
                                {t('about-tagging')}
                            </div>
                        </ModalHeader>
                        <ModalBody>
                            <TextConfiguration col={datetimeConfig} dataset={dataset} refetch={refetch}/>
                        </ModalBody>
                    </ModalContent>
                    )
                    :
                    null
                }
                <div className="footer_popup">
                    <button onClick={()=>setDatetimeConfig(null)} className="btn_close"><span
                    className="ico_automl ico_close">{('Close Popup')}</span></button>
                </div>
            </Modal> */}
        </TableContainer>
        </>
    )
}


function ConfirmationDialogRaw(props) {
    const { onClose, value: valueProp, open, ...other } = props;
    // const [value, setValue] = React.useState(valueProp);
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

const ExperimentDatasetEDA = ({datasetId, targetColumnName}) =>{
    const QUERY_DATASET_EDA = gql`
    query queryDatasetEDA ($datasetId: ID!, $targetColumnName: String) {
      datasetEda(datasetId: $datasetId, targetColumnName: $targetColumnName) {
        __typename
        status
        id
        plotChoices
        visualizedObjects {
            id
            name
            title
            error
            message
            file {
                url
                ext
            }
        }
      }
    }
    `

    const MUTATION_UPDATE_EDA = gql`
    mutation mutate_plots($id: ID!, $input: PatchDatasetEDAInput!) {
        patchDatasetEda(id: $id, input: $input) {
            datasetEda {
                id
                __typename
                plotChoices
                plotChoicesJson
            }
        }
    }
    `

    const MUTATION_REQUEST_EDA = gql`
    mutation requestDatasetEDA ($id: ID!) {
        edaDataset(id: $id) {
            datasetEda {
                __typename
                id
                status
            }
        }
    }
    `

    const MUTATION_CANCEL_EDA = gql`
    mutation requestDatasetEDA ($id: ID!) {
        cancelEdaDataset(id: $id) {
            datasetEda {
                __typename
                id
                status
            }
        }
    }
    `
    const { data, loading, error, stopPolling, startPolling } = useQuery(
        QUERY_DATASET_EDA, { variables: {datasetId, targetColumnName} });
    const [ startEda ] = useMutation(MUTATION_REQUEST_EDA);
    const [ cancelEda ] = useMutation(MUTATION_CANCEL_EDA);
    const [ updateEda ] = useMutation(MUTATION_UPDATE_EDA);
    const [ polling, setPolling ] = React.useState(false);
    const { t } = useTranslation();
    const [open, setOpen] = React.useState(false);
    const classes = useStyles()
    // const [value, setValue] = React.useState('Dione');

    // const handleClickListItem = () => {
    //   setOpen(true);
    // };

    const handleClose = (newValue) => {
        setOpen(false);

        if (newValue) {
            // setValue(newValue);
            updateEda({variables: {
                id: data.datasetEda.id,
                input: {plotChoicesJson: JSON.stringify(newValue)}}})
            .catch((e) => {
                alert(`정상적으로 수행되지 않았습니다. message: ${String(e)}`)
            })
        }
    };
    if (loading) return 'loading..'
    if (error) return String(error)
    if (!loading && !data) return 'nodata'

    if (data && data.datasetEda && data.datasetEda.status) {
        if (data.datasetEda.status === 'CREATED' || data.datasetEda.status === 'DONE' || data.datasetEda.status === 'ERROR') {
            if (polling) {
                stopPolling();
                setPolling(false)
            }
        }
        else {
            if (!polling) {
                startPolling(1000)
                setPolling(true)
            }
        }
    }

    return <Box mt={2} className={classes.container}>
        {polling ?
            <Alert
                action={
                    <Button variant="outlined" color="primary" size="small"
                        onClick={()=>{
                            cancelEda({variables: {id: data.datasetEda.id }}).catch((e) => alert(e))
                        }}
                        disabled={data.datasetEda.status === 'CANCEL_REQUEST'}
                        endIcon={
                            <CircularProgress size="1.0rem" color="secondary" />
                        }
                    >{t('Cancel')}</Button>
                }
            >
                {`Building plots (status - ${data.datasetEda.status}) `}
            </Alert>
            :
            null
        }
        <Box component="div">
        {data.datasetEda.status === 'CREATED' ? <ButtonGroup size='small'>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={()=>{
                        startEda({variables: {id: data.datasetEda.id }}).catch((e) => alert(e))
                    }}
                >{t('Build EDA plots')}</Button>
                <Button variant="outlined" onClick={()=>setOpen(true)} color="primary" endIcon={<SettingsIcon/>}>
                    {t('Configuration')}({data.datasetEda.plotChoices.length}{t('plots')})
                </Button>
            </ButtonGroup>
            :
            null
        }
        {data.datasetEda.status === 'DONE' || data.datasetEda.status === 'ERROR' ?
            <ButtonGroup size="small">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={()=>{
                        startEda({variables: {id: data.datasetEda.id }}).catch((e) => alert(e))
                    }}
                >{t('Rebuild plots')}</Button>
                <Button
                    variant="outlined"
                    onClick={()=>setOpen(true)}
                    color="primary"
                    endIcon={<SettingsIcon/>}>
                    Configuration({data.datasetEda.plotChoices.length} plots)
                </Button>
            </ButtonGroup>
            :
            null
        }
            <ConfirmationDialogRaw
                // classes={{
                //     paper: classes.paper,
                // }}
                id="ringtone-menu"
                keepMounted
                open={open}
                onClose={handleClose}
                value={data.datasetEda.plotChoices}
            />
        </Box>
        {(data.datasetEda.status === 'DONE' || data.datasetEda.status === 'ERROR') && data.datasetEda.visualizedObjects.map(v =>
            <Box component="div" mt={1} mb={1}>
                <Alert severity={v.error ? 'error' : 'info'} variant="outlined">
                    <AlertTitle>{t(v.title)}</AlertTitle>
                    {v.error ?
                        v.message
                        :
                        <>
                            {t('about-' + v.name)}
                            <Grid container justify="flex-end">
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                    component="a"
                                    target="_blank"
                                    href={v.file.url}>{t('Open plot in new tab')}</Button>
                            </Grid>
                            {v.file.ext === 'png' ?
                                <>
                                    <img src={v.file.url} style={{maxWidth: '100%'}} alt={'plot'}/>
                                </>
                            : null}
                            {v.file.ext === 'html' ?
                                <>
                                    <iframe
                                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                        border="0"
                                        title='plot'
                                        style={{borderWidth: '0', maxWidth: '100%'}}
                                        src={v.file.url} width="100%" height="800"/>
                                </>
                            : null}
                        </>
                    }
                </Alert>
            </Box>

        )}
    </Box>
}

export default ({id, status}) => {
    const [datasetView, setDatasetView] = useState('col'); //row, eda
    const {data, error} = useQuery(gql`
    query datasetInfo($id: Int!) {
        dataset(id: $id) {
            id
            __typename
            colCount
            rowCount
            experiment {
                targetColumnName
            }
        }
    }
    `, {variables: {id}})

    let panel = null
    if (datasetView === 'col') {
        panel = <ExperimentDatasetColumns
            id={id}
        />
    }
    else if (datasetView === 'row') {
        panel = <ExperimentDatasetPreview
            id={id}
        />
    }
    else if (datasetView === 'eda' && data && data.dataset) {
        panel = <ExperimentDatasetEDA
            datasetId={id}
            targetColumnName={data.dataset.experiment.targetColumnName}
            />
    }

    return (
        <Card>
        <CardHeader title='DATA SOURCE'
            subheader={<span>{`Dataset uploaded by user`}</span>}
            action={
                data && data.dataset ?
                    <ButtonGroup color="default">
                        <Button disabled={false} variant={datasetView === 'col' ? 'contained' : 'outlined'} onClick={() => setDatasetView('col')}>COLUMN({data.dataset.colCount}) VIEW</Button>
                        <Button disabled={false} variant={datasetView === 'row' ? 'contained' : 'outlined'} onClick={() => setDatasetView('row')}>ROW({data.dataset.rowCount}) VIEW</Button>
                        <Button disabled={false} variant={datasetView === 'eda' ? 'contained' : 'outlined'} onClick={() => setDatasetView('eda')}>EDA PLOT</Button>
                        <Button disabled={true} onClick={() => setDatasetView('clustering')}>CLUSTERING</Button>
                    </ButtonGroup>
                    :
                    null
            }
        />
        <CardContent>
            {error ? <Alert severity='error'>{String(error)}</Alert> : null}
            <Box mt={1}>
                {panel}
            </Box>
        </CardContent>
        </Card>
    )
}
