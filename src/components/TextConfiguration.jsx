import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-apollo';
import FieldUpdater from '../utils/FieldUpdater'
import Spinner from '../utils/Spinner'
import { gql } from 'apollo-boost';
import { Button, ButtonGroup, Box, Card, CardContent, Chip, Grid } from "@material-ui/core";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import { Alert, AlertTitle } from '@material-ui/lab';
import { useTranslation } from "react-i18next";

const QUERY_TEXT_ROWS = gql`
query queryTextRow($id:Int!, $page:Int, $picked:Boolean)  {
    textRows(id: $id, page: $page, picked: $picked) {
        page
        pages
        hasNext
        hasPrev
        objects {
            text
            tag
            picked
            id
            __typename
        }
    }
    textRowsStat(id: $id, picked: $picked) {
        tag
        cnt
    }
}
`


const QUERY_PROCESS_AND_NL = gql`
query queryTagtextProcess($experimentTarget: Int!, $experimentProcessType: String) {
    experimentProcess(experimentTarget: $experimentTarget, experimentProcessType: $experimentProcessType) {
        id
        experimentTarget
        experimentProcessType
        finishedAt
        startedAt
        error
        errorMessage
    }
    labeling(id: $experimentTarget) {
        id
        textLoaded
        buildTagStatus
        buildTagStatusPct
        textUseTagger
        textFewshotCount
        textProcessingAlStep
        textProcessingAlUse
        textProcessingStep
        textUserExpectedClsCount
        textClusterMethod
        textClusterN
        textUseTagFeature
        textUseVectorFeatures
        freqJson
        metrics {
            name
            value
        }
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


const TextTagStat = ({data}) => {
    return <div>
            {data.map(r => <Chip key={r.tag} label={`${r.tag}(${r.cnt})`}/>)}
    </div>
}


const TextTagResult = ({labeling}) => {
    // const [picked, setPicked] = useState(false);
    const [page, setPage] = useState(1);
    const {data, loading, error} = useQuery(QUERY_TEXT_ROWS, {
        variables: {id: labeling.id, picked: false, page},
        fetchPolicy: 'no-cache'
    })
    const { t } = useTranslation();

    if (!data && loading) return 'loading'
    if (error) return String(error)

    if (!(labeling && labeling.buildTagStatus === 'DONE')) {
        // return <span style={{color: 'gray'}}>{`status: ${labeling && labeling.buildTagStatus || '-'}`}</span>
        return null
    }

    if (!(data && data.textRows)) {
        return 'no-data'
    }

    return (
        <>
            <h4 style={{marginTop: '30px'}}>{t('Clustering Tags')}</h4>
            <TextTagStat data={data.textRowsStat}/>

            <h4 style={{marginTop: '30px'}}>{t('Clustering Details')}</h4>
            <div style={{textAlign:"center"}}>
                <ButtonGroup>
                    <Button disabled={!data.textRows.hasPrev} onClick={() => setPage(page-1)}>Prev</Button>
                    <Button disabled={true}>{`${data.textRows.page} / ${data.textRows.pages}`}</Button>
                    <Button disabled={!data.textRows.hasNext} onClick={() => setPage(page+1)}>Next</Button>
                </ButtonGroup>
            </div>
            <table style={{width: '100%'}} className='tbl_g'>
                <thead>
                    <tr>
                        <th>{t('text')}</th>
                        <th style={{minWidth: '400px'}}>{t('tag')}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.textRows.objects.map(row => (
                        <tr key={row.id}>
                            <td>{row.text}</td>
                            <td>{row.tag}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{textAlign:"center"}}>
                <ButtonGroup>
                    <Button disabled={!data.textRows.hasPrev} onClick={() => setPage(page-1)}>Prev</Button>
                    <Button disabled={true}>{`${data.textRows.page} / ${data.textRows.pages}`}</Button>
                    <Button disabled={!data.textRows.hasNext} onClick={() => setPage(page+1)}>Next</Button>
                </ButtonGroup>
            </div>

        </>
    )
}


const TextRowDetail = ({labeling, startPolling, dataset_id}) => {
    const [picked, setPicked] = useState(true);
    const [page, setPage] = useState(1);
    const {data, loading, error, refetch} = useQuery(QUERY_TEXT_ROWS, {
        variables: {id: labeling.id, picked, page},
        fetchPolicy: 'no-cache'
    })
    const { t } = useTranslation();
    const [label] = useMutation(gql`
    mutation labelText($id: ID!) {
      labelText(id: $id, activeLearn: true) {
        labeling {
          id
          buildTagStatus
          __typename
        }
      }
    }
    `);
    if (loading) return 'loading'
    if (error) return String(error)

    if (!(labeling && labeling.buildTagStatus === 'DONE')) {
        return `WORKING (status: ${labeling && labeling.buildTagStatus ? labeling.buildTagStatus : '-'})`
    }

    if (!(data && data.textRows)) {
        return 'no-data'
    }

    return (
        <>
            <h4 style={{marginTop: '30px'}}>{t('Clustering Tags')}</h4>
            <TextTagStat data={data.textRowsStat}/>

            <h4 style={{marginTop: '30px'}}>{t('Clustering Details')}</h4>
            {labeling.textProcessingAlStep > 0 ?
                <div className='alert alert-warning'>
                <div style={{float: 'right'}}>
                    <ButtonGroup>
                        <Button onClick={()=> setPicked(true)}>{t('Show picked')}</Button>
                        <Button onClick={() => setPicked(false)}>{t('Show all')}</Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={()=>{
                                label({variables: {id: labeling.id}}).then(() => {
                                    startPolling(3000);
                                })
                            }}>{t('Start active-learn labeling')}
                        </Button>
                    </ButtonGroup>
                </div>
                <b>{t('Text and Tag correction - No. ')}{labeling.textProcessingAlStep}</b>
                <div>
                    {picked ?
                        'You can correct or newly enter the labeling results of these data.'
                        :
                        'You can review the first tagging results and improve them by entering the proper labeling results.'
                    }
                </div>
                </div>
                :
                <div className='alert alert-info' style={{marginTop: '0px'}}>
                <b>{t('Text and Tag correction - No. ')}{labeling.textProcessingAlStep}</b>
                <div>
                    {t('User can improve the automatically tagged results by correcting them')}
                </div>
                </div>
            }

            <table style={{width: '100%'}} className='tbl_g'>
                <thead>
                    <tr>
                        <th>{t('picked')}</th>
                        <th>{t('text')}</th>
                        <th style={{minWidth: '400px'}}>{t('tag')}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.textRows.objects.map(row => (
                        <tr key={row.id}>
                            <td><FieldUpdater onLoad={() => refetch()}
                                showLabel={false}
                                type='checkbox'
                                path={`/textrows/${row.id}/`}
                                field='picked' value={row.picked}/></td>
                            <td>
                                {/* <FieldUpdater onLoad={() => refetch()}
                                showLabel={false}
                                type='text'
                                path={`/textrows/${row.id}/`}
                                field='text' value={row.text}/> */}
                                {row.text}
                            </td>
                            <td><FieldUpdater onLoad={() => refetch()}
                                showLabel={false}
                                type='text'
                                path={`/textrows/${row.id}/`}
                                field='tag' value={row.tag}/></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{textAlign:"center"}}>
                <Button disabled={!data.textRows.hasPrev} onClick={() => setPage(page-1)}>Prev</Button>
                <Button disabled={true}>{`${data.textRows.page} / ${data.textRows.pages}`}</Button>
                <Button disabled={!data.textRows.hasNext} onClick={() => setPage(page+1)}>Next</Button>
            </div>

        </>
    )
}


const StatusIndicator = ({data}) => {
    const { t } = useTranslation();

    if (data && data.experimentProcess && data.experimentProcess.errorMessage) {
        return <Box mb={4}><Alert severity="error">
        <AlertTitle>{t('Error')}</AlertTitle>
        {data.experimentProcess.errorMessage}
        </Alert></Box>
    }

    return data && data.experimentProcess
        ?
        <Box mb={4}><Alert severity="info">
        <AlertTitle>
            Labeling({
                data.labeling.textProcessingAlStep > 0 ?
                    'few-shot'
                    :
                    'zero-shot'
            }) {t('is on progress')}</AlertTitle>
            {
                data.labeling.textProcessingStep === 'LOADING' ?
                    <u><Spinner/>loading</u>
                    :
                    "loading"
            }
            {' - '}
            {
                data.labeling.textProcessingStep === 'VECTORIZING' ?
                    <u><Spinner/>vectorizing</u>
                    :
                    "vectorizing"
            }
            {' - '}
            {
                data.labeling.textProcessingStep === 'CLUSTERING' ?
                    <u><Spinner/>clustering</u>
                    :
                    "clustering"
            }
            {' - '}
            {
                data.labeling.textProcessingStep === 'LABELING' ?
                    <u><Spinner/>{t('labeling')}</u>
                    :
                    "labeling"
            }
            {
                data.labeling.textProcessingAlUse  ?
                <>
                    {' - '}
                    {
                        data.labeling.textProcessingStep === 'VECTORIZING4AL' ?
                            <u><Spinner/>vectorizing(2)</u>
                            :
                            "vectorizing(2)"
                    }
                    {' - '}
                    {
                        data.labeling.textProcessingStep === 'ALING' ?
                            <u><Spinner/>learning</u>
                            :
                            "learning"
                    }
                </>
                :
                null
            }
            {' - '}
            {
                data.labeling.textProcessingStep === 'PLOTTING' ?
                    <u><Spinner/>plotting</u>
                    :
                    "plotting"
            }
            {' - '}
            {
                data.labeling.textProcessingStep === 'FINISH' ?
                    <u>finish</u>
                    :
                    "finish"
            }
        </Alert></Box>
        :
        null
}


const ZeroShotConfiguration = ({data, refetch, dataset_id, col_id, startPolling}) => {
    const disabled = data && data.labeling && (
        data.labeling.buildTagStatus === 'PROCESSING' ||
        data.labeling.buildTagStatus === 'REQUEST'
    )
    const { t } = useTranslation();
    const [label] = useMutation(gql`
    mutation labelText($id: ID!) {
      labelText(id: $id, activeLearn: false) {
        labeling {
          id
          buildTagStatus
          __typename
        }
      }
    }
  `);
    const [clear] = useMutation(gql`
    mutation resetLabeling($id: ID!) {
    clearLabelingText(id: $id) {
        labeling {
        id
        buildTagStatus
        __typename
        }
    }
    }
    `);

    return data && data.labeling ? <>
        <table className="tbl_g" style={{marginTop: 0}}>
            <tbody>
                <tr>
                    <td>Status</td>
                    <td>{data.labeling.buildTagStatus}</td>
                </tr>
                <tr>
                    <td>Actions</td>
                    <td>
                        <ButtonGroup>
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={disabled}
                                onClick={()=>{
                                    label({variables: {id: col_id}}).then(() => {
                                        startPolling(3000);
                                    })
                                }}>{t(`Start labeling`)}
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                disabled={disabled}
                                onClick={()=>{
                                    clear({variables: {id: col_id}});
                                }}
                            >
                                {t('Clear label data')}
                            </Button>
                        </ButtonGroup>
                    </td>
                </tr>
                <tr>
                    <td>{t('n_clusters')}</td>
                    <td>
                        <FieldUpdater onLoad={() => refetch()}
                            showLabel={false}
                            options={[2,3,4,5,6,7,8,9,10]}
                            path={`/datasets/${dataset_id}/labelings/${col_id}/`}
                            field='textClusterN' value={data.labeling.textClusterN}/>
                        {/* <span className='help-text'>
                            분류개수
                        </span> */}
                    </td>
                </tr>
                {/* <tr>
                    <td>{t('cluster-method')}</td>
                    <td>
                        <FieldUpdater onLoad={() => refetch()}
                            showLabel={false}
                            type='select'
                            path={`/datasets/${dataset_id}/labelings/${col_id}/`}
                            field='textClusterMethod'
                            value={data.labeling.textClusterMethod}/>
                        <span className='help-text'>
                            분류방법{data.labeling.textClusterMethod}
                        </span>
                    </td>
                </tr> */}
            </tbody>
        </table>
        {/* textProcessingAlUse: {String(data.labeling.textProcessingAlUse)} */}
        {/* textProcessingStep: {data.labeling.textProcessingStep} */}
        {data && data.labeling && !data.labeling.textProcessingAlUse && data.labeling.textProcessingStep === 'FINISH' ?
            <TextTagResult labeling={data.labeling} />
            :
            null
        }
        </>
        :
        null
}


const FewShotConfiguration = ({data, refetch, dataset_id, col_id, startPolling}) => {
    const disabled = data && data.labeling && (
        data.labeling.buildTagStatus === 'PROCESSING' ||
        data.labeling.buildTagStatus === 'REQUEST'
    )
    const { t } = useTranslation();
    const [label] = useMutation(gql`
    mutation labelText($id: ID!) {
      labelText(id: $id, activeLearn: true) {
        labeling {
          id
          buildTagStatus
          __typename
        }
      }
    }
    `);
    return data && data.labeling ? (
        <>
        {data.labeling.textProcessingAlStep === 0 ?
            <>
            <div className='help-text'>
                {t('Improve results with your annotation.')}
            </div>
            <table className="tbl_g" style={{marginTop: 0}}>
                <tbody>
                    <tr>
                        <td>Actions</td>
                        <td>
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={disabled}
                                onClick={()=>{
                                    label({variables: {id: col_id}}).then(() => {
                                        startPolling(3000);
                                    })
                                }}>{t(`Start active-learn labeling`)}
                            </Button>
                            {/* <MutateAction
                                verb='post'
                                disabled={disabled}
                                className="btn btn-primary btn-sm"
                                path={`/datasets/${dataset_id}/labelings/${col_id}/build_tag/`}
                                onLoad={()=>{refetch(); startPolling(3000)}}>Start active-learn labeling</MutateAction> */}
                        </td>
                    </tr>
                    {/* <tr>
                        <td>클래스 분류 개수</td>
                        <td>
                            <FieldUpdater onLoad={() => refetch()}
                                showLabel={false}
                                options={[2, 3, 4, 5, 6, 7, 8]}
                                path={`/datasets/${dataset_id}/labelings/${col_id}/`}
                                field='textUserExpectedClsCount' value={data.labeling.textUserExpectedClsCount}/>
                        </td>
                    </tr> */}
                    {/* <tr>
                        <td>N-shot</td>
                        <td>
                            <FieldUpdater onLoad={() => refetch()}
                                showLabel={false}
                                options={[4, 5, 6, 7, 8]}
                                path={`/datasets/${dataset_id}/labelings/${col_id}/`}
                                field='textFewshotCount' value={data.labeling.textFewshotCount}/>
                        </td>
                    </tr> */}
                </tbody>
            </table>
            </>
            :
            <TextRowDetail labeling={data.labeling} dataset_id={dataset_id} startPolling={startPolling}/>
        }
        </>
    )
    :
    null
}

export default ({col, dataset}) => {
    const { t } = useTranslation();
    const [panel, setPanel] = useState('zero')
    const {data, refetch, startPolling, stopPolling} = useQuery(
        QUERY_PROCESS_AND_NL,
        {
            variables: {
                experimentTarget: col.id,
                experimentProcessType: 'tagtext',
            }
        }
    )

    const handleChange = (event, newValue) => {
        setPanel(newValue);
    };

    if (data && data.experimentProcess) {
        if (data.experimentProcess.finishedAt) {
            stopPolling();
            refetch()
            // alert('stop')
        }
        else {
            startPolling(3000)
        }
    }

    return (
        <>
            {/* {data && data.labeling ? <MicroBarChart data={JSON.parse(data.labeling.freqJson)}/> : null} */}
            <StatusIndicator data={data}/>
            <AppBar position="static" color="default">
                <Tabs
                    value={panel}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab label="Zero-shot" value="zero"/>
                    <Tab label="Few-shot" value="few"/>
                    <Tab label="Review" value="review"/>
                </Tabs>
            </AppBar>
            <Card>
                <CardContent>
                {panel === 'zero' ?
                    <ZeroShotConfiguration
                        data={data}
                        refetch={refetch}
                        dataset_id={dataset.id}
                        col_id={col.id}
                        startPolling={startPolling}/>
                    :
                    null
                }
                {panel === 'few' ?
                    <FewShotConfiguration
                        data={data}
                        refetch={refetch}
                        dataset_id={dataset.id}
                        col_id={col.id}
                        startPolling={startPolling}/>
                    :
                    null
                }
                {panel === 'table' ?
                    <>
                        {data && data.labeling && !data.labeling.textProcessingAlUse ?
                            <TextTagResult labeling={data.labeling} />
                            :
                            null
                        }
                        {data && data.labeling && data.labeling.textProcessingAlStep > 0 ?
                            <TextRowDetail labeling={data.labeling} dataset_id={dataset.id} startPolling={startPolling}/>
                            :
                            null
                        }
                    </>
                    :
                    null
                }
                {panel === 'review' ?
                    <div>
                        <table className="tbl_g">
                            <tbody>
                                <tr>
                                    <td>{t('Add labeled info.(tags) to new features')}</td>
                                    <td>
                                    <FieldUpdater onLoad={() => refetch()}
                                        showLabel={false}
                                        type='checkbox'
                                        disabled={true}
                                        // path={`/textrows/${row.id}/`}
                                        path={`/datasets/${dataset.id}/labelings/${col.id}/`}
                                        field='textUseTagFeature'
                                        value={data.labeling.textUseTagFeature}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        {t('Add text-vector to new features')}
                                    </td>
                                    <td>
                                    <FieldUpdater onLoad={() => refetch()}
                                        showLabel={false}
                                        type='checkbox'
                                        field='textUseVectorFeatures'
                                        path={`/datasets/${dataset.id}/labelings/${col.id}/`}
                                        value={data.labeling.textUseVectorFeatures}/>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <h4 style={{marginTop: '30px', marginBottom: '15px'}}>{t('Metrics')}</h4>
                        <div>
                            <table className="tbl_g">
                                <tbody>
                            {data && data.labeling && data.labeling.metrics ?
                                data.labeling.metrics.map((metric) => (
                                    <tr>
                                        <td>{metric.name}</td>
                                        <td>{metric.value}</td>
                                    </tr>
                                ))
                                :
                                null
                            }
                                </tbody>
                            </table>
                        </div>

                        <h4 style={{marginTop: '30px', marginBottom: '15px'}}>{t('Clustering visualization')}</h4>
                        <div>
                            {/* {data && data.labeling && data.labeling.visualizedObjects ?
                                data.labeling.visualizedObjects.map((vo, idx) => (
                                    <Button disabled={showIndex === idx} key={idx} onClick={() => setShowIndex(idx)}>
                                        {vo.title}
                                    </Button>
                                ))
                                :
                                null
                            }
                            {data && data.labeling && data.labeling.visualizedObjects ?
                                data.labeling.visualizedObjects.map((vo, idx) => (showIndex === idx ?
                                    <div className="txt_c" key={idx}><img alt={vo.title} src={vo.img} width={600}/></div> : null))
                                :
                                null
                            } */}
                            {data.labeling.visualizedObjects.map(v =>
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
                                                        <img src={v.file.url} alt={'plot'}/>
                                                    </>
                                                : null}
                                                {v.file.ext === 'html' ?
                                                    <>
                                                        <iframe
                                                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                                            border="0"
                                                            title={'plot'}
                                                            style={{borderWidth: '0'}}
                                                            src={v.file.url} width="100%" height="800"/>
                                                    </>
                                                : null}
                                            </>
                                        }
                                    </Alert>
                                </Box>
                            )}
                        </div>
                    </div>
                    :
                    null
                }
                </CardContent>
            </Card>
        </>
    )
}
