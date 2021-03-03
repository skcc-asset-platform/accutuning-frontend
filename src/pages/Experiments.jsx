import React from 'react';
import {
    Switch,
    Route,
    useRouteMatch
} from "react-router-dom";
import Experiments from '../components/Experiments'
import LabelingExperiments from '../components/LabelingExperiments'
import ClusteringExperiments from '../components/ClusteringExperiments'
import ExperimentDetail from '../components/ExperimentDetail'
import LabelingDetail from '../components/LabelingDetail'
import ClusteringDetail from '../components/ClusteringDetail'
import { connect } from 'react-redux';
import { Container } from '@material-ui/core';


export default connect(null, null)(({dispatch}) => {
    const match = useRouteMatch();

    return (
        <main>
            <Container maxWidth={"xl"}>
            <Switch>
                <Route exact path={match.path}>
                    <Experiments/>
                    <LabelingExperiments/>
                    <ClusteringExperiments/>
                </Route>
                <Route path={`${match.path}r/:id/`}>
                    <ExperimentDetail/>
                </Route>
                <Route path={`${match.path}l/:id/`}>
                    <LabelingDetail/>
                </Route>
                <Route path={`${match.path}c/:id/`}>
                    <ClusteringDetail/>
                </Route>
                <Route path="*">
                    <h3>No pages</h3>
                </Route>
            </Switch>
            </Container>
        </main>
    )
})
