/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useEffect} from 'react';
import { gql } from 'apollo-boost';
import { useQuery } from 'react-apollo';
import { useTranslation } from "react-i18next";

const QUERY_MODEL_PIPELINE = gql`
query queryModelInfo($id: Int!) {
    model(id: $id) {
        id
        pipelineInfo
    }
}
`

export default ({modelId}) => {
    const { t } = useTranslation();
    const {data, loading, error, refetch} = useQuery(
        QUERY_MODEL_PIPELINE, {
            variables: {id: modelId},
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
            {String(error)}, model_id: {modelId}
        </div>
    }

    // const pipelineInfo = data.model.pipelineInfo;
    const pipelineInfo = JSON.parse(data.model.pipelineInfo);

    return (
        <table className="tbl_g table-striped">
            <thead>
            <tr>
                <th>{t('Step')}</th>
                <th>{t('Details')}</th>
            </tr>
            </thead>
            <tbody>
            {pipelineInfo ? pipelineInfo.map(([key, repr]) => (
                <tr>
                    <td className="txt_l">{key}</td>
                    <td className="txt_l">{repr}</td>
                </tr>
            )) : null}
            </tbody>
        </table>
    )
}