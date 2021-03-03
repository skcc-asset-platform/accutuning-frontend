/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import MicroBarChart from 'react-micro-bar-chart'
import FieldUpdater from '../utils/FieldUpdater'
import Modal from 'react-modal';
import { ModalContent, ModalHeader, ModalBody } from '../utils'
import { gql } from 'apollo-boost';
import { useQuery, useMutation } from 'react-apollo';
import TextConfiguration from './TextConfiguration'
import { Button, Box } from "@material-ui/core";
import Slider from '@material-ui/core/Slider';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { useTranslation } from "react-i18next";
import Alert from '@material-ui/lab/Alert';
import Pagination from '@material-ui/lab/Pagination';
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


const Datetime64Configuration = ({col, dataset, refetch}) => {
    return (
        <ul>
            <li>
                format:
                <FieldUpdater onLoad={() => refetch({id: dataset.id})}
                        showLabel={false}
                        type='text'
                        path={`/datasets/${dataset.id}/columns/${col.id}/`}
                        field='datetime64ConvertFormat' value={col.datetime64ConvertFormat}/>
            </li>
            <li>
                <label>populate features:
                    <FieldUpdater onLoad={() => refetch({id: dataset.id})}
                        showLabel={false}
                        type='checkbox'
                        path={`/datasets/${dataset.id}/columns/${col.id}/`}
                        field='datetime64Populate' value={col.datetime64Populate}/>
                    </label>
            </li>
            <li>
                <label>convert as number(timestamp):
                    <FieldUpdater onLoad={() => refetch({id: dataset.id})}
                            showLabel={false}
                            type='checkbox'
                            path={`/datasets/${dataset.id}/columns/${col.id}/`}
                            field='datetime64AsTimestamp' value={col.datetime64AsTimestamp}/>
                </label>
            </li>
        </ul>
    )
}


const ColumnLagConfiguration = ({id}) => {
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
        <>
        <Box mb={5}>
            <Alert severity="warning">
                전처리 후 미리보기에서 변환된 결과 데이터를 확인하세요.
                <br/>
                오름차순으로 정렬되어 있는 시계열 데이터 기준으로 볼 때 -는 과거의 데이터이고, +는 미래의 데이터입니다
            </Alert>
            </Box>
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
        </>
    )
}


