import React, { useState , useEffect} from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Paper,
    Button,
    ButtonGroup,
    Grid,
    Box,
    Popover,
    Typography,
    IconButton,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
} from '@material-ui/core';
import gql from "graphql-tag"
import { useQuery, useMutation } from "react-apollo";
import SourcesPopup from "./Sources"
import Spinner from '../utils/Spinner'
import { Link } from "react-router-dom"
import "../css/style.css"
import { Alert, AlertTitle, Pagination } from '@material-ui/lab';
import AddIcon from '@material-ui/icons/Add';
import { makeStyles } from '@material-ui/core/styles';
import ErrorIcon from '@material-ui/icons/Error';
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
    typography: {
        padding: theme.spacing(2),
    },
}));


// const MUTATION_TOKEN = gql`
// mutation verifyToken($token: String!) {
//     verifyToken(token: $token) {
//       __typename
//       payload
//     }
// }
// `

const QUERY_EXPERIMENTS = gql`
query ($search: String $first: Int $skip: Int $estimatorType: String){
    env {
        activeContainerCount
        totalContainerCount
        licenseIsValid
    }
    experimentCount
    pagingCount (search: $search, estimatorType:$estimatorType)
    availableEstimatorTypes
    experiments (search: $search, first: $first, skip: $skip, estimatorType: $estimatorType){
        id
        metric
        estimatorType
        modelsCnt
        doneSlot
        totalSlot
        bestScore
        status
        name
        lastError
        # createdAt
        targetColumnName
        dataset {
            id
            name
            featureNames
            processingStatus
        }
        deploymentsCnt
    }
    loginUser {
        isSuperuser
        isActive
    }
}
`

