import React from 'react'
import { gql } from 'apollo-boost'
import { useQuery, useMutation } from 'react-apollo'
import Button from '@material-ui/core/Button';
import StopIcon from '@material-ui/icons/Stop';
import { ButtonGroup, Grid } from '@material-ui/core';


const ProcessesInfo = ({processes, loading}) => {

    const [stopExperimentProcess] = useMutation(gql`
        mutation stopExperimentProcess($id: ID!) {
            stopExperimentProcess(id: $id) {
                __typename
                experimentProcess {
                    __typename
                    id
                    experimentProcessType
                    stoppedAt
                    stopRequest
                }
            }
        }
    `);

    return (
        <>
            <table className="tbl_g">
                <thead>
                <tr>
                    <th>type</th>
                    <th>elapsed</th>
                    <th>stop</th>
                </tr>
                </thead>
                <tbody>
                {processes.length?
                    processes.map(worker => <tr key={worker.id}>
                            <td style={{textAlign: 'left'}}>
                                {worker.experimentProcessType}<br/>
                                <span style={{color: 'gray'}}>{worker.containerUuid}</span><br/>
                                {worker.error ?
                                    <div style={{color: 'red'}}>{`ERROR: ${worker.errorMessage}`}</div>
                                    :
                                    null
                                }
                            </td>
                            <td>
                                {worker.elapsedSec}s
                            </td>
                            <td>
                                {worker.finishedAt ? null
                                    :
                                    <Button disabled={worker.stopRequest} size='small' variant="outlined" color="secondary" startIcon={<StopIcon />} onClick={() => stopExperimentProcess({ variables: {id: worker.id } })}>Stop Process</Button>
                                }
                            </td>
                        </tr>)
                    :
                    <tr><td colSpan={3}>
                        {loading? 'Loading..': 'No task'}
                    </td></tr>
                }
                </tbody>
            </table>
        </>
    )
}


const QUERY_PROCESSES = gql`
query queryProcesses($id: Int!) {
    experiment (id: $id) {
        id
        processes {
            id
            createdAt
            startedAt
            stoppedAt
            finishedAt
            shouldFinishAt
            proceedNext
            stopRequest
            stopReponse
            host
            pid
            killed
            experimentTarget
            experimentProcessType
            containerUuid
            error
            errorMessage
            estimatorsChunkJson
            elapsedSec
        }
    }
}
`

// const containerFields = [
//     'id',
//     // 'containerId',
//     'podName',
//     'createdAt',
//     // 'uuid',
//     'cpuLimit',
//     'memoryLimit',
//     'exited',
//     'status',
// ]

// const processFields = [
//     'id',
//     'experimentProcessType',
//     'experimentTarget',
//     // 'proceedNext',
//     'createdAt',
//     'startedAt',
//     'finishedAt',
//     'stoppedAt',
//     'shouldFinishAt',
//     'containerUuid',
//     // 'host',
//     // 'pid',
//     // 'killed',
//     'stopRequest',
//     'error',
//     'errorMessage',
//     'estimatorsChunkJson'
// ]

export default ({experiment}) => {
    const { data, loading, error } = useQuery(QUERY_PROCESSES, {
        variables: {id: experiment.id},
        pollInterval: 5000,
    })

    const [tabValue, setTabValue] = React.useState('running');
    const handleChange = (event, newTabValue) => {
        setTabValue(newTabValue);
    };

    if (error) return String(error)

    // let containers = (data && data.experiment && data.experiment.containers) ? data.experiment.containers : []
    // if (tabValue === 'running') {
    //     containers = containers.filter(c => c.status !== 'exited')
    // }
    let processes = (data && data.experiment && data.experiment.processes) ? data.experiment.processes : [] 
    if (tabValue === 'running') {
        processes = processes.filter(p => !p.finishedAt)
    }

    return (
        <>

            <Grid container justify="space-between">
                <Grid item>
                    <h2>Tasks</h2>
                </Grid>
                <Grid item>
                <ButtonGroup size="small">
                    <Button disabled={tabValue==='running'} onClick={() => handleChange(null, 'running')}>RUNNING</Button>
                    <Button disabled={tabValue!=='running'} onClick={() => handleChange(null, 'all')}>ALL</Button>
                </ButtonGroup>
                </Grid>
            </Grid>
            <ProcessesInfo processes={processes} loading={loading}/>
        </>
    )
}
