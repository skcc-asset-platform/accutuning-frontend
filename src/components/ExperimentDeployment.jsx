/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import MutateAction from '../utils/MutateAction'
import { gql } from 'apollo-boost';
import { useQuery, useApolloClient } from 'react-apollo';
import PredictionMonitor from './PredictionMonitor'
import ExperimentPredictions from './ExperimentPredictions'
import ExperimentDeployments from  './ExperimentDeployments'
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardHeader, CardContent, Grid, Checkbox } from '@material-ui/core';
import { useTranslation } from "react-i18next";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {
    useParams,
  } from "react-router-dom";


const QUERY_DEPLOYMENT = gql`
query experimentDeployment($id: Int! $targetDepId: Int) {
    deployment(experimentId: $id, targetDepId: $targetDepId) {
        id
        name
        status
        modelType
        modelPk
        createdAt
        requiredUserInputs
        pipelineFp {
            url
            sizeHumanized
        }
        allMetricsJson
        visualizedObjects {
            id
            img
            title
        }
    }
    experiment(id: $id) {
        id
        # dataset {
        #     id
        #     preprocessorFile
        #     preprocessorInfo
        # }
        # preprocessorsInfo
        preprocessedDatasets {
            id
            preprocessorFile {
                url
            }
            preprocessorInfoJson
        }
        targetColumnName
        dataset {
            id
            columns {
                id
                name
                datatype
                mostFrequent
                min
                max
                # isTarget
            }
        }
    }
}
`

const QUERY_ENSEMBLE = gql`
query ensemble($id: Int!) {
    ensemble(id: $id) {
        pipelineInfo
        score
    }
}`

const QUERY_MODEL = gql`
query model($id: Int!) {
    model(id: $id) {
        pipelineInfo
        score
    }
}`


const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.paper,
      display: 'flex',
      minHeight: 224,
    //   border: '1px solid #eeeeee'
    },
    tabs: {
      borderRight: `1px solid ${theme.palette.divider}`,
    },
  }));


const EnsembleDeploymentInfo = ({id}) => {
    const { data } = useQuery(QUERY_ENSEMBLE, { variables: {id}});
    return data && data.ensemble ? <table className="tbl_g table-striped">
            <thead>
            <tr>
                <th>Weight</th>
                <th>Step</th>
                <th>Details</th>
            </tr>
            </thead>
            <tbody>
            {JSON.parse(data.ensemble.pipelineInfo).map(([weight, pipeline], idx) => <>
                {pipeline.map(
                ([key, estimator], subidx) => <tr key={`${idx}-${subidx}`}>
                    {subidx === 0 ?
                        <td className='txt_l' rowSpan={pipeline.length}>{weight}</td>
                        :
                        null
                    }
                    <td className="txt_l">{key}</td>
                    <td className="txt_l">{estimator}</td>
                </tr>
                )}
            </>)}
            </tbody>
        </table>
        :
        null
}

const ModelDeploymentInfo = ({id}) => {
    const { data } = useQuery(QUERY_MODEL, { variables: {id}});
    const pipeline = data && data.model ? JSON.parse(data.model.pipelineInfo): null
    const { t } = useTranslation();

    return pipeline ?
            <table className="tbl_g table-striped">
                <thead>
                <tr>
                    <th>{t('Step')}</th>
                    <th>{t('Details')}</th>
                </tr>
                </thead>
                <tbody>
                {pipeline ? pipeline.map(([name, pipeline]) => (
                    <tr>
                        <td className="txt_l">{name}</td>
                        <td className="txt_l">{pipeline}</td>
                    </tr>
                )) : null}
                </tbody>
            </table>
            :
            null
}

