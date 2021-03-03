/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useEffect, useState} from 'react';
import { gql } from 'apollo-boost';
import { useQuery } from 'react-apollo';
import SafeSrcDocIframe from 'react-safe-src-doc-iframe';
import Spinner from '../utils/Spinner'


const QUERY_MODEL_EXPL = gql`
query queryModelExpl($id: Int!) {
    baseModel (id: $id) {
        id
        status:limeHtmlStatus
        limeHtml
    }
}
`


export default ({modelId}) => {
    const { data, loading, error, refetch, startPolling, stopPolling} = useQuery(QUERY_MODEL_EXPL, { variables: {id: modelId}});
    const [ polling, setPolling ] = useState(false);

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

    return (
        <div>
            <div style={{textAlign: 'right'}}>
                {polling ? <Spinner/> : null}
                <span>{data ? `status: ${data.baseModel.status}`: null}</span>
            </div>
    
            {!polling && data && data.baseModel ? 
                <SafeSrcDocIframe
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                srcDoc={data.baseModel.limeHtml}
                border="0"
                title="helloworld"
                width="100%"
                height="400"
                style={{ border: '1' }}
                    />
                    : null}
        </div>
    )
}