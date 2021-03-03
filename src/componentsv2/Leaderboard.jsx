import React from 'react'
import { useState, useEffect } from 'react';
// import { useQuery, useMutation, gql } from '@apollo/client';
import { useQuery, useMutation } from "react-apollo";
import gql from "graphql-tag";
import {
    Button,
    Box,
    ButtonGroup,
    Chip,
    CircularProgress,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
 } from '@material-ui/core';
import ExperimentPreparationInfo from './ExperimentPreparationInfo';


const MON_QUERY = gql`
query leaderboard($id: Int!) {
    experiment(id: $id) {
        id
        modelsCnt
        leaderboardEstimatorGroup {
          estimatorName
          count
          trainScore
          validScore
          lastCreatedAt
          job
          jobElapsedSec
        }
        leaderboard {
          id
          estimatorName
          score
          trainScore
          validScore
          file {
            size
            sizeHumanized
          }
          allMetricsStatus
          evaluationStatStatus
          deployedStatus
        }
        processes {
          id
          currentTrial
        }
    }
}
`;


export default ({id}) => {
    const { loading, error, data } = useQuery(MON_QUERY, {variables: {id}});

    if (loading) return 'loading..'
    if (error) return String(error)

    return (
        <Grid container spacing={1}>
            <Grid item xs={9}>
                <Typography>
                    <Box mb={2}>
                        <Typography variant='h5'>JOB DASHBOARD</Typography>
                    </Box>
                {data && data.experiment ?
                    <TableContainer component={Paper}>
                        <Table size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell align='right'>Train</TableCell>
                                    <TableCell align='right'>Valid</TableCell>
                                    <TableCell align='right'>Models</TableCell>
                                    <TableCell>Updated</TableCell>
                                    <TableCell>Job</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                            {data.experiment.leaderboardEstimatorGroup.map(e =>{
                                return <TableRow>
                                    <TableCell>{e.estimatorName}</TableCell>
                                    <TableCell align='right'>{e.trainScore}</TableCell>
                                    <TableCell align='right'><b>{e.validScore}</b></TableCell>
                                    <TableCell align='right'>{e.count}</TableCell>
                                    <TableCell>{e.lastCreatedAt}</TableCell>
                                    <TableCell>
                                        {/* <ButtonGroup size='small' color='primary' variant='contained'>
                                            <Button>Evaluation</Button>
                                            <Button>Deploy</Button>
                                        </ButtonGroup> */}
                                        {e.job ?
                                            <Chip size='small' label={e.job} icon={<CircularProgress size='0.8rem'/>} />
                                            :
                                            null
                                        }
                                    </TableCell>
                                </TableRow>
                            })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    :
                    null
                }
                </Typography>
            </Grid>
            <Grid item xs={3}>
                <Box mb={2}>
                    <Typography variant='h5'>DATA PREPARATION</Typography>
                </Box>
                <ExperimentPreparationInfo id={id}/>
            </Grid>
            <Grid item xs={12}>
                <Box mt={2} mb={1}>
                    <Typography variant='h5'>LEADERBOARD</Typography>
                    <Typography color='textSecondary'>{data.experiment.modelsCnt} models are generated. Below list is limited to show until 100.
                    </Typography>
                </Box>
                <TableContainer component={Paper} mt={2}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell align='right'>RANK</TableCell>
                            <TableCell>Estimator</TableCell>
                            <TableCell align='right'>Score(Train)</TableCell>
                            <TableCell align='right'>Score(Valid)</TableCell>
                            <TableCell align='right'>Filesize</TableCell>
                            <TableCell>Pipeline</TableCell>
                            <TableCell>Evaluation</TableCell>
                            <TableCell>Deploy</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.experiment.leaderboard.map((m,idx) =><TableRow>
                            <TableCell align='right'>{idx+1}</TableCell>
                            <TableCell>{m.estimatorName}</TableCell>
                            <TableCell align='right'>{m.trainScore}</TableCell>
                            <TableCell align='right'>{m.validScore}</TableCell>
                            <TableCell align='right'>{m.file.sizeHumanized}</TableCell>
                            <TableCell><Button size='small' variant='outlined' color='primary'>VIEW</Button></TableCell>
                            <TableCell><Button size='small' variant='contained' color='primary'>VIEW</Button></TableCell>
                            <TableCell><Button size='small' variant='contained' color='primary'>DEPLOY</Button></TableCell>
                        </TableRow>)}
                    </TableBody>
                </Table>
                </TableContainer>
            </Grid>
        </Grid>
    )
}