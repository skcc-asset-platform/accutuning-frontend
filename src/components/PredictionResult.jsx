import React from 'react'
import { gql } from 'apollo-boost';
import { useQuery } from 'react-apollo';
import PredictionPresentation from './PredictionPresentation'

const QUERY_PRED = gql`
query queryPrediction($id: Int!) {
    prediction(id: $id) {
        inputJson
        output
        done
        duration
        error
        errorMessage
        limeHtml
    }
}
`

export default ({predictionPk}) => {
    const { data, loading, error } = useQuery(QUERY_PRED, { variables: {id: predictionPk}});

    if (loading) return 'loading'
    if (error) return String(error)


    return (
        <>
            {data && data.prediction?
                <PredictionPresentation data={data}/>
                :
                null
            }
        </>
    )
}