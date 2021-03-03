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


export default ({predictionPk, onLoad}) => {
    const { data, loading, error } = useQuery(QUERY_PRED, { variables: {id: predictionPk}, pollInterval: 3000 });

    if (loading) return 'loading'
    if (error) return String(error)

    if (data && data.prediction && data.prediction.done) {
        onLoad()
    }

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