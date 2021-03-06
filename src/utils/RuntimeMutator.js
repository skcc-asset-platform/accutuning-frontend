import React from 'react'
import { useMutation } from 'react-apollo';
import { gql } from 'apollo-boost';
import FieldUpdater from './FieldUpdater'

export default (props) => {
    const [mutate, {loading, error}] = useMutation(gql`
    mutation($id: ID!, $input: PatchExperimentInput!) {
        patchExperiment(id: $id, input: $input) {
            experiment {
                id
                __typename
            }
        }
    }`)

    const update = (data) => {
        const variables = {id: props.pk, input: data}
        return mutate({variables})
    }

    return <FieldUpdater
        update={update}
        loading={loading}
        error={error}
        {...props}/>
}