function a11yProps(index) {
    return {
      id: `vertical-tab-${index}`,
      'aria-controls': `vertical-tabpanel-${index}`,
    };
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`vertical-tabpanel-${index}`}
        aria-labelledby={`vertical-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box p={3}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

export default ({id}) => {

    let { urlId } = useParams(null);

    const [targetDepId, setTargetDepId] = useState(null)
    const [targetPreId, setTargetPreId] = useState(0)
    const [predictionHistoryVisible, setPredictionHistoryVisible] = useState(false)
    const { data, loading, error, refetch, startPolling } = useQuery(QUERY_DEPLOYMENT, { variables: {id: id, targetDepId:urlId}});
    const [resp, setResp] = useState(null)
    const [buildLime, setbuildLime] = useState(true)
    const [extraUserInputs, setExtraUserInputs] = useState({})
    // const [validJson, setValidJson] = useState(true);
    // const [input, setInput] = useState(null);
    // const [subPanel, setSubPanel] = useState("overview");
    const client = useApolloClient()
    // const [apiData, setApiData] = useState(null);
    // const [userInput, setUserInput] = useState({})
    const [ polling, setPolling ] = useState(false);
    // const [ showIndex, setShowIndex ] = useState(0)
    const [ predicting, setPredicting ] = useState(false)
    const classes = useStyles();
    const [value, setValue] = React.useState(0);
    // const [requestJson, setRequestJson] = React.useState(null);
    const { t } = useTranslation();
    // const [ redirectDeployment, setRedirectDeployment ] = useState(false)


    const handleChange = (event, newValue) => {
      setValue(newValue);
    };

    const handleHistory = (value) => {
        if(value === "open"){
            setPredictionHistoryVisible(true);
        }else if(value === "close"){
            setPredictionHistoryVisible(false);
        }else if(predictionHistoryVisible === value){
            setPredictionHistoryVisible(!value);
        }else{
            setPredictionHistoryVisible(value);
        }
    };

    useEffect(() => {
        if(data && data.deployment){
            if(urlId){
                setTargetDepId(urlId);
            }else{
                setTargetDepId(data.deployment.id);
            }
        }
        refetch()
    }, [refetch, data, urlId])


    if (loading) {
        return 'loading'
    }


    if (error) {
        return String(error)
    }

    if (data && data.deployment) {
        if (data.deployment.status === 'REQUEST' || data.deployment.status === 'DEPLOYING') {
            if (!polling) {
                startPolling(3000)
                setPolling(true)
            }
        }
        else {
            if (polling) {
                setPolling(false)
                // startPolling(10000)
                refetch()
            }
        }
    }

    console.log('rewriting.. userinput')
    data.experiment.dataset.columns.map(c => {

        let userInput = null;

        try {
            userInput = client.readFragment({
                id: `ColumnType:${c.id}`,
                fragment: gql`
                    fragment col on ColumnType {
                        userInput
                    }
                `
            }).userInput
        }
        catch {}

        client.writeFragment({
            id: `ColumnType:${c.id}`,
            fragment: gql`
                fragment col on ColumnType {
                    userInput
                }
            `,
            data: {
                __typename: 'ColumnType',
                userInput: userInput || c.mostFrequent,
            },
        })

        return userInput
    })


    // const PropSpan = ({ name }) => <span>{`${name} : ${data && data.deployment ? data.deployment[name] : null}`}</span>
    // const fields = [
    //     'id',
    //     'status',
    //     'modelType',
    //     'modelPk',
    //     'createdAt',
    //     'file',
    // ];

    // const scores = data && data.deployment ?
    //     <div>
    //         <table className="tbl_g table-striped">
    //             <thead>
    //             <tr>
    //                 <th>Metric</th>
    //                 <th>Value</th>
    //             </tr>
    //             </thead>
    //             <tbody>
    //             {data.deployment.allMetricsJson ? Object.keys(JSON.parse(data.deployment.allMetricsJson)).map(
    //                 k =>
    //                     <tr>
    //                         <td className="txt_l">{k}</td>
    //                         <td className="txt_l">{JSON.parse(data.deployment.allMetricsJson)[k]}</td>
    //                     </tr>
    //             ) : null}
    //             </tbody>
    //         </table>
    //     </div>
    //     :
    //     <i>No deployment contents</i>;

    const pipeline = data && data.deployment ?
            (
                data.deployment.modelType === 'ensemble' ?
                    <EnsembleDeploymentInfo id={data.deployment.modelPk}/>
                    :
                    <ModelDeploymentInfo id={data.deployment.modelPk}/>
            )
            :
            <i>{t('No deployment contents')}</i>;

    // const vobjects = data && data.deployment ?
    //         (
    //             data.deployment.modelType === 'ensemble' ?
    //                 'No supports for ensemble yet'
    //                 :
    //                 <div>
    //                     <ul className="nav nav-tabs list_menu" id="myTab" role="tablist">
    //                         {data.deployment.visualizedObjects ?
    //                             data.deployment.visualizedObjects.map((vo, idx) => (
    //                                 idx === showIndex ? <li className="active" disabled={showIndex === idx} key={idx} onClick={() => setShowIndex(idx)}>
    //                                         {vo.title}
    //                                     </li>
    //                                     : <li disabled={showIndex === idx} key={idx} onClick={() => setShowIndex(idx)}>{vo.title}
    //                                     </li>
    //                             ))
    //                             :
    //                             null
    //                         }
    //                     </ul>

    //                     {data.deployment.visualizedObjects ?
    //                         data.deployment.visualizedObjects.map((vo, idx) => (showIndex === idx ? <div className="txt_c" key={idx}><img alt={vo.title} src={vo.img} width={600}/></div> : null))
    //                         :
    //                         null
    //                     }
    //                 </div>
    //         )
    //         :
    //         <i>No deployment contents</i>;

    const preprocessors = data && data.experiment && data.experiment.preprocessedDatasets ?
        data.experiment.preprocessedDatasets.map(
            e => e.preprocessorInfoJson ? {
                id: e.id,
                preprocessorFile: e.preprocessorFile.url,
                preprocessorInfo: JSON.parse(e.preprocessorInfoJson)
            } : null
        ).filter(
            e => e
        )
        :
        null;

    // const onChange = (jsonText) => {
    //     try {
    //         JSON.parse(jsonText)
    //         setInput(jsonText)
    //         setValidJson(true)
    //     }
    //     catch {
    //         setValidJson(false)
    //     }
    // }

    // const defaultApiInput = !input && data && data.experiment ?
    //     JSON.stringify(data.experiment.dataset.columns.reduce(
    //         (result, {name, mostFrequent}) => {
    //             if(name === data.experiment.targetColumnName) {}
    //             else {
    //                 result[name] = mostFrequent;
    //             }
    //             return result;
    //         }, {}), null, 2)
    //     :
    //     input;

    // const getClasses = (name) => {
    //     return subPanel === name ? 'nav-item active' : 'nav-item'
    // }


    const getHeading = (status) => {
        const d = {
            'REQUEST': 'Deploying..',
            'DEPLOYING': 'Deploying..',
            'DONE': 'Ready',
            'ERROR': 'Error',
            'INIT': 'No deployment yet',
        }
        return d[status] || 'No deployment yet'
    }

    // const msToSeconds = (msDuration) => {
    //     var seconds = ((msDuration % 60000) / 100000).toFixed(4);
    //     return seconds
    // }

    const ready = !polling && data && data.deployment && data.deployment.status === 'DONE'

    return (
        <section className="section_content section_deploy">
            <ExperimentDeployments id={id} targetDepId={targetDepId}  handleTargetDepId={setTargetDepId}/>
            <Card variant="outlined" style={{marginBottom: '15px'}}>
                <CardHeader
                    title={data.deployment ?
                        <span style={{textTransform: 'uppercase'}}>{data.deployment.name}</span> : t('No deployment yet')}
                    subheader={t('Deploy the model to your platform to get predictions')}
                    />
                <CardContent>
                {
                    ready ?
                        <div className={classes.root}>
                            <Tabs
                                orientation="vertical"
                                variant="scrollable"
                                value={value}
                                onChange={handleChange}
                                aria-label="deployment menu"
                                className={classes.tabs}
                            >
                                <Tab label= {t('Overview')} {...a11yProps(0)} />
                                <Tab label= {t('Pipeline')} {...a11yProps(1)} />
                            </Tabs>
                            <TabPanel value={value} index={0} style={{width: '100%'}}>
                                {data.deployment ?
                                    <div className="info_deploy">
                                        <Grid container justify="space-between">
                                            <Grid item>
                                            {t('Type')}: {data.deployment.modelType}<br/>
                                            {t('Status')}: {getHeading(data.deployment.status)}<br/>
                                            {t('Deployment')} {t('date')}: {data.deployment.createdAt}<br/>
                                        </Grid>
                                        <Grid item md="4" style={{textAlign: 'end'}}>
                                        <Button variant="contained" color="primary" href={data.deployment.pipelineFp.url}>
                                            {t('Download trained model')} ({data.deployment.pipelineFp.sizeHumanized})
                                        </Button>
                                        </Grid>
                                        </Grid>
                                    </div>
                                    :
                                    null
                                }
                                <div className="wrap_code">
                                    <div className="desc_code">
                                        <p>
                                            {t('about-modelbinary')}
                                        </p>
                                    </div>
                                    <pre>
                                        <code>
                                            <span style={{color: 'rgb(64, 128, 128)', fontStyle: 'italic'}}># Some preprocessors need our own helper packages.<br/># You have to download and install this.</span><br/>
                                            <span style={{color: 'rgb(64, 128, 128)', fontStyle: 'italic'}}># !pip install \<br/>
                                                # --trusted-host github.com \<br/>
                                                # --trusted-host codeload.github.com \<br/>
                                                # https://github.com/skcc-asset-platform/accutuning_helpers/archive/v1.0.18.zip</span><br/><br/>
                                            <span style={{color: 'rgb(149, 65, 33)'}}>import</span> pickle, pandas as pd<br/>
                                            <span style={{color: 'rgb(64, 128, 128)', fontStyle: 'italic'}}># You can check the model pipeline with the following code.</span><br/>
                                            df = pd.read_csv('<span style={{color: 'red', fontWeight: 'bold'}}>## YOUR SOURCE FILE ##</span>')<br/><br/>
                                            <span style={{color: 'rgb(64, 128, 128)', fontStyle: 'italic'}}>
                                                ########################################################<br/>
                                                # Remove target column if it is necessary.</span><br/>
                                            df.drop('<span style={{color: 'red', fontWeight: 'bold'}}>## TARGET VARIABLE ##</span>', axis=1, inplace=True)<br/><br/>
                                            pipeline = pickle.load(open(<span style={{color: 'rgb(33, 145, 97)'}}>'pipeline.pkl', 'rb'</span>))<br/>
                                            print(pipeline) <span style={{color: 'rgb(64, 128, 128)', fontStyle: 'italic'}}># CHECK PIPELINE STRUCTURE</span><br/>
                                            pipeline.predict(df)<br/>
                                        </code>
                                    </pre>
                                </div>
                            </TabPanel>
                            <TabPanel value={value} index={1} style={{width: '100%'}}>
                            {preprocessors && preprocessors.length > 0 ? preprocessors.map((preprocessor, idx) => <React.Fragment key={idx}>
                            <strong className="tit_pipeline">
                                {t('Preprocessor step - ')}{idx}
                                {/* {preprocessor.preprocessorFile ?
                                        <a href={preprocessor.preprocessorFile} download>
                                            Download binary
                                        </a>
                                        :
                                        null
                                } */}
                            </strong>
                            <table className="tbl_g">
                            <thead>
                                <tr>
                                    <th>{t('Step')}</th>
                                    <th>{t('Details')}</th>
                                </tr>
                            </thead>
                            <tbody>
                            {preprocessor.preprocessorInfo ?
                                preprocessor.preprocessorInfo.map(
                                    ([key, value]) => <tr key={key}>
                                            <td className="txt_l">{key}</td>
                                            <td className="txt_l">{String(value)}</td>
                                        </tr>
                                )
                                : <tr><td colSpan={2}>{t('No preprocessor')}</td></tr>}
                            </tbody>
                            </table>
                        </React.Fragment>)
                        :
                        'No preprocessor info.'
                        }
                        <strong className="tit_pipeline">{t('Final Estimator')}</strong>
                        {pipeline}
                        </TabPanel>
                    </div>
                    :
                    null
                }
                </CardContent>
            </Card>
            {ready ?
                <Card variant="outlined">
                    <CardHeader title='Prediction' subheader={t("Data processing for the form below is open to the RestAPI URL")}/>
                    <CardContent>
                    <h4>step-1: {t('request')}</h4>
                    <table className="table-condensed tbl_predict">
                        <colgroup>
                            <col style={{width:'105px'}}/>
                        </colgroup>
                        <tbody>
                        <tr>
                            <td>URL</td>
                            <td>
                                <span style={{textDecoration: 'underline'}}>
                                    {window.location.protocol}{'//'}{window.location.host}{`/api/experiments/${id}/deployment/predict/`}
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Method
                            </td>
                            <td><b>POST</b> (Content-Type: <b>application/json</b>)</td>
                        </tr>
                        <tr>
                            <td>
                                Input
                            </td>
                            <td>
                                {t('single json string for input')}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Output
                            </td>
                            <td>
                                {t('request status and prediction key')}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <Box component="h4" mt={3}>step-2: {t('get the result')}</Box>
                    <table className="table-condensed tbl_predict">
                        <colgroup>
                            <col style={{width:'105px'}}/>
                        </colgroup>
                        <tbody>
                        <tr>
                            <td>URL</td>
                            <td>
                                <span style={{textDecoration: 'underline'}}>
                                {window.location.protocol}://{window.location.host}{`/api/graphql`}
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Method
                            </td>
                            <td><b>POST</b> (Content-Type: <b>application/json</b>)</td>
                        </tr>
                        <tr>
                            <td>
                                Input
                            </td>
                            <td>
                                <div>{t('Following single json string (replace PREDICTION_KEY to first result)')}</div>
                                <em style={{color: 'grey'}}>
                                    {`{"operationName":"queryPrediction","variables":{"id": <PREDICTION_KEY>},"query":"query queryPrediction($id: Int!) {\n  prediction(id: $id) {\n    output\n    done\n    error\n    errorMessage\n}\n}\n"}`}
                                </em>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Output
                            </td>
                            <td><b>{t('prediction result')}</b>, <b>{t('errors')}</b>({t('if exists')}), <b>{t('explanation of the prediction')}</b>(lime html)
                            </td>
                        </tr>
                        </tbody>
                    </table>

                    <table className="tbl_g tbl_predict2">
                        <thead>
                        <tr>
                            <th>{t('Feature')}</th>
                            <th>{t('Datatype')}</th>
                            <th>{t('min')}</th>
                            <th>{t('max')}</th>
                            <th>{t('mostfrequent')}</th>
                            <th>
                                {/* <button type="button" className="btn_border btn_s"
                                        onClick={()=>{}}>Fill with the most frequent values
                                </button> */}
                                Input
                            </th>
                        </tr>
                        </thead>
                        <tbody id="predict_table">
                            {data.experiment.dataset.columns.map(column => (
                                column.name === data.experiment.targetColumnName ?
                                    null
                                    :
                                <tr key={column.id}>
                                    <td>{column.name}</td>
                                    <td>{column.datatype}</td>
                                    <td>{column.min}</td>
                                    <td>{column.max}</td>
                                    <td>{column.mostFrequent}</td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control predict-input"
                                            onChange={(e) => {
                                                client.writeFragment({
                                                    id: `ColumnType:${column.id}`,
                                                    fragment: gql`
                                                        fragment col on ColumnType {
                                                            userInput
                                                        }
                                                    `,
                                                    data: {
                                                        __typename: 'ColumnType',
                                                        userInput: e.target.value,
                                                    },
                                                });
                                                // client.writeData({ data: {
                                                //     __typename: 'Column',
                                                //         hello: 'word ',
                                                //     id: column.id,
                                                // }})
                                                // console.log(e.target.value)
                                                // refetch({fetchPolicy: 'cache-first'})
                                            }}
                                            defaultValue={
                                                client.readFragment({
                                                    id: `ColumnType:${column.id}`,
                                                    fragment: gql`
                                                        fragment col on ColumnType {
                                                            mostFrequent
                                                        }
                                                    `
                                                }).mostFrequent
                                            }
                                            />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {data.deployment.requiredUserInputs.length > 0 ?
                        <>
                            <h4>사용자입력이 추가적으로 필요한 자동으로 만들어낼 수 없는 feature가 있습니다.</h4>
                            <table className="tbl_g tbl_predict2">
                                <thead>
                                    <tr>
                                        <th>feature</th>
                                        <th>input</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.deployment.requiredUserInputs.map(inp =>
                                        {
                                            return <tr>
                                                <td>{inp}</td>
                                                <td>
                                                <input
                                                    type="text"
                                                    className="form-control predict-input"
                                                    onChange={(e) => {
                                                        setExtraUserInputs(
                                                            {
                                                                ...extraUserInputs,
                                                                [inp]: e.target.value,
                                                            }
                                                        )
                                                        // client.writeFragment({
                                                        //     id: `ColumnType:${column.id}`,
                                                        //     fragment: gql`
                                                        //         fragment col on ColumnType {
                                                        //             userInput
                                                        //         }
                                                        //     `,
                                                        //     data: {
                                                        //         __typename: 'ColumnType',
                                                        //         userInput: e.target.value,
                                                        //     },
                                                        // });
                                                        // // client.writeData({ data: {
                                                        // //     __typename: 'Column',
                                                        // //         hello: 'word ',
                                                        // //     id: column.id,
                                                        // // }})
                                                        // // console.log(e.target.value)
                                                        // // refetch({fetchPolicy: 'cache-first'})
                                                    }}
                                                    defaultValue={0}
                                                    />
                                                </td>
                                            </tr>
                                        }
                                    )}
                                </tbody>
                            </table>
                        </>
                        :
                        null
                    }

                    {data && data.deployment && data.deployment.status === 'DONE' ?
                        <div className="txt_r">
                            {/* <MutateAction className="btn_b" verb='post' path={`/experiments/${experiment.id}/deployment/preprocess/`} data={{inputs:(input || defaultApiInput)}} disabled={!validJson} onLoad={(resp) => setInput(JSON.stringify(resp, null, 2))}>
                                PREPROCESS
                            </MutateAction> */}

                            <FormControlLabel
                                disabled={predicting}
                                control={<Checkbox checked={buildLime} onChange={() => setbuildLime(!buildLime)} name={'Explain'} />}
                                label={'Explain using lime'}
                            />
                            <FormControlLabel
                                disabled={true}
                                control={<Checkbox checked={true} name={'Preprocess'} />}
                                label={'Preprocess'}
                            />
                            <MutateAction
                                className="btn_confirm btn_b"
                                verb='post'
                                path={`/experiments/${id}/deployment/predict/`}
                                // data={{inputs:(input || defaultApiInput)}}
                                // disabled={!validJson}
                                onBeforeRequest={() => {setResp(null); setPredicting(true);}}
                                disabled={predicting}
                                builddata={
                                    () => {
                                        const inputs = client.readQuery({
                                            query: gql`
                                                query reqdTest {
                                                    experiment(id: $id) {
                                                        dataset {
                                                            columns {
                                                                name
                                                                userInput
                                                            }
                                                        }
                                                    }
                                                }`,
                                            variables: {id}
                                        })
                                        let input = {}
                                        inputs.experiment.dataset.columns.forEach(c => {
                                            if (c.name !== data.experiment.targetColumnName)
                                                input[c.name] = c.userInput
                                        })
                                        // console.log(input, data.experiment.targetColumnName)
                                        let req = {
                                            inputs: JSON.stringify(input),
                                            extraUserInputs: JSON.stringify(extraUserInputs),
                                            // inputs: input,
                                            // extraUserInputs: extraUserInputs,
                                            buildLime: buildLime,
                                            preprocess: true,
                                            targetDeploymentId:targetDepId
                                        }
                                        // setRequestJson(req)
                                        // alert(JSON.stringify(req))
                                        // setInput(JSON.stringify(input))
                                        return req
                                    }
                                }
                                onLoad={(resp) => {setResp(resp);}}
                                onError={(e) => {setPredicting(false)}}
                            >
                                {predicting? t('Predicting...') : t('Predict')}
                            </MutateAction>
                            <br/>
                            <Button style={{textDecoration: 'underline', color: 'blue'}} size="small" onClick={() => handleHistory(true)}>{t('Previous predictions')}</Button>
                        </div>
                        :
                        null
                    }
                    {resp ?
                        // <div style={{backgroundColor: '#efefef'}}>
                        //     {resp.error ?
                        //         <div style={{color: 'red'}}>Error: {resp.error}</div>
                        //         :
                        //         <>Result: {resp.result}</>
                        //     }
                        //     {resp.lime && resp.lime.asHtml ?
                        //         <SafeSrcDocIframe
                        //         sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        //         srcDoc={resp.lime.asHtml}
                        //         border="0"
                        //         title="helloworld"
                        //         width="100%"
                        //         height="400"
                        //         style={{ border: '1' }}
                        //     />
                        //     : null}
                        // </div>
                        <PredictionMonitor predictionPk={resp.predictionPk} onLoad={()=>{
                            setPredicting(false);
                        }}/>
                        :
                        null
                    }
                </CardContent>
            </Card>
            :
            null
        }
        {predictionHistoryVisible  ?
            <Box mt={2}>
                <Card>
                    <CardContent>
                        <>
                            <ExperimentPredictions targetDepId={targetDepId} targetPreId={targetPreId} handleTargetPreId={setTargetPreId}/>
                        </>
                    </CardContent>
                </Card>
            </Box>
            :
            null
        }
        </section>
    )
}