import React from 'react'
import { useMutation } from 'react-apollo';
import { gql } from 'apollo-boost';

export default (props) => {
    const [mutate, {loading, error}] = useMutation(gql`
    mutation($id: ID!, $input: PatchColumnInput!) {
        patchColumn(id: $id, input: $input) {
            column {
                id
                __typename
            }
        }
    }`)

    const update = (data) => {
        const variables = {id: props.pk, input: data}
        return mutate({variables})
    }

    return <FieldUpdaterWrapper
        update={update}
        loading={loading}
        error={error}
        {...props}/>
}