/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useEffect} from 'react';
import { gql } from 'apollo-boost';
import { useQuery } from 'react-apollo';
import { useTranslation } from "react-i18next";

const QUERY_ENSEMBLE_PIPELINE = gql`
query queryEnsembleInfo($id: Int!) {
    ensemble(id: $id) {
        id
        pipelineInfo
    }
}
`

export default ({ensembleId}) => {
    const { t } = useTranslation();
    const {data, loading, error, refetch} = useQuery(
        QUERY_ENSEMBLE_PIPELINE, {
            variables: {id: ensembleId},
        }
    )
    useEffect(() => {
        refetch()
    }, [refetch])

    if (!data && loading) {
        return 'loading'
    }

    if (error) {
        return <div style={{color: 'red'}}>
            {String(error)}, ensemble_id: {ensembleId}
        </div>
    }

    // const pipelineInfo = data.model.pipelineInfo;
    const ensemblePipelines = JSON.parse(data.ensemble.pipelineInfo);

    return (
        <table className="tbl_g table-striped">
            <thead>
            <tr>
                <th>{t('Weight')}</th>
                <th>{t('Step')}</th>
                <th>{t('Details')}</th>
            </tr>
            </thead>
            <tbody>
            {ensemblePipelines ? ensemblePipelines.map(([weight, pipeline], idx) => (
              <>
                {pipeline.map(([key, estimator], subidx) => (
                <tr key={`${idx}-${subidx}`}>
                  {subidx === 0 ? (
                    <td className="txt_l" rowSpan={pipeline.length}>
                      {weight}
                    </td>
                  ) : null}
                  <td className="txt_l">{key}</td>
                  <td className="txt_l">{estimator}</td>
                </tr>
                ))}
              </>
            )): null}
            </tbody>
        </table>
    )
}