/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import FieldUpdater from '../utils/FieldUpdater'
import ExperimentDatasetPreview from './ExperimentDatasetPreview'
import ExperimentDatasetColumns from './ExperimentDatasetColumns'
import { gql } from 'apollo-boost';
import { useQuery, useMutation } from 'react-apollo';
import ExperimentDatasetViz from './ExperimentDatasetViz'
import ExperimentDatasetInfo from './ExperimentDatasetInfo'
import Modal from 'react-modal'
import { toastError, toastSuccess, ModalContent, ModalHeader, ModalBody } from '../utils';
import ClassBalancer from "./ClassBalancer";
import Alert from '@material-ui/lab/Alert';
import { Button, Box, ButtonGroup, Grid, TextField } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import { useTranslation } from "react-i18next";
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

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
        # corrJson
        isProcessed
        processedAt
        processingStatus
        useSampler
        samplingSize
        useClassBalancer
        # naColDropThreshold
        # naColDropUse)
        outlierStrategy
        outlierThreshold
        outlierUse
        colTransUse
        imputerUse
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
            # featType
            unique
            missing
            missingRatio
            mean
            min
            max
            mostFrequent
            useOutlier
            transformationStrategy
            availableTransformationStrategy
            freqIdxJson
            freqJson
            taskType
            isFeature
            # isTarget
            datetime64Populate
            datetime64ConvertFormat
            datetime64AsTimestamp
            datetime64ResampleInterpolate
            lagsNumber
            lagsNumber2
            lagsType
            datetime64LagsTargetCols
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

const ExperimentDatasetConfiguration = ({dataset, refetch, onRequestClose}) => {
    const { t } = useTranslation();
    const FieldUpdaterWrapper = (props) => (
        <div className="item_dl type_inline">
            <dt>{props.children}</dt>
            <dd><FieldUpdater {...props}/></dd>
        </div>
    )
    return (
        <ModalContent>
            <ModalHeader title={t('Preprocess Configuration')}/>
            <ModalBody>
                <div className="list_evaluation">
                    <FieldUpdaterWrapper type='checkbox' showLabel={false} path={`/datasets/${dataset.id}/`} onLoad={() => refetch()} field='outlierUse' value={dataset.outlierUse}>{t('Remove Outlier')}</FieldUpdaterWrapper>

                    {dataset.outlierUse ? <Box mt={1}>
                            <Alert severity="info">아래 설정은 이상치 제거 수행예정인 전체 컬럼에 대해서 일괄로 적용됩니다.</Alert>
                            <Box p={2} mt={0} style={{border: '1px solid #eeeeee'}}>
                                <FieldUpdaterWrapper path={`/datasets/${dataset.id}/`} onLoad={() => refetch()} field='outlierThreshold' options={[0.2, 0.4, 0.6, 0.8]} value={dataset.outlierThreshold}>{t('outlierThreshold')}</FieldUpdaterWrapper>
                                <FieldUpdaterWrapper path={`/datasets/${dataset.id}/`} onLoad={() => refetch()} field='outlierStrategy' options={['BOX_PLOT_RULE', 'Z_SCORE']} value={dataset.outlierStrategy}>{t('outlierStrategy')}</FieldUpdaterWrapper>
                            </Box>
                        </Box>
                        :
                        null
                    }
                    <hr/>
                    <FieldUpdaterWrapper type='checkbox' showLabel={false} path={`/datasets/${dataset.id}/`} onLoad={() => refetch()} field='imputerUse' value={dataset.imputerUse}>{t('Use N/A imputer')}</FieldUpdaterWrapper>
                    <FieldUpdaterWrapper type='checkbox' showLabel={false} path={`/datasets/${dataset.id}/`} onLoad={() => refetch()} field='colTransUse' value={dataset.colTransUse}>{t('Use Transformer')}</FieldUpdaterWrapper>
                </div>
            </ModalBody>
            <div className="footer_popup">
                <button className="btn_close" onClick={onRequestClose}><span className="ico_automl ico_close">{t('Close Popup')}</span></button>
            </div>
        </ModalContent>
    )
}



