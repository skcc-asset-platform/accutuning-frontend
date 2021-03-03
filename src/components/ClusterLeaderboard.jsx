/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useEffect, useState} from 'react';
import { gql } from 'apollo-boost';
import { useQuery } from 'react-apollo';
import Spinner from '../utils/Spinner'
import { useTranslation } from "react-i18next";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
    table: {
      minWidth: 650,
    },
});


const Accordion = withStyles({
    root: {
      border: '1px solid rgba(0, 0, 0, .125)',
      boxShadow: 'none',
      '&:not(:last-child)': {
        borderBottom: 0,
      },
      '&:before': {
        display: 'none',
      },
      '&$expanded': {
        margin: 'auto',
      },
    },
    expanded: {},
})(MuiAccordion);


const AccordionSummary = withStyles({
    root: {
        backgroundColor: 'rgba(0, 0, 0, .03)',
        borderBottom: '1px solid rgba(0, 0, 0, .125)',
        marginBottom: -1,
        minHeight: 56,
        '&$expanded': {
        minHeight: 56,
        },
    },
    content: {
        '&$expanded': {
        margin: '12px 0',
        },
    },
    expanded: {},
})(MuiAccordionSummary);


const AccordionDetails = withStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
}))(MuiAccordionDetails);


const QUERY_CLUSTER_MODELS = gql`
query queryClusterModels($id: Int!) {
    experiment:clusteringExperiment (id: $id) {
      status
      modelsCnt
      metric
      models: modelbaseSet {
        id
        score
        estimatorName
        searchspaceJson
        __typename
      }
      id
      __typename
    }
  }
`

export default ({pk}) => {
    const { data, loading, error, refetch, startPolling } = useQuery(QUERY_CLUSTER_MODELS, { variables: {id: pk}});
    const [ polling, setPolling ] = useState(false);
    const { t } = useTranslation();
    const classes = useStyles();

    useEffect(() => {
        refetch()
    }, [refetch])

    if (!data && loading) {
        return 'loading'
    }

    if (data) {
        if (data.experiment.status === 'learning' || data.experiment.status === 'clustering') {
            if (!polling) {
                startPolling(3000)
                setPolling(true)
            }
        }
        else {
            if (polling) {
                setPolling(false)
                // startPolling(10000)
                refetch()
            }
        }
    }

    if (error) {
        return <div style={{color: 'red'}}>
            {String(error)}, pk: {pk}
        </div>
    }

    return (
        <Accordion square expanded={true}>
        <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
          <Typography>
            {t('Leaderboard')}: {data.experiment.models.length} models
            {polling ? <Spinner/> : null}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
            <TableContainer component={'div'}>
                <Table className={classes.table} aria-label="cluster leaderboard table">
                    <TableHead>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell>{t('Algorithm')}</TableCell>
                        <TableCell>{t('Dim.Reduction')}</TableCell>
                        <TableCell>{t('Scaling')}</TableCell>
                        <TableCell>{t('Num.Cluster')}</TableCell>
                        <TableCell align="right">{t('Score')}</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.experiment.models.map(
                            (k, idx) => {
                                const sc = JSON.parse(k.searchspaceJson)
                                return (
                                    <TableRow key={idx}>
                                        <TableCell>{idx}</TableCell>
                                        <TableCell>{k.estimatorName}</TableCell>
                                        <TableCell>{sc.reduction_alg}</TableCell>
                                        <TableCell>{sc.normalize_method}</TableCell>
                                        <TableCell>{sc.n_cluster}</TableCell>
                                        <TableCell align="right">{k.score}</TableCell>
                                    </TableRow>
                                )
                            }
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </AccordionDetails>
        </Accordion>
    )
}