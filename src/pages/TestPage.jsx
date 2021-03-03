import React from 'react';
import gql from "graphql-tag"
import { useQuery, useApolloClient,  useMutation } from "react-apollo";


const TEST_FRAGMENTS = {
    test1: gql`
        fragment ExperimentTarget on ExperimentType {
            id
            targetColumnName
        }
    `,
    test2: gql`
        fragment ExperimentTarget2 on ExperimentType {
            id
            targetColumnName
            metric
        }
    `
};

const TEST_QUERY = gql`
query {
    experiments {
        id
        metric
        estimatorType
        modelsCnt
        doneSlot
        totalSlot
        bestScore
        status
        workerScale
        # createdAt
        # targetColumnName
        ...ExperimentTarget
        dataset:preprocessedDataset {
            id
            name
            featureNames
            processingStatus
        }
        preprocessedDatasets {
            id
            name
        }
        preprocessingCount
    }
}
${TEST_FRAGMENTS.test1}
`

const QueryComponent1 = (props) => {
    const {data, loading, error} = useQuery(gql`query {
    experiments {
            ...ExperimentTarget
            ...ExperimentTarget2
        }
    }
    
    ${TEST_FRAGMENTS.test1}
    ${TEST_FRAGMENTS.test2}
    `);
    console.log('xxx', loading)

    if (loading) return 'loading..'
    if (error) return String(error)


    return (
        <ul>query: {data.experiments.map(e => <li key={e.id}>{e.targetColumnName}</li>)}</ul>
    )
}

const QueryComponent2 = (props) => {
    const [mutateExperiment] = useMutation(gql`
    mutation($id: ID!, $input: PatchExperimentInput!) {
        patchExperiment(id: $id, input: $input) {
            __typename
            experiment {
                id
                __typename
                # metric
                # targetColumnName
            }
        }
    }`)
    const query = gql`query {
        experiments {
            id
            targetColumnName
        }
    }`
    const {data, loading, error} = useQuery(query);

    if (loading) return 'loading..'
    if (error) return String(error)
    // if (mutating) return 'updating'

    const input = {targetColumnName: 'helloxx'}

    return (
        <ul>query: {data.experiments.map(e => <li key={e.id}>
            {e.targetColumnName}
            <button onClick={() => mutateExperiment({
                variables: {id: e.id, input},
                optimisticResponse: {
                    patchExperiment: {
                        __typename: 'PatchExperimentMutation',
                        experiment: {
                            __typename: "ExperimentType",
                            id: e.id,
                            ...input,
                            targetColumnName: 'helloyyy'
                        }
                    }
                },
                update: (proxy, { data }) => {
                    // Read the data from our cache for this query.
                    const ldata = proxy.readQuery({ query });
                    const { experiment } = data.patchExperiment
                    console.log(data, ldata)
                    // console.log(proxy, data)
                    // Write our data back to the cache with the new comment in it
                    const newData = {
                        ...ldata,
                        // experiments: [...data.experiments, experiment]
                        experiments: ldata.experiments.map(content => {
                            if (experiment.id === content.id) {
                                return {
                                    ...content,
                                    ...experiment
                                }
                            }
                            else {
                                return content
                            }
                        })
                    }
                    proxy.writeQuery({ query, data: newData });
                    console.log(newData)
                }
            })}>change</button>
        </li>)}</ul>
    )
}

const QueryComponent3 = (props) => {
    const {loading, error, refetch} = useQuery(TEST_QUERY);
    const client = useApolloClient()

    if (loading) return 'loading..'
    if (error) return String(error)

    return (
        <div>
            <button onClick={() => {
                client.writeFragment({
                    id: 'ExperimentType:1',
                    fragment: gql`
                        fragment experiment on ExperimentType {
                            targetColumnName
                            customLocalVar
                        }
                    `,
                    data: {
                        __typename: 'ExperimentType',
                        targetColumnName: 'helloworld',
                        customLocalVar: 'helloworld',
                    },
                });   
            }}>writedata using writeFragment</button>
            <button onClick={() => {
                const data = client.readFragment({
                    id: 'ExperimentType:1',
                    fragment: gql`
                        fragment experiment on ExperimentType {
                            status
                            customLocalVar
                        }
                    `,
                });
                console.log(data)
            }}>readquery and print to console</button>
            <button onClick={() => {
                const data = client.readQuery({
                    query: gql`
                        query reqdTest {
                            experiments {
                                status
                                customLocalVar
                            }
                        }
                    `,
                });
                console.log(data)
            }}>read-query</button>            
            <button onClick={() => {refetch({fetchPolicy: 'cache-only'})}}>read from server</button>
        </div>
    )
}

export default () => {
    return (
        <div className='container' style={{marginTop: '20px'}}>
            <h2>COMPONENT UPDATE TEST</h2>
            <p>
                query state를 mutation으로 바꾸고 state를 구독하고 있는 컴포넌트가 자동으로 update되는지 확인해봅니다.
                QueryComponent1과 QueryComponent2가 동일한 query를 수행하고 2에서 변경한 내용이 1에도 반영되는지 확인해봅니다.
            </p>
        
            <QueryComponent1/>
            <QueryComponent2/>

            <p>
            3에서 cache를 직접 수정해도 동일하게 변경에 반응하는지 살펴봅니다.
            </p>
            <QueryComponent3/>
        </div>
    )
}
