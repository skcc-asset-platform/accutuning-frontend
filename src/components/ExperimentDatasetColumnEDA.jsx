import React from 'react'
import { gql } from 'apollo-boost';
import { useQuery, useMutation } from 'react-apollo';
import SafeSrcDocIframe from 'react-safe-src-doc-iframe';
import { Button, Box, IconButton, Grid } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Alert, AlertTitle } from '@material-ui/lab';
import { toastError } from '../utils'
import SettingsIcon from '@material-ui/icons/Settings';
import { useTranslation } from "react-i18next";
import ConfirmationDialogRaw from './ExperimentDatasetColumnEDAConfiguration'

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


// const getUserFrendlyTitle = (title, t) => {
//     if (title === 'corrmat')
//         return <>{t('CORRELATION MATRIX')}</>
//     else if (title === 'pairplot')
//         return <>{t('PAIR PLOT')}</>
//     else if (title === 'parcoord_plot')
//         return <>{t('PARALLEL COORDINATES')}</>
//     else if (title === 'variable_alanysis_all')
//         return <>{t('VARIABLE ANALYSIS (ALL COLUMNS)')}</>
//     else if (title === 'variable_alanysis_major')
//         return <>{t('VARIABLE ANALYSIS (TARGET)')}</>
//     else
//         return title.toUpperCase()

// }

// const getPlotDescription = (title, t) => {
//     if (title === 'corrmat')
//         return <>{t('about-corrmat')}</>
//     else if (title === 'pairplot')
//         return <>{t('about-pairplot')}</>
//     else if (title === 'parcoord_plot')
//         return <>{t('about-parcoord_plot')}</>
//     else
//         return ''
// }



export default ({datasetId, targetColumnName}) => {
    const { data, loading, error, stopPolling, startPolling, refetch } = useQuery(
        QUERY_DATASET_EDA, { variables: {datasetId, targetColumnName} });
    const [ startEda, obj ] = useMutation(MUTATION_REQUEST_EDA);
    const [ cancelEda ] = useMutation(MUTATION_CANCEL_EDA);
    const [ updateEda ] = useMutation(MUTATION_UPDATE_EDA);
    const [ polling, setPolling ] = React.useState(false);
    const { t } = useTranslation();
    const [open, setOpen] = React.useState(false);
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
                toastError(`정상적으로 수행되지 않았습니다. message: ${String(e)}`)
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

    return <Box mt={2}>
        {polling ?
            <Alert
                action={
                    <Button variant="outlined" color="primary" size="small"
                        onClick={()=>{
                            cancelEda({variables: {id: data.datasetEda.id }}).catch((e) => toastError(e))
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
        {data.datasetEda.status === 'CREATED' ? <>
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={()=>{
                        startEda({variables: {id: data.datasetEda.id }}).catch((e) => toastError(e))
                    }}
                >{t('Build EDA plots')}</Button>
                <Button variant="outlined" onClick={()=>setOpen(true)} color="primary" endIcon={<SettingsIcon/>}>
                    {t('Configuration')}({data.datasetEda.plotChoices.length}{t('plots')})
                </Button>
            </>
            :
            null
        }
        {data.datasetEda.status === 'DONE' || data.datasetEda.status === 'ERROR' ?
            <>
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={()=>{
                        startEda({variables: {id: data.datasetEda.id }}).catch((e) => toastError(e))
                    }}
                >{t('Rebuild plots')}</Button>
                <Button variant="outlined" onClick={()=>setOpen(true)} color="primary" endIcon={<SettingsIcon/>}>
                    Configuration({data.datasetEda.plotChoices.length} plots)
                </Button>

            </>
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
                                    <img src={v.file.url}/>
                                </>
                            : null}
                            {v.file.ext === 'html' ?
                                <>
                                    <iframe
                                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                        border="0"
                                        style={{borderWidth: '0'}}
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