export default () => {

    const first = process.env.REACT_APP_EX_ROW_COUNT;
    const [page, setPage] = React.useState(1);
    const [skip, setSkip] = useState(0);
    const [columnFilterText, setColumnFilterText] = useState(null)
    const [pageCount, setPageCount] = useState(1);
    const [columnFilterEstimatorType, setColumnFilterEstimatorType] = useState(null);

    const {data, loading, error, refetch} = useQuery(
        QUERY_EXPERIMENTS,
        {
            pollInterval: 7000,
            variables: {first: first, skip: skip, search: columnFilterText, estimatorType: columnFilterEstimatorType},
            // onCompleted: () => {
            //     console.log('hello token')
            //     verifyToekn({variables: {token: localStorage.getItem('jwt')}}).then((resp) => {
            //         if (resp.data && resp.data.verifyToken) {
            //             var seconds = (new Date(resp.data.verifyToken.payload.exp * 1000) - new Date())/1000;
            //             console.log(seconds)
            //         }
            //     })
            // },
            // context: {
            //     headers: localStorage.getItem('jwt') ? {
            //         'authorization': `JWT ${localStorage.getItem('jwt')}`
            //     } : null
            // },
        }
    );

    useEffect(() => {
        if (data) {
            setPageCount(Math.ceil(data.pagingCount / process.env.REACT_APP_EX_ROW_COUNT));
        }
    }, [data]);

    const handlePage = (event, value) => {
        setPage(value);
        setSkip((value - 1) * process.env.REACT_APP_EX_ROW_COUNT);
    };


    // console.log("first" ,first);
    // console.log("skip" ,skip);
    // console.log("page" ,page);
    // console.log("pageCount" ,pageCount);

    const [experimentError, setExperimentError] = useState(null);
    const [showSources, setShowSources] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [experimentId, setExperimentId] = useState(0);

    const handleClickOpen = (id) => {
        setExperimentId(id)
        setDialogOpen(true);
    };

    const handleDataType = (value) => {
        setColumnFilterEstimatorType(value);
        setPage(1);
        setSkip(0);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };
    const { t } = useTranslation();
    const classes = useStyles();
    const handleClick = (event, message) => {
        setExperimentError(message)
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;



    const [startExperiment] = useMutation(gql`
    mutation startExperiment($id: ID!) {
      startExperiment(id: $id) {
        __typename
        experiment {
          __typename
          id
          status
          startedAt
        }
      }
    }
  `);
    const [stopExperiment] = useMutation(gql`
    mutation stopExperiment($id: ID!) {
      stopExperiment(id: $id) {
        __typename
        experiment {
          __typename
          id
          status
          stoppedAt
        }
      }
    }
  `);
    const [deleteExperiment] = useMutation(gql`
    mutation deleteExperiment($id: ID!) {
      deleteExperiment(id: $id) {
        found
        deletedId
      }
    }
  `);

    if (error) {
        if (
            String(error).indexOf("Error: GraphQL error: Signature has expired") >= 0
        ) {
            window.location = process.env.PUBLIC_URL
        }

        return String(error)
    }

    return (
        <>
            {/* <section className="section_content"> */}
            <Paper elevation={3} style={{padding: '40px'}}>
                <Grid
                    justify="space-between" // Add it here :)
                    container
                    // spacing={24}
                >
                    <Grid item>
                        <Typography variant='h2'>
                            <b>Supervised</b>
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Paper elevation={3} style={{padding: '4px 40px 4px 40px', marginBottom: '15px'}}>
                            <Box color="text.secondary">
                                {data && data.env ?
                                    <>
                                        {t('AVAILABLE JOB COUNT')} : <b>{`${data.env.totalContainerCount - data.env.activeContainerCount}`}</b>
                                    </>
                                    :
                                    'loading...'
                                }
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
                <Typography variant='div' color='textSecondary'>
                    {t('about-experiment')}
                </Typography>

                {data && data.env && !data.env.licenseIsValid ?
                    <Alert severity="error">
                        <AlertTitle>License file is required</AlertTitle>
                        Please register your file — <Link to='/license'>check it out!</Link>
                    </Alert>
                    :
                    null
                }

                <div className="area_scroll">
                    <Box display="flex" justifyContent="flex-end" mt={2}>
                    {data && data.availableEstimatorTypes ?
                        <FormControl variant="outlined" size="small" style={{minWidth: 150}}>
                            <InputLabel size="small" id="demo-simple-select-outlined-label">{t('TYPE')}</InputLabel>
                                <Select
                                    size="small"
                                    labelId="demo-simple-select-outlined-label"
                                    id="demo-simple-select-outlined"
                                    value={columnFilterEstimatorType}
                                    onChange={e => handleDataType(e.target.value)}
                                    label="TYPE"
                                    >
                                    <MenuItem value="">ALL</MenuItem>
                                    <MenuItem value={data.availableEstimatorTypes[0]}>{data.availableEstimatorTypes[0]}</MenuItem>
                                    <MenuItem value={data.availableEstimatorTypes[1]}>{data.availableEstimatorTypes[1]}</MenuItem>
                                    <MenuItem value={data.availableEstimatorTypes[2]}>{data.availableEstimatorTypes[2]}</MenuItem>
                                </Select>
                            </FormControl>
                    : null }
                        <Box component="span" ml={1}>
                            <TextField
                                size="small"
                                id="outlined-basic"
                                label={t('SEARCH')}
                                variant="outlined"
                                value={columnFilterText}
                                onChange={(e) => setColumnFilterText(e.target.value)}
                            />
                        </Box>
                        <Box component="span" ml={1}>
                            <Button endIcon={<AddIcon/>}
                                variant="contained"
                                color="primary"
                                size="large"
                                onClick={() => {setShowSources(!showSources); }}>{t('New Experiment')}</Button>
                        </Box>
                    </Box>
                    <table className="tbl_g">
                        <thead>
                        <tr>
                            <th className="txt_l">{t('Name')}</th>
                            <th className="txt_l">{t('Dataset')}</th>
                            <th>{t('Status')}</th>
                            <th>{t('EstimatorType')}<br/>{t('Metric')}</th>
                            <th>{t('Score')}</th>
                            <th>{t('ModelCnt')}</th>
                            <th>{t('DepCnt')}</th>
                            {/* <th>Total<br/>Slot</th> */}
                            <th>{t('Actions')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data && data.experiments && data.experiments.length > 0 ? data.experiments.map(experiment => {
                            const TdField = ({ name }) => <td>{`${experiment[name] || ''}`}</td>

                            if (!experiment) {
                                return null
                            }

                            return (
                                <React.Fragment key={experiment.id}>
                                    <tr onClick={() => {
                                        // history.push('/r/' + experiment.id)
                                        // setSelectedExperimentId(experiment.id);
                                    }}>
                                        <td className="txt_l">
                                            {experiment.status !== 'creating' ?
                                                <Link className="link_experiment" to={'/r/' + experiment.id}>{experiment.name}</Link>
                                                :
                                                <>{experiment.name ? experiment.name : `Experiment-${experiment.id}`}</>
                                            }
                                        </td>
                                        <td className="txt_l">
                                            {
                                                experiment.status !== 'creating' ? (
                                                    <Link className="link_experiment" to={'/r/' + experiment.id}>
                                                        {experiment.dataset ? <>
                                                                {experiment.dataset.name}
                                                                <br/>
                                                                {experiment.dataset.processingStatus === 'READY' || experiment.dataset.processingStatus === 'FINISHED' ?
                                                                    <>
                                                                        <span className="badge_link" fontSize="0.7em" ml={1}>({experiment.targetColumnName ?
                                                                            experiment.dataset.featureNames.length - 1 :
                                                                            experiment.dataset.featureNames.length } {t('features')}</span>,
                                                                                <span className="badge_link" fontSize="0.7em" ml={1}>
                                                                            {experiment.targetColumnName ? `${t('target')}: ${experiment.targetColumnName}` : null})
                                                                        </span>
                                                                    </>
                                                                    :
                                                                    `processing(${experiment.dataset.processingStatus})`
                                                                }
                                                            </>
                                                            :
                                                            null
                                                        }
                                                        {/*<Badge fontSize="0.7em" ml={1}>*/}
                                                        {/*    status:{experiment.dataset.processingStatus}*/}
                                                        {/*</Badge>*/}
                                                    </Link>
                                                ) : <>
                                                    {experiment.dataset ? <>
                                                        {experiment.dataset.name}
                                                        <br/>
                                                        ({experiment.dataset.processingStatus})
                                                        </>
                                                        :
                                                        null
                                                    }
                                                </>
                                            }
                                        </td>
                                        <td>
                                            <Link to={'/r/' + experiment.id}>{experiment.status ? experiment.status.toUpperCase() : 'UNKNOWN'}</Link>
                                            {experiment.lastError ?
                                                <IconButton size="small" aria-label="delete" onClick={(e) => handleClick(e, experiment.lastError)}>
                                                    <ErrorIcon size="small" style={{color: 'rgb(96, 120, 213)', fontSize: '1.1rem'}}/>
                                                </IconButton>
                                                :
                                                null
                                            }
                                            {experiment.status === 'learning' ?
                                                '(' + (
                                                    parseInt(experiment.doneSlot/experiment.totalSlot*100) > 100 ?
                                                        100
                                                        :
                                                        parseInt(experiment.doneSlot/experiment.totalSlot*100)
                                                )  + '%)'
                                                :
                                                null
                                            }
                                        </td>
                                        {/* {fields.map(name => <TdField key={name} name={name} />)} */}
                                        <td>
                                            {`${experiment.estimatorType || ''}`}
                                            {experiment.estimatorType === 'CLUSTERING' ?
                                                null
                                                :
                                                <>
                                                    <br/>
                                                    {`${experiment.metric || ''}`}
                                                </>
                                            }
                                        </td>
                                        <TdField name="bestScore"/>
                                        <TdField name="modelsCnt"/>
                                        <TdField name="deploymentsCnt"/>
                                        {/* <td>
                                            {experiment.deploymentsCnt ? <a href={`/r/${experiment.id}/deployment/`}><CheckCircleIcon/></a>: null}
                                        </td> */}
                                        <td className="td_action">
                                            <ButtonGroup>
                                                <Button variant="outlined" color="primary" onClick={() => {startExperiment({variables: {id: experiment.id}}); }} disabled={experiment.status !== 'ready'}>{t('Start')}</Button>
                                                <Button variant="outlined" color="secondary" onClick={() => {stopExperiment({variables: {id: experiment.id}}); }} disabled={experiment.status !== 'learning'}>{t('Stop')}</Button>
                                                <Button variant="outlined" color="primary" onClick={() =>handleClickOpen(experiment.id)}
                                                    disabled={experiment.status !== 'finished' && experiment.status !== 'ready' }>{t('Delete')}</Button>
                                            </ButtonGroup>
                                        </td>
                                        {/* <td>{experiment.id === selected ? 'select' : <a href='javascript:;' onClick={() => dispatch(selectExperiment(experiment.id))}>select</a>}</td> */}
                                    </tr>
                                </React.Fragment>
                            )
                        }) : <tr><td className="ta_c" colSpan={8}>
                            {loading ? <Spinner>{t('loading...')}</Spinner> : t('No experiments')}
                        </td></tr>}
                        </tbody>
                    </table>
                </div>
                <Box my={2} display="flex" justifyContent="center">
                    <Pagination count={pageCount} page={page} onChange={handlePage} showFirstButton showLastButton/>
                </Box>
            </Paper>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Typography className={classes.typography}>
                    Message: {experimentError}
                </Typography>
            </Popover>
            <SourcesPopup
                open={showSources}
                onClose={() => setShowSources(false)}
                createType={'experiment'}
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