export default ({id, refetchList, subheadingMsg, subPanel, isFirst}) => {
    const { t } = useTranslation();
    const [columnPage, setColumnPage] = React.useState(1);
    const columnFirst = process.env.REACT_APP_EX_ROW_COUNT;
    const [columnSkip, setColumnSkip] = useState(0);
    const [columnFilterText, setColumnFilterText] = useState(null)
    const [columnPageCount, setColumnPageCount] = useState(1);
    const [columnFilterDataType, setColumnFilterDataType] = useState(null);

    const {data, loading, error, refetch} = useQuery(QUERY_DATASET_COLUMNS, {
        variables: {id, first: columnFirst, skip: columnSkip, search: columnFilterText, datatype: columnFilterDataType}
    })

    useEffect(() => {
        if (data) {
            setColumnPageCount(Math.ceil(data.dataset.pagingCount/ process.env.REACT_APP_EX_ROW_COUNT));
          }
    }, [data]);

    const handleColumnPage = (event, value) => {
        setColumnPage(value);
        setColumnSkip((value - 1) * process.env.REACT_APP_EX_ROW_COUNT);
    };

    const handleDataType = (value) => {
        setColumnFilterDataType(value);
        setColumnPage(1);
        setColumnSkip(0);
    };

    const handleSearchText = (value) => {
        setColumnFilterText(value);
        setColumnPage(1);
        setColumnSkip(0);
    };


    const [updateRecommendationConfig] = useMutation(gql`mutation patchRecmdConfig($id:ID!) {
        patchRecommendationConfig (id: $id) {
            dataset {
                id
                processingStatus
            }
        }
    }`)
    const [unlinkDataset] = useMutation(gql`mutation unlinkDataset($id: ID! ) {
        unlinkDataset(id: $id) {
            ok
            errorMessage
        }
    }`)
    const [showConfig, toggleConfig] = useState(false)
    const [showViz, toggleViz] = useState(false)
    const [showInfo, toggleInfo] = useState(false)

    useEffect(() => {
        refetch()
    }, [refetch])

    if (!data && loading) return 'loading..'
    if (error) return String(error)

    return (
        <Box component="div">
            {data.dataset && data.dataset.processingStatus === 'ERROR' ?
                <Box mt={2} mb={2}><Alert
                    severity="error"
                    // action={<Button size="small" variant="outlined" color="primary" onClick={() => toggleInfo(!showInfo)}>{t('Show details')}</Button>}
                    >
                    {t('fail-preprocess')}
                    (message: {data.dataset.lastError})
                </Alert>
                    </Box>
                :
                data.dataset && data.dataset.isProcessed ?
                    <Box mt={2} mb={2}><Alert
                        severity="info"
                        // action={<Button size="small" variant="outlined" color="primary" onClick={() => toggleInfo(!showInfo)}>{t('Show details')}</Button>}
                        >
                        {t('done-preprocess')}
                    </Alert>
                        </Box>
                    :
                    <Box mt={2} mb={2}><Alert
                        severity="warning"
                        // action={<Button size="small" variant="outlined" color="primary" onClick={() => toggleInfo(!showInfo)}>{t('Show details')}</Button>}
                        >
                        {t('waiting-preprocess')}
                    </Alert>
                        </Box>
            }
            {data.dataset && data.dataset.preprocessorInfo && showInfo ?
                <div className="area_scroll">
                    <ExperimentDatasetInfo preprocessorInfo={JSON.parse(data.dataset.preprocessorInfo)}/>
                </div>
                :
                null
            }
            <Grid container justify="space-between">
                <Grid item>
                    <ButtonGroup variant="outlined" aria-label="preprocessor button groups">
                        <Button variant="outlined" component="a" href={data.dataset.source.file.url} startIcon={<SaveIcon/>}>
                            {t('Export')}
                            <Box component="span" color="gray">({data.dataset.source.file.sizeHumanized})</Box>
                        </Button>
                        {isFirst ? null
                            :
                            <Button variant="outlined" onClick={
                                () => unlinkDataset({variables: {id}}).then((e)=>{
                                    refetchList()
                                }).catch((e) => { toastError(e) })
                            } startIcon={<DeleteIcon/>}>{t('Delete')}</Button>
                        }
                        <Button variant="outlined" onClick={() => updateRecommendationConfig({variables: {id}}).then((e)=>{
                            refetch()
                            toastSuccess('Recommendation has been set.')
                        }).catch((e) => toastError(e))}>{t('Recommend')}</Button>
                        {/* <Button variant="outlined" onClick={() => toggleViz(true)}>{t('Visualization')}</Button> */}
                        <Button variant="outlined" onClick={() => toggleConfig(true)}>{t('Configuration')}</Button>
                    </ButtonGroup>
                </Grid>
                <Grid item>
                {
                    subPanel === 'column' ? <>
                        <FormControl variant="outlined" size="small" style={{minWidth: 120}}>
                            <InputLabel size="small" id="demo-simple-select-outlined-label">DataType</InputLabel>
                            <Select
                                size="small"
                            labelId="demo-simple-select-outlined-label"
                            id="demo-simple-select-outlined"
                            value={columnFilterDataType}
                            onChange={e => handleDataType(e.target.value)}
                            label="DataType"
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
                        </>
                        :
                        <Button >{data.dataset.rowCount} Rows, {data.dataset.colCount} Columns</Button>
                }
                </Grid>
            </Grid>

            {data && data.dataset ?
                <div className="area_scroll">
                    {
                        subPanel === 'column' ?
                            <ExperimentDatasetColumns
                                pageCount={columnPageCount}
                                handlePage={handleColumnPage}
                                page={columnPage}
                                dataset={data.dataset}
                                refetch={refetch}/>
                            :
                            <ExperimentDatasetPreview id={id}/>
                    }
                </div>
                :
                null
            }

            <Modal isOpen={showViz} style={modalStyles} onRequestClose={() => toggleViz(false)}>
                <ExperimentDatasetViz id={id} onRequestClose={() => toggleViz(false)}/>
            </Modal>
            <Modal isOpen={showConfig} style={modalStyles} onRequestClose={() => toggleConfig(false)}>
                <ExperimentDatasetConfiguration dataset={data.dataset} refetch={refetch} onRequestClose={() => toggleConfig(false)}/>
            </Modal>

        </Box>
    )
}
