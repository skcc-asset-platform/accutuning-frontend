import React from 'react';
import { gql } from 'apollo-boost';
import { useQuery, useApolloClient } from 'react-apollo';

const QUERY_PREDICTION_RESULT = gql`
query experimentDeployment($id: Int!) {
    deployment(experimentId: $id) {
        id
        status
        modelType
        modelPk
        createdAt
        file
        allMetricsJson
        visualizedObjects {
            id
            img
            title
        }
        predictions {
            inputJson
            output
            done
            duration
            error
            errorMessage
        }
    }
    experiment(id: $id) {
        id
        # dataset {
        #     id
        #     preprocessorFile
        #     preprocessorInfo
        # }
        # preprocessorsInfo
        preprocessedDatasets {
            id
            preprocessorFile {
                url
            }
            preprocessorInfo
        }
        targetColumnName
        dataset {
            id
            columns {
                id
                name
                datatype
                mostFrequent
                min
                max
                # isTarget
            }
        }
    }
}
`


export default ({deploymentId}) => {
    return (
        <h2>{t('Prediction Result')}</h2>
    )
}