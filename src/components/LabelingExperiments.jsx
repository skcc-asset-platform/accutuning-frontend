import React, { useState , useEffect} from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Paper,
    Button,
    Grid,
    Box,
    ButtonGroup,
    Typography,
    Card,
} from '@material-ui/core';
import gql from "graphql-tag"
import { useQuery, useMutation } from "react-apollo";
import SourcesPopup from "./Sources"
import Spinner from '../utils/Spinner'
import { Alert, AlertTitle, Pagination } from '@material-ui/lab';
import AddIcon from '@material-ui/icons/Add';
import { makeStyles } from '@material-ui/core/styles';
import ErrorIcon from '@material-ui/icons/Error';
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom"
import {
    Table,
    TableRow,
    TableCell,
    TableBody,
    TableHead,
    TableContainer,
}
from '../utils/StyledTable'

const useStyles = makeStyles((theme) => ({
    typography: {
        padding: theme.spacing(2),
    },
}));

const QUERY_LABELINGS = gql`
query {
    labelings {
        id
        name
        buildTagStatus
        textProcessingStep
        textClusterN
        textProcessingAlStep
        source {
            name
            uriType
        }
    }
}
`

export default () => {
    const {data, loading, error, refetch} = useQuery(QUERY_LABELINGS,
        {
            pollInterval: 7000,
        }
    );
    const { t } = useTranslation();
    const classes = useStyles();
    const [showSources, setShowSources] = useState(false);
    const [experimentId, setExperimentId] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const handleClickOpen = (id) => {
        setExperimentId(id)
        setDialogOpen(true);
    };
    const handleDialogClose = () => {
        setDialogOpen(false);
    };
    const [deleteExperiment] = useMutation(gql`
    mutation deleteLabeling($id: ID!) {
      deleteLabeling(id: $id) {
        found
        deletedId
      }
    }
    `);

    return (
        <>
            <Paper elevation={3} style={{marginTop: '40px', padding: '40px'}}>
                <Grid
                    justify="space-between" // Add it here :)
                    container
                    // spacing={24}
                >
                    <Grid item>
                        <Typography variant='h2'>
                            <b>Labeling</b>
                        </Typography>
                    </Grid>
                    <Grid item>
                    <Box component="span" ml={1}>
                        <Button endIcon={<AddIcon/>}
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={() => {setShowSources(!showSources); }}>새 labeling 만들기</Button>
                    </Box>
                    </Grid>
                </Grid>
                <Box mt={1} mb={7}>
                    <Typography variant='div' color='textSecondary'>
                        {t('about-labeling')}
                    </Typography>
                </Box>
                <TableContainer component={Card}>
                    <Table size=''>
                        <TableHead>
                        <TableRow>
                            <TableCell>{t('Name')}</TableCell>
                            <TableCell>{t('Status')}</TableCell>
                            <TableCell>{t('Source')}</TableCell>
                            <TableCell>{t('ActiveLearning#')}</TableCell>
                            <TableCell>{t('ClusteringCnt')}</TableCell>
                            <TableCell>{t('Actions')}</TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                        {data && data.labelings && data.labelings.length > 0 ? data.labelings.map(labeling => {
                            return (
                                <React.Fragment key={labeling.id}>
                                    <TableRow>
                                        <TableCell>
                                            {labeling.name ? labeling.name : `Labeling-${labeling.id}`}
                                        </TableCell>
                                        <TableCell>{labeling.buildTagStatus}-{labeling.textProcessingStep}</TableCell>
                                        <TableCell>{labeling.source.name} {labeling.source.uriType}</TableCell>
                                        <TableCell>{labeling.textProcessingAlStep}</TableCell>
                                        <TableCell>{labeling.textClusterN}</TableCell>
                                        <TableCell>
                                            <ButtonGroup spacing={1}>
                                                <Button component={Link} variant="outlined" color="primary"
                                                    to={'/l/' + labeling.id}
                                                    >{t('Detail')}</Button>
                                                <Button variant="outlined" color="primary"
                                                    onClick={() => {}}
                                                    >{t('Stop')}</Button>
                                                <Button variant="outlined" color="primary"
                                                    onClick={() => handleClickOpen(labeling.id)}
                                                    >{t('Delete')}</Button>
                                            </ButtonGroup>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            )
                        }) : <TableRow>
                            <TableCell align='center' colSpan={6}>
                                {loading ? <Spinner>{t('loading...')}</Spinner> : t('No labeling Experiments')}
                            </TableCell>
                        </TableRow>}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            <SourcesPopup
                open={showSources}
                onClose={() => setShowSources(false)}
                createType={'labeling'}
                refreshExperiments={() => {refetch(); setShowSources(false)}}/>
            <Dialog
                open={dialogOpen}
                onClose={handleDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{t('Confirm to Delete')}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {t('Are you sure to delete the selected experiment?')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>
                        {t('Cancel')}
                    </Button>
                    <Button onClick={()=>
                        deleteExperiment({variables: {id: experimentId}}).then(() => {refetch(); setDialogOpen(false)})
                    } color="primary" autoFocus>
                        {t('Confirm')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}