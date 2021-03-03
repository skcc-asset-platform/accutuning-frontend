import React, {useEffect} from 'react'
import { gql } from 'apollo-boost'
import { useQuery } from 'react-apollo'

const QUERY_EXPERIMENT_MONITOR = gql`
query queryExperimentMonitor($id: Int!) {
    experiment (id: $id) {
        id
        # dumpJson
        workspacePath
        workspaceName
        workspaceFiles
        processes {
            id
            experimentProcessType
            workspacePath
            workspaceName
            containerUuid
            defaultDockerCommand
            estimatorsChunkJson
        }
    }
}
`

const ExperimentMonitorDetail = ({experiment}) => {
    return (
        <div>
            processes:
            <ul>
            {experiment.processes.map(rp => <li key={rp.id}>
                {rp.id} / {rp.experimentProcessType} / {rp.containerUuid} / {rp.estimatorsChunkJson}
            <pre style={{padding: '10px'}}>
                {rp.defaultDockerCommand}
            </pre>

            </li>)}
            </ul>
            files:
            <ul>
                {experiment.workspaceFiles.map(filepath => 
                    <li key={filepath}>{filepath}</li>
                )}
            </ul>
        </div>
    )
}


export default ({experiment}) => {
    const { data, loading, error, refetch } = useQuery(QUERY_EXPERIMENT_MONITOR, {
        variables: {id: experiment.id},
        pollInterval: 5000,
    })

    useEffect(() => {
        refetch()
    }, [refetch])

    if (error) return String(error)

    return (
        <section className="section_content">
            <h3>Experiment Monitor (for debugging) {loading ? <span>(loading..)</span> : null}</h3>
            {data && data.experiment ?
                <ExperimentMonitorDetail experiment={data.experiment}/>
                :
                null
            }
        </section>
    )
}