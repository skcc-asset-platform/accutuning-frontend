/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { gql } from 'apollo-boost';
import { useQuery, useMutation} from 'react-apollo';
import { useTranslation } from "react-i18next";

import Pagination from '@material-ui/lab/Pagination';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { Card, CardHeader, CardContent } from '@material-ui/core';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Link, useHistory } from 'react-router-dom';

const ExperimentDeployments = gql`
query experimentDeployments($id: Int! $first: Int $skip: Int) {

    deployments(experimentId: $id, first: $first, skip: $skip) {
        id
        name
        description
        status
        modelType
        modelPk
        allMetricsJson
        createdAt
        testScore
        model {
            id
            trainScore
            validScore
        }
        file:pipelineFp {
            url
            size
            sizeHumanized
            name
        }
    }

    deploymentsCount(experimentId: $id)
}
`


export default ({id, targetDepId, handleTargetDepId}) => {
    const first = process.env.REACT_APP_EX_ROW_COUNT;
    const [page, setPage] = React.useState(1);
    const [skip, setSkip] = useState(0);
    const [pageCount, setPageCount] = useState(1);

    const [deleteDeploymentId, setDeleteDeploymentId] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [deleteDeployment] = useMutation(gql`
    mutation deleteDeployment($id: ID!) {
        deleteDeployment(id: $id) {
            found
            deletedId
        }
    }`
    );

    const history = useHistory();
    const handleClickOpen = (id) => {
        setDeleteDeploymentId(id)
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const handlePage = (event, value) => {
        setPage(value);
        setSkip((value - 1) * process.env.REACT_APP_EX_ROW_COUNT);
    };


    const { data, loading, error, refetch} = useQuery(ExperimentDeployments, { variables: {id: id, first:first, skip:skip}});
    const { t } = useTranslation();

    useEffect(() => {
        if (data && data.deployments.length > 0) {
            // if(urlId) {
            //     alert("urlid y")
            //     handleTargetDepId(urlId);
            // }else{
            //     alert("urlid n")
            //     handleTargetDepId(data.deployments[0].id);
            // }
            setPageCount(Math.ceil(data.deploymentsCount / process.env.REACT_APP_EX_ROW_COUNT));
        }
        refetch()
    }, [refetch, data])


    if (loading) {
        return 'loading'
    }

    if (error) {
        return String(error)
    }

    return (
        <Card variant="outlined" style={{marginBottom: '15px'}}>
            <CardHeader title={t('Deployments')} subheader='여러 개의 배포모델을 비교하고 관리할 수 있습니다.'/>
            <CardContent>
                <table className="tbl_g">
                    <thead>
                        <th>id</th>
                        <th>{t('name')}</th>
                        <th>{t('status')}</th>
                        <th>{t('score(train)')}</th>
                        <th>{t('score(valid)')}</th>
                        <th>{t('score(test)')}</th>
                        {/* <th>{t('createdAt')}</th> */}
                        <th>{t('filesize')}</th>
                        {/* <th>{t('description')}</th> */}
                        <th>{t('Actions')}</th>
                    </thead>
                    <tbody>
                        {data.deployments.length? data.deployments.map(dep => <tr key={dep.id}>
                            <td>{dep.id}</td>
                            <td>
                                <Button component={Link} to={"/r/" + id +"/deployment/" + dep.id}
                                    onClick={() => {
                                    handleTargetDepId(dep.id)}}
                                    style={dep.id === targetDepId ? null : {textDecoration: 'underline', color: 'blue'}}
                                    disabled={dep.id === targetDepId}>{dep.name}</Button>
                            </td>
                            <td>{dep.status}</td>
                            <td>{dep.model.trainScore}</td>
                            <td>{dep.model.validScore}</td>
                            <td>{dep.testScore}</td>
                            {/* <td>{dep.modelType}/{dep.modelPk}</td> */}
                            {/* <td>{dep.createdAt}</td> */}
                            <td>{dep.file.sizeHumanized}</td>
                            {/* <td>{dep.description}</td> */}
                            <td>
                                {/* <Link to={"/r/" + experiment.id +"/deployment/" + dep.id} onClick={() => {
                                    handleTargetDepId(dep.id)}}>{t('Details')}</Link> */}
                                <Button variant="outlined" color="secondary" onClick={() =>handleClickOpen(dep.id)}
                                disabled={dep.status !== 'DONE' && dep.status !== 'ERROR' }>{t('Delete')}</Button>
                            </td>
                        </tr>) : <td colSpan='8'>{t('No deployment yet')}</td>}
                    </tbody>
                </table>
                <Box my={2} display="flex" justifyContent="center">
                            <Pagination count={pageCount} page={page} onChange={handlePage} showFirstButton showLastButton/>
                        </Box>
                <Dialog
                    open={dialogOpen}
                    onClose={handleDialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{t('Confirm to Delete')}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {t('Are you sure to delete the selected deployment?')}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDialogClose}>
                            {t('Cancel')}
                        </Button>
                        <Button onClick={()=>
                            deleteDeployment({variables: {id: deleteDeploymentId}}).then(() => {
                                refetch(); 
                                setDialogOpen(false); 
                                if(deleteDeploymentId === targetDepId){
                                    handleTargetDepId(0);
                                    history.push("/r/" + id +"/deployment/");
                                }
                            })
                        } color="primary" autoFocus>
                            {t('Confirm')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </Card>
    )
}