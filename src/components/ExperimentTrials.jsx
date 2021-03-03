/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import ScoreTrend from './ScoreTrend';
import Spinner from '../utils/Spinner'
import { gql } from 'apollo-boost';
import { useQuery } from 'react-apollo';
import { useTranslation } from "react-i18next";

const QUERY_TRIALS = gql`
query queryTrials ($id: Int!) {
    experiment(id: $id) {
        id
        study:optunaStudy {
            id:studyId
            trials:trialsSet {
                id:trialId
                state
                value
                datetimeStart
                datetimeComplete
                trialparamsSet {
                    paramName
                    paramValue
                    distributionJson
                }
            }
        }
    }
}
`

export default ({experiment}) => {
    const { t } = useTranslation();
    const {data, loading, error} = useQuery(
        QUERY_TRIALS, {
            variables: {id: experiment.id},
            fetchPolicy: 'no-cache',
            // pollInterval: 3000
        }
    )
    const [sortColumn, setSortColumn] = useState('id')
    // useEffect(() => {
    //     refetch()
    // }, [refetch])

    if (error) return String(error)

    const fields = [
        "id",
        "state",
        "value",
        "datetimeStart",
        "datetimeComplete",
    ]

    const findEstimator = (params) => {
        const target = params.find(p => p.paramName === 'estimator')
        let json = null;
        if (target) {
            const ind = parseInt(target.paramValue)
            try {
                json = JSON.parse(target.distributionJson)
                return json.attributes.choices[ind]
            }
            catch {}
        }

        return '-'
    }

    let trials = (
        data && data.experiment && data.experiment.study && data.experiment.study.trials ?
        data.experiment.study.trials
        :
        []
    )

    trials.sort((a,b) => (a[sortColumn] > b[sortColumn]) ? 1: -1)

    return (
        <>
            <h3 className="tit_tab">{t('Trials')}</h3>
            <ScoreTrend data={trials.map(t => +t.value).filter(t => t !== null)}/>
            <table className="tbl_g">
                <thead>
                    <tr>
                        {fields.map(field => <th key={field} onClick={() => setSortColumn(field)}>{field}</th>)}
                        <th>{t('duration')}</th>
                        <th>{t('estimator')}</th>
                    </tr>
                </thead>
                <tbody>
                {trials.length > 0 ? <>
                    {trials.map(e => <tr key={e.id}>
                        {fields.map(field => <td key={field}>{String(e[field])}</td>)}
                        <td style={{backgroundColor: '#efefef'}}>
                            {e['datetimeComplete'] ? Date.parse(e['datetimeComplete']) - Date.parse(e['datetimeStart']): null}
                        </td>
                        <td>
                            {findEstimator(e.trialparamsSet)}
                        </td>
                    </tr>)}
                    </>
                    :
                    <tr><td className="ta_c" colSpan={fields.length+2}>
                        {loading? <Spinner>{t('Loading..')}</Spinner>: 'No trials'}
                    </td></tr>
                }
                </tbody>
            </table>
        </>
    )
}