export default ({pageCount, handlePage, page, dataset, refetch, isFirst}) => {
    const { t } = useTranslation();
    const [datetimeConfig, setDatetimeConfig] = useState(null);
    // const [getColumn, { loading, data }] = useLazyQuery(QUERY_SINGLE_COLUMN);
    const id = dataset.id;
    let fields = [
        // 'id',
        // 'idx',
        'Name',
        'Datatype',
        'Missing',
        // 'taskType',
    ];
    if (dataset.imputerUse) {
        fields.push('Imputation')
    }

    if (dataset.outlierUse) {
        fields.push('Remove Outlier')
    }

    if (dataset.colTransUse) {
        fields.push('Transform')
    }



    fields = fields.concat([
        // 'imputation',
        // 'useOutlier',
        // 'transformationStrategy',
        // 'featType',

        'Most Frequent',
        'Unique',
        'Mean',
        'Min',
        'Max',
        // 'isFeature', 'isTarget',
    ]);

    return (
        <>
        <table className="tbl_g">
        <thead>
            <tr>
                <th>{t('Use')}</th>
                {fields.map(field => <th key={field}>{t(field)}</th>)}
                {/* <th>useTagger</th> */}
                <th>{t('Distribution')}</th>

                {/* <th>isTarget</th> */}
                {/* <th>selected</th> */}
            </tr>
        </thead>
        <tbody>
            {dataset ? dataset.pagingColumns.map(col => {
                const PropTd = ({ name }) => <td>{`${col[name]}`}</td>
                return <tr key={col.id}>
                    {/* {fields.map(field => <PropTd key={field} name={field} />)} */}
                    {/* <PropTd name='id' /> */}
                    <td>
                        <FieldUpdater
                            onLoad={() => refetch({id: dataset.id})}
                            // onLoad={() => getColumn({ fetchPolicy: 'network-only', variables: { id: col.id }})}
                            path={`/datasets/${id}/columns/${col.id}/`}
                            // onLoad={() => dispatch(actions.refreshColumn(experimentPk, col.id))}
                            type='checkbox'
                            showLabel={false}
                            field='isFeature' value={col.isFeature} />
                    </td>
                    {/*<PropTd name='idx' />*/}
                    <td style={{textAlign: 'left'}}>{col.name}</td>
                    {/* <PropTd name='datatype' /> */}
                    <td>
                        <FieldUpdater
                            onLoad={() => refetch({id: dataset.id})}
                            // onLoad={(resp) => {
                            //     console.log(resp)
                            //     getColumn({ fetchPolicy: 'network-only', variables: { id: col.id }})
                            // }}
                            showLabel={false}
                            path={`/datasets/${id}/columns/${col.id}/`}
                            field='datatype'
                            value={col.datatype.toLowerCase()}
                            />
                    </td>
                    <td>
                        {col.missing}
                        {col.missingRatio ? `(${col.missingRatio})` : null}
                    </td>
                    {/* <PropTd name='taskType' /> */}
                    {/* <PropTd name='useOutlier' /> */}
                    {dataset.imputerUse ?
                        <td>
                            <FieldUpdater
                                onLoad={() => refetch({id: dataset.id})}
                                // onLoad={() => getColumn({ fetchPolicy: 'network-only', variables: { id: col.id }})}
                                disabled={col.missing === 0}
                                showLabel={false}
                                path={`/datasets/${id}/columns/${col.id}/`}
                                field='imputation'
                                options={col.availableImputation}
                                value={col.imputation}/>
                        </td>
                        :
                        null
                    }
                    {dataset.outlierUse ?
                        <td>
                            {col.taskType === 'continuous' ?
                                <FieldUpdater
                                    onLoad={() => refetch({id: dataset.id})}
                                    // onLoad={() => getColumn({ fetchPolicy: 'network-only', variables: { id: col.id }})}
                                    type='checkbox'
                                    path={`/datasets/${id}/columns/${col.id}/`}
                                    field='useOutlier'
                                    showLabel={false}
                                    value={col.useOutlier}/>
                                :
                                null
                            }
                        </td>
                        :
                        null
                    }
                    {/* <PropTd name='transformationStrategy' /> */}
                    {dataset.colTransUse ?
                        <td style={{textAlign: 'left'}}>
                            <FieldUpdater
                                onLoad={() => refetch({id: dataset.id})}
                                // onLoad={(r) => {
                                //     console.log(r)
                                //     getColumn({ fetchPolicy: 'network-only', variables: { id: col.id }})
                                // }}
                                showLabel={false}
                                path={`/datasets/${id}/columns/${col.id}/`}
                                field='transformationStrategy'
                                options={col.availableTransformationStrategy}
                                value={col.transformationStrategy}/>
                            {col.transformationStrategy === 'POPULATE_DATETIME_FIELD' || col.transformationStrategy === 'NL_LABELING' || col.transformationStrategy === 'ADD_LAGS'?
                                <Button color="primary" variant="outlined" size="small" onClick={() => setDatetimeConfig(col)}>config</Button>
                                :
                                null
                            }
                        </td>
                        :
                        null
                    }
                    {/* <PropTd name='imputation' /> */}

                    {/* <PropTd name='featType' /> */}
                    {/* <td><FieldUpdater onLoad={() => refetch({id: dataset.id})} showLabel={false} path={`/datasets/${id}/columns/${col.id}/`} field='featType' value={col.featType}/></td> */}
                    <PropTd name='mostFrequent' />
                    <PropTd name='unique' />
                    <PropTd name='mean' />
                    <PropTd name='min' />
                    <PropTd name='max' />
                    {/* <td>
                        <FieldUpdater onLoad={() => refetch({id: dataset.id})} path={`/datasets/${id}/columns/${col.id}/`}
                            // onLoad={() => dispatch(actions.refreshColumn(experimentPk, col.id))}
                            type='checkbox'
                            field='useTagger' value={col.useTagger} />
                        { col.useTagger ? <button>conf.</button> : null }
                    </td> */}
                    <td>
                        <MicroBarChart data={JSON.parse(col.freqJson)}/>
                    </td>
                    {/* <td>
                        <FieldUpdater onLoad={() => refetch({id: dataset.id})} path={`/datasets/${id}/columns/${col.id}/`}
                            // onLoad={() => dispatch(actions.refreshColumn(experimentPk, col.id))}
                            type='checkbox'
                            field='isTarget' value={col.isTarget} />
                    </td> */}
                    {/* <td><a href='javascript:;' onClick={() => {}}>select</a></td> */}
                </tr>
            }) : null}
        </tbody>
        </table>
        <Box my={2} display="flex" justifyContent="center">
            <Pagination count={pageCount} page={page} onChange={handlePage} showFirstButton showLastButton/>
        </Box>
            {/* {
                dataset.processedDataset ?
                    <ExperimentDatasetColumns id={dataset.processedDataset.id} iteration={iteration ? iteration + 1 : 1}/>
                    :
                    null
            } */}
            <Modal isOpen={datetimeConfig !== null} style={modalStyles} onRequestClose={() => setDatetimeConfig(null)}>
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
            </Modal>
        </>
    )
}