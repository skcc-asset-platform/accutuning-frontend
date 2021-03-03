/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useEffect, useState} from 'react';
import { gql } from 'apollo-boost';
import { useQuery, useMutation } from 'react-apollo';
import Spinner from '../utils/Spinner'
import { Box, Grid, Button } from '@material-ui/core';
import ModelMetrics from './ModelMetrics';
import { useTranslation } from "react-i18next";
import { Alert, AlertTitle } from '@material-ui/lab';
import { toastError } from '../utils'
import SettingsIcon from '@material-ui/icons/Settings';
import ConfirmationDialogRaw from './ModelStatConfiguration'


const MUTATION_UPDATE_MODEL = gql`
mutation mutate_model($id: ID!, $input: PatchModelBaseInput!) {
    patchModelBase(id: $id, input: $input) {
        modelBase {
            id
            __typename
            plotChoices
            plotChoicesJson
        }
    }
}
`

const QUERY_MODEL_STAT = gql`
query queryModelStat($id: Int!) {
    baseModel (id: $id) {
        id
        status:evaluationStatStatus
        plotChoices
        availablePlotChoices
        visualizedObjects {
            id
            name
            title
            error
            message
            description
            file {
                url
                ext
            }
        }
    }
}
`

export default ({modelId}) => {
    const { data, loading, error, refetch, startPolling } = useQuery(QUERY_MODEL_STAT, { variables: {id: modelId}});
    // const [ showIndex, setShowIndex ] = useState(0)
    const [ polling, setPolling ] = useState(false);
    const [open, setOpen] = React.useState(false);
    const [ updateModel ] = useMutation(MUTATION_UPDATE_MODEL);
    const [evaluate] = useMutation(gql`mutation mutateEvaluation($modelId: ID!) {
        evaluateModel(id: $modelId) {
          model {
            id
            __typename
            evaluationStatStatus
          }
        }
      }`);
    const { t } = useTranslation();
    useEffect(() => {
        refetch()
    }, [refetch])

    if (!data && loading) {
        return 'loading'
    }

    if (data) {
        if (data.baseModel.status === 'REQUEST' || data.baseModel.status === 'PROCESSING') {
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

    if (error) {
        return <div style={{color: 'red'}}>
            {String(error)}, model_id: {modelId}
        </div>
    }

    const handleClose = (newValue) => {
        setOpen(false);

        if (newValue) {
            // setValue(newValue);
            updateModel({variables: {
                id: modelId,
                input: {plotChoicesJson: JSON.stringify(newValue)}}})
            .catch((e) => {
                toastError(`정상적으로 수행되지 않았습니다. message: ${String(e)}`)
            })
        }
    };
    // let evaluation_data = [
    //     { evTitle: 'auc', title: 'auc', disable: true},
    //     { evTitle: 'pr' , title: 'pr', disable: true},
    //     { evTitle: 'confusion_matrix' , title: 'Confusion Matrix', disable: true},
    //     { evTitle: 'error' , title: 'error', disable: true},
    //     { evTitle: 'class_report' , title: 'class_report', disable: true},
    //     { evTitle: 'boundary' , title: 'boundary', disable: true},
    //     { evTitle: 'learning' , title: 'learning', disable: true},
    //     { evTitle: 'vc' , title: 'vc', disable: true},
    //     { evTitle: 'dimension' , title: 'dimension', disable: true},
    //     { evTitle: 'feature' , title: 'feature', disable: true},
    //     { evTitle: 'parameter' , title: 'parameter', disable: true},
    // ];

    // if(data && data.baseModel && data.baseModel.visualizedObjects){
    //     evaluation_data.map((titleData, idx) => {
    //         data.baseModel.visualizedObjects.map((chartData) => {
    //             if(chartData.title === titleData.evTitle){
    //                 titleData.disable = false;
    //             }
    //         })
    //     })
    // }

    // const titleSwitch = (title) => {
    //     switch(title){
    //         case 'corr':
    //             return <a className="link_menu">{t('Correlation')}</a>
    //         case 'feature_importance':
    //             return <a className="link_menu">{t('Feature Importance')}</a>
    //         case 'confusion_matrix':
    //             return <a className="link_menu">{t('Confusion Matrix')}</a>
    //         case 'roc_curve':
    //             return <a className="link_menu">{t('ROC Curve')}</a>
    //         case 'classification_report':
    //             return <a className="link_menu">{t('Classification Report')}</a>
    //         case 'precision_recall_curve':
    //             return <a className="link_menu">{t('Precision Recall Curve')}</a>
    //         case 'residuals_plot':
    //             return <a className="link_menu">{t('Residual Plot')}</a>
    //         case 'prediction_error':
    //             return <a className="link_menu">{t('Prediction Error')}</a>
    //         default:
    //             return <a className="link_menu">{title}</a>

    //     }

    // }

    if (polling) {
        return (
            <div style={{textAlign: 'center'}}>
                <Spinner/>
                <span>{data && data.baseModel.status !== 'DONE' ? `status: ${data.baseModel.status}`: null}</span>
            </div>
        )
    }

    // const plotMsg = 'Permutation feature importance is a model inspection technique that can be used for any fitted estimator when the data is tabular. This is especially useful for non-linear or opaque estimators. The permutation feature importance is defined to be the decrease in a model score when a single feature value is randomly shuffled 1. This procedure breaks the relationship between the feature and the target, thus the drop in the model score is indicative of how much the model depends on the feature. This technique benefits from being model agnostic and can be calculated many times with different permutations of the feature.'

    return (
        <div>
            {!polling && data && data.baseModel && data.baseModel.visualizedObjects ?
                <>
                    <h2>{t('Metrics')}</h2>
                    <ModelMetrics modelId={modelId} />

                    <Box mt={4} mb={2}>
                    <h2>{t('Plots')}</h2>
                    </Box>
                    <Button variant="outlined" onClick={()=>setOpen(true)} color="primary" endIcon={<SettingsIcon/>}>
                        {t('Configuration')}({data.baseModel.plotChoices.length}{t('plots')})
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={()=>{
                            evaluate({variables: {modelId}}).catch((e) => toastError(e))
                        }}
                    >{t('Rebuild plots')}</Button>
                    <ConfirmationDialogRaw
                        // classes={{
                        //     paper: classes.paper,
                        // }}
                        id="model-plots-configuration"
                        // keepMounted
                        open={open}
                        onClose={handleClose}
                        value={data.baseModel.plotChoices}
                        choices={data.baseModel.availablePlotChoices}
                    />
                    {data.baseModel.visualizedObjects.map((v, idx) =>
                        <Box component="div" mt={1} mb={1} key={idx}>
                            <Alert severity={v.error ? 'error' : 'info'} variant="outlined">
                                <AlertTitle>{t(v.title)}</AlertTitle>
                                {v.error ?
                                    v.message
                                    :
                                    <>
                                        {v.description}
                                        <Grid container justify="flex-end">
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                size="small"
                                                component="a"
                                                target="_blank"
                                                href={v.file.url}>{t('Open plot in new tab')}</Button>
                                        </Grid>
                                        {v.file.ext === 'png' ? <>
                                            <img src={v.file.url} alt={'plot'}/>
                                        </> : null}
                                        {v.file.ext === 'html' ? <>
                                            <iframe sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                                title='plot'
                                                border="0"
                                                style={{borderWidth: '0'}}
                                                src={v.file.url} width="100%" height="800"/>
                                        </>: null}
                                    </>
                                }
                            </Alert>
                        </Box>
                    )}
                </>
                :
                null
            }
        </div>
    )
}