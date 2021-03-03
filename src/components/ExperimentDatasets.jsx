/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useEffect, useState} from 'react';
import { gql } from 'apollo-boost';
import { useQuery } from 'react-apollo';
import ExperimentDatasetDetail from './ExperimentDatasetDetail';
import Spinner from '../utils/Spinner'
import { SubHeading } from '../utils'
// import PollingSpinner from '../utils/PollingSpinner';
import MutateAction from '../utils/MutateAction'
import CircularProgress from "@material-ui/core/CircularProgress";
import { useTranslation } from "react-i18next";
import {
    // Switch,
    // Route,
    Link,
    // useRouteMatch,
    // Redirect,
    useParams
} from "react-router-dom";


const QUERY_EXPERIMENT_DATASETS = gql`
query queryExperimentDatasets($id: Int!) {
    experiment (id: $id) {
        id
        preprocessedDatasets {
            id
            name
            rowCount
            colCount
            processingStatus
            isProcessed
            uiOpen
            lastError
        }
    }
}
`

export default ({id}) => {
    const { data, loading, error, refetch, stopPolling, startPolling } = useQuery(
        QUERY_EXPERIMENT_DATASETS, { variables: {id: id} });
    const [ polling, setPolling ] = useState(false);
    // const match = useRouteMatch();
    const { seq } = useParams();
    const { t } = useTranslation();
    const selectedDatasetType = (seq && seq.slice(-1) === 'b') ? 'column' : 'source';
    let selectedDatasetIdx = parseInt(seq && (seq.slice(-1) === 'b' || seq.slice(-1) === 'a') && seq.slice(0,-1))

    useEffect(() => {
        refetch()
    }, [refetch])

    if (!data && loading) {
        return <Spinner>{t('Loading...')}</Spinner>
    }

    if (error) {
        return <div style={{color: 'red'}}>
            {String(error)}, experiment_id: {id}
        </div>
    }

    if (data && data.experiment && data.experiment.preprocessedDatasets && data.experiment.preprocessedDatasets.length > 0) {
        const filtered = data.experiment.preprocessedDatasets.filter(ds => (
            ds.processingStatus === 'READY' || ds.processingStatus === 'ERROR'))
        if (filtered.length === 0) {
            if (!polling) {
                startPolling(4000)
                setPolling(true)
            }
        }
        else if (filtered.length > 0) {
            if (polling) {
                stopPolling();
                setPolling(false)
            }
        }
    }

    const datasets = data && data.experiment && data.experiment.preprocessedDatasets

    if (!datasets) return 'no-data'

    if (isNaN(selectedDatasetIdx) || selectedDatasetIdx >= datasets.length) {
        selectedDatasetIdx = datasets.length - 1
    }

    const lastDatasetId = datasets[datasets.length - 1].id
    const lastConfigOpen = datasets[datasets.length - 1].uiOpen
    const selectedDatasetId = datasets[selectedDatasetIdx].id
    const renderStep = (step) => {
        step += 1;
        let j = step % 10;
        let k = step % 100;
        if(j === 1 && k !== 11){
            return step +'st';
        }
        if(j === 2 && k !== 12){
            return step +'nd';
        }
        if(j === 3 && k !== 13){
            return step +'rd';
        }
        return step+'th';
    }
    const subheadingMsg = datasets.length && polling ? `Pre-processing ${datasets[0].name} in the ${renderStep(selectedDatasetIdx)} step` : null
    // <>{selectedDatasetType === 'source'? 'Preview' : 'Columns'} of {datasets[0].name} in the {renderStep(selectedDatasetIdx)} step</>

    return (
        <section className="section_content">
            <SubHeading>
                {t('about-preprocess')}
            </SubHeading>

            <div className="area_util">
                <div className="info_table">
                    <div className="tab_preprocess">
                        <ul id="pipeline" className="nav">
                        {
                            datasets.map((dataset, idx) =>
                            <React.Fragment key={idx}>
                                {/* source view */}
                                <li className={idx === selectedDatasetIdx && selectedDatasetType === 'source' ? "nav-item item_point" : "nav-item"}>
                                    <Link
                                        to={`/r/${data.experiment.id}/preprocess/${idx}a`}
                                        className="nav-link active"
                                        disabled={idx === selectedDatasetIdx && selectedDatasetType === 'source'}
                                    >
                                        <span className="ico_automl ico_table">결과</span>
                                    </Link>
                                </li>
                                {/* column view */}
                                {(dataset.id !== lastDatasetId || lastConfigOpen) ?
                                    <li className={idx === selectedDatasetIdx && selectedDatasetType === 'column' ? "nav-item item_point" : "nav-item"}>
                                        <Link
                                            to={`/r/${data.experiment.id}/preprocess/${idx}b`}
                                            className="nav-link active tooltip_model"
                                            disabled={idx === selectedDatasetIdx && selectedDatasetType === 'column'}
                                        >
                                            <span className="ico_automl ico_set">preprocess</span>
                                        </Link>
                                    </li>
                                    :
                                    null
                                }
                            </React.Fragment>
                            )
                        }

                        <li className="nav-item item_add">
                        {
                            polling ?
                                <a className="nav-link loader">
                                    <CircularProgress color="secondary" />
                                </a>

                                // 'preprocessing'
                            :
                            (
                                lastConfigOpen ?
                                    <MutateAction
                                        verb='post'
                                        path={`/datasets/${lastDatasetId}/preprocess/`}
                                        className="nav-link active tooltip_model"
                                        // loadingforever="true"
                                        onLoad={()=>{
                                            refetch();
                                        }}>
                                        <span className="ico_automl ico_add">추가(preprocess)</span>
                                        <div className="txt_tooltip">
                                                {t('Click to apply preprocessor')}
                                        </div>
                                    </MutateAction>
                                    :
                                    <MutateAction
                                        verb='patch'
                                        path={`/datasets/${lastDatasetId}/`}
                                        className="nav-link active tooltip_model"
                                        // loadingforever="true"
                                        data={{uiOpen: true}}
                                        onLoad={()=>{
                                            refetch();
                                        }}>
                                        <span className="ico_automl ico_add" style={{color: 'gray'}}>추가(open)</span>
                                        <div className="txt_tooltip">
                                            {t('Click to add new preprocessor')}
                                        </div>
                                    </MutateAction>
                            )
                        }
                        </li>
                        </ul>
                    </div>
                </div>
            </div>

            <ExperimentDatasetDetail
                refetchList={refetch}
                subheadingMsg={subheadingMsg}
                id={selectedDatasetId || data.experiment.preprocessedDatasets[data.experiment.preprocessedDatasets.length - 1].id}
                subPanel={selectedDatasetType}
                isFirst={selectedDatasetIdx===0}
                />
        </section>
    )
}