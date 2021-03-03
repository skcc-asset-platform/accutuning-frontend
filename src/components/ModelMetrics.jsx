/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useEffect, useState} from 'react';
import { gql } from 'apollo-boost';
import { useQuery } from 'react-apollo';
import Spinner from '../utils/Spinner'
import { useTranslation } from "react-i18next";

const QUERY_MODEL_METRICS = gql`
query queryModelMetrics($id: Int!) {
    baseModel (id: $id) {
        id
        allMetricsJson
        status:allMetricsStatus
        experiment {
            resamplingStrategy
        }
    }
}
`

export default ({modelId}) => {
    const { data, loading, error, refetch, startPolling } = useQuery(QUERY_MODEL_METRICS, { variables: {id: modelId}});
    const [ polling, setPolling ] = useState(false);
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
    let metrics = null

    if (data && data.baseModel) {
        try {
            metrics = JSON.parse(data.baseModel.allMetricsJson);
        }
        catch {}
    }

    let heads = null
    if (!polling && metrics) {
        const cnt = Object.values(metrics)[0].length;
        if (cnt === 1) {
            heads = [`Score`]
        }
        else if (cnt === 2) {
            if (data && data.baseModel.experiment.resamplingStrategy === 'CV') {
                heads = [`Train`, `Test`]
            }
            else {
                heads = [`Train`, `Valid`]
            }
        }
        else {
            heads = [
                `Train`,
                `Valid`,
                `Test`
            ]
        }
    }

    return (
        <div>
            <div float="right">
                {polling ? <Spinner/> : null}
                <span>{data && data.baseModel.status !== 'DONE' ? `status: ${data.baseModel.status}`: null}</span>
            </div>
            {heads && heads.length > 0 ?
                <table className="tbl_g table-striped">
                    <thead>
                    <tr>
                        <th>{t('Metric')}</th>
                        {heads.map(h => <th key={h}>{h}</th>)}
                    </tr>
                    </thead>
                    <tbody>
                    {Object.keys(metrics).map(
                        k =>
                            <>
                                <tr>
                                    <td className="txt_l">{k}</td>
                                    {metrics[k].map((v, idx) => 
                                        <td className="txt_l" key={`${k}-${idx}`}>{v}</td>
                                    )}
                                </tr>
                            </>
                    )}
                    </tbody>
                </table>
                :
                null
            }
        </div>
    )
}