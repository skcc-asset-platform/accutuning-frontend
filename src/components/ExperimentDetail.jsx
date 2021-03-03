import React from "react";
import { useState } from "react";
import { useQuery, useMutation } from "react-apollo";
import {
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams,
  useLocation,
  Redirect,
} from "react-router-dom";
import gql from "graphql-tag";
import ExperimentDatasets from "./ExperimentDatasets";
import ExperimentLeaderboard from "./ExperimentLeaderboard";
// import ExperimentTrials from "./ExperimentTrials";
import ExperimentProcesses from "./ExperimentProcesses";
// import ExperimentMonitor from "./ExperimentMonitor";
import ExperimentDeployment from "./ExperimentDeployment";
import ExperimentDeployments from "./ExperimentDeployments";
// import ExperimentEvents from "./ExperimentEvents";
import ExperimentClusterResult from "./ExperimentClusterResult";
import ExperimentStart from "./ExperimentStart";
import Spinner from "../utils/Spinner";
import { toastError } from "../utils";
import {
  Popover,
  Button,
  CircularProgress,
  Chip,
  Paper,
  Tabs,
  Tab,
  AppBar,
  Typography,
  IconButton,
  Grid,
  TextField,
} from '@material-ui/core';
import Modal from "react-modal";
import { withStyles, makeStyles } from '@material-ui/core/styles';
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import EditIcon from '@material-ui/icons/Edit';
import DoneIcon from '@material-ui/icons/Done';
import ErrorIcon from '@material-ui/icons/Error';
import { useTranslation } from "react-i18next";
import { ExperimentDetail, EXPERIMENT_QUERY, MON_QUERY } from '../componentsv2/ExperimentDetail'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    flexGrow: 1,
    padding: '40px',
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  link: {
    display: 'flex',
  },
  icon: {
    marginRight: theme.spacing(0.5),
    width: 20,
    height: 20,
  },
  chip: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0.5),
    },
  },
  typography: {
    padding: theme.spacing(2),
},

}));


const RunningJobs = ({pk, jobCnt}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const classes = useStyles();
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  // const { t } = useTranslation();

  return (
    <>
      {
        jobCnt ?
          <Chip
            size="small"
            color="primary"
            label={`${jobCnt} Jobs`}
            icon={<CircularProgress size="1.0rem" color="default" />}
            onClick={handleClick}
          />
          :
          <Chip
            size="small"
            variant="outlined"
            color="primary"
            label={`${jobCnt} Jobs`}
            onClick={handleClick}
          />
      }
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
          <ExperimentProcesses experiment={{id: pk}}/>
        </Typography>
      </Popover>
    </>
  )
}

const EditableHeading = ({experiment}) => {
  const [editTitle, toggleEditTitle] = useState(false)
  const { t } = useTranslation();
  const [experimentName, setExperimentName] = useState(experiment.name)
  const [update] = useMutation(gql`
    mutation updateExperimentName($id: ID!, $input: PatchExperimentInput!) {
      patchExperiment(id: $id, input: $input) {
        experiment {
          id
          name
          __typename
        }
      }
    }
  `);

  return (
    <div className="area_tit">
      {editTitle ?
        <form noValidate autoComplete="off">
          <TextField label={t("Enter a experiment name")}
              value={experimentName}
              style={{width: '400px'}}
              onChange={(e) => setExperimentName(e.target.value)}
              placeholder={`experiment-${experiment.id}`}/>
          <Button size="large" variant="contained" color="primary" aria-label="contained primary button group"
                  style={{ marginLeft: '15px' }}
                  onClick={(e) => {
                      update({ variables: { id: experiment.id, input: { name: experimentName } } }).then(
                        toggleEditTitle(!editTitle)
                      )
                  }}
              >{t('Save')}</Button>
              <Button size="large" variant="contained" color="secondary" style={{ marginLeft: '2px' }}
                  onClick={() => toggleEditTitle(!editTitle)}
              >{t('Cancel')}</Button>
          </form>
          :
          <h3 className="tit_table">  
            {/* <a href="/" style={{marginRight: '4px'}}>
              <HomeIcon size="large"/>
            </a> */}
            {experiment.name ?
                <>{experiment.name}</>
                :
                <>{t('Experiment - ')}{experiment.id}</>
            }
            <IconButton color="primary" aria-label="upload picture" component="span" onClick={() => toggleEditTitle(!editTitle)}>
              <EditIcon/>
            </IconButton>
            <RunningJobs pk={experiment.id} jobCnt={experiment.processes.filter(e => !e.finishedAt).length}/>
          </h3>
      }
    </div>
  )
}


const modalStyles = {
  content: {
    position: "relative",
    border: "0",
    top: "auto",
    left: "auto",
    right: "auto",
    bottom: "auto",
    // marginRight           : '-50%',
    // transform             : 'translate(-50%, -50%)'
  },
};

// const EXPERIMENT_QUERY = gql`
//   query experimentDetail($id: Int!) {
//     experiment(id: $id) {
//       id
//       name
//       status
//       createdAt
//       estimatorType
//       ensembleSize
//       includeEstimators
//       includeEstimatorsJson
//       availableEstimators
//       availableMetrics
//       metric
//       bestScore
//       randomState
//       resamplingStrategy
//       resamplingStrategyCvFolds
//       resamplingStrategyHoldoutTrainSize
//       resamplingStrategyPartialcvShuffle
//       startedAt
//       stoppedAt
//       splitColumnName
//       splitColumnValueForValid
//       splitColumnValueForTest
//       splitTestdataRate
//       timeout
//       maxEvalTime
//       doneSlot
//       totalSlot
//       workerScale
//       modelsCnt
//       useOptuna
//       useAlphaautoml
//       useEnsemble
//       useEarlystopping
//       logLevel
//       includeOneHotEncoding
//       includeVarianceThreshold
//       includeFeatureEngineerings
//       includeFeatureEngineeringsJson
//       includeScalingMethods
//       includeScalingMethodsJson
//       availableScalingMethods
//       availableFeatureEngineerings
//       splitTestdataRate
//       modelsCnt
//       targetColumnName
//       clusterOptimizer
//       numClusters
//       availableClusterAlgorithms
//       includeClusterAlgorithms
//       includeClusterAlgorithmsJson
//       availableClusterDimReductionAlgs
//       includeClusterDimReductionAlgs
//       includeClusterDimReductionAlgsJson
//       useSampling
//       samplingRatio
//       containers {
//         id
//       }
//       dataset: preprocessedDataset {
//         id
//         name
//         colCount
//         rowCount
//       }
//       processes {
//         id
//         experimentProcessType
//         finishedAt
//       }
//     }
//   }
// `;

const StatusIndicator = ({ status, experimentId, estimatorType, refetch }) => {
  const [showRunPopup, toggleRunPopup] = useState(false);
  // const { t } = useTranslation();
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
  const StatusButton = withStyles({
    root: {
      alignSelf: "flex-end",
    },
  })(Button);
  let comp;

  switch (status) {
    case "ready":
      comp = (
        <StatusButton
          size="large"
          variant="contained"
          color="primary"
          endIcon={<ArrowForwardIcon />}
          onClick={() => estimatorType === 'CLUSTERING'? startExperiment({variables: {id: experimentId}}) : toggleRunPopup(true)}
        >
          Run {estimatorType === 'CLUSTERING' ? 'Clustering' : 'AutoML'}
        </StatusButton>
      );
      break;
    case "working":
    case "finishing":
        comp = (
        <StatusButton
          size="large"
          variant="contained"
          color="secondary"
          endIcon={<CircularProgress size="1.4rem" color="default" />}
          disabled
        >
          {status}
        </StatusButton>
      );
      break;
    case "learning":
      comp = (
        <StatusButton
          size="large"
          variant="contained"
          color="secondary"
          onClick={() => stopExperiment({ variables: { id: experimentId } })}
          endIcon={<CircularProgress size="1.4rem" color="default" />}
        >
          Stop
        </StatusButton>
      );
      break;
    case "finished":
      comp = (
        <StatusButton
          size="large"
          variant="contained"
          color="secondary"
          endIcon={<DoneIcon />}
          disabled
        >
          Finished
        </StatusButton>
      );
      break;
    case "error":
      comp = (
        <StatusButton
          size="large"
          variant="contained"
          color="secondary"
          endIcon={<ErrorIcon />}
          disabled
        >
          {status}
        </StatusButton>
      );
      break;
    default:
      comp = (
        <StatusButton
          size="large"
          variant="contained"
          color="secondary"
          disabled
        >
          {status}
        </StatusButton>
      );
    }

  if (comp) {
    return (
      <>
        {comp}
        <Modal
          isOpen={showRunPopup}
          style={modalStyles}
          onRequestClose={() => toggleRunPopup(false)}
        >
          <ExperimentStart id={experimentId} onClose={() => toggleRunPopup(false)} />
        </Modal>
      </>
    );
  } else {
    return <span />;
  }
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default () => {
  let { id } = useParams();
  const { t } = useTranslation();
  const { data, loading, error, refetch } = useQuery(EXPERIMENT_QUERY, {
    variables: { id },
  });
  useQuery(MON_QUERY, {pollInterval: 5000, variables: {id}});
  const match = useRouteMatch();
  const classes = useStyles();
  const loc = useLocation();
  const pathname = loc.pathname;


  if (!data && loading) return <Spinner>{t('loading..')}</Spinner>;
  if (error) {
    if (
      String(error) ===
      "Error: GraphQL error: Experiment matching query does not exist."
    ) {
      toastError(`Sorry, Experiment(${id}) not found`);
      return <Redirect to="/" />;
    }
    else if (
      String(error) ===
      "Error: GraphQL error: Signature has expired"
    ) {
      return <Redirect to="/" />;
    }
    return `Experiment Detail Error: ${String(error)}`;
  }

  if (!data.experiment) {
    return "no-experiment-data";
  }

  return (
    <Paper className={classes.paper}>
      <Grid justify='space-between' direction="row" container>
        <Grid item>
          <EditableHeading experiment={data.experiment}/>
        </Grid>
        <Grid item>
          <StatusIndicator
            status={data.experiment.status}
            experimentId={data.experiment.id}
            estimatorType={data.experiment.estimatorType}
            refetch={refetch}
          />
        </Grid>
      </Grid>
      <AppBar position="static" color='secondary' style={{backgroundColor: 'black'}}>
        <Tabs value={pathname} aria-label="experiment menu">
          {/* <Tab label={t('Preprocess')} {...a11yProps(0)} component={Link} value={`${match.url}/preprocess/`} to={`${match.url}/preprocess/`}/> */}
          <Tab label={t('Overview')} {...a11yProps(1)} component={Link} value={`${match.url}/overview/v2/`} to={`${match.url}/overview/v2/`} />
          {data.experiment.estimatorType === 'CLUSTERING' ?
            null
            :
            <Tab label={t('Leaderboard')} {...a11yProps(2)} component={Link} value={`${match.url}/leaderboard/`} to={`${match.url}/leaderboard/`} />
          }
          {data.experiment.estimatorType === 'CLUSTERING' ?
            null
            :
            <Tab label={t('Deployment')} {...a11yProps(3)} component={Link} value={`${match.url}/deployment/`} to={`${match.url}/deployment/`} />
          }
          {data.experiment.estimatorType === 'CLUSTERING' ?
            <Tab label={t('Cluster')} {...a11yProps(4)} component={Link} value={`${match.url}/cluster/`} to={`${match.url}/cluster/`} />
            :
            null
          }
        </Tabs>
      </AppBar>
      <Switch>
        <Route exact path={`${match.url}`}>
          {data.experiment.status === "creating" ? (
            <Redirect to={`/`} />
          ) : (
            <Redirect to={`${match.url}/overview/v2/`} />
          )}
        </Route>
        {/* <Route exact path={`${match.url}/cluster/`}>
          <ExperimentClusterResult id={id} />
        </Route> */}
        <Route exact path={`${match.url}/overview/v2/`}>
          <ExperimentDetail data={data.experiment} env={data.env} />
        </Route>
        <Route exact path={`${match.url}/overview/`}>
          <ExperimentDetail data={data.experiment} env={data.env} />
        </Route>
        <Route exact path={`${match.url}/preprocess`}>
          <ExperimentDatasets id={data.experiment.id} />
        </Route>
        <Route exact path={`${match.url}/preprocess/:seq`}>
          <ExperimentDatasets id={data.experiment.id} />
        </Route>
        <Route exact path={`${match.url}/leaderboard`}>
          <ExperimentLeaderboard id={data.experiment.id} />
        </Route>
        <Route exact path={`${match.url}/deployments`}>
          <ExperimentDeployments id={data.experiment.id} />
        </Route>
        <Route exact path={`${match.url}/deployment`}>
          <ExperimentDeployment id={data.experiment.id} />
        </Route>
        <Route exact path={`${match.url}/deployment/:urlId`}>
          <ExperimentDeployment id={data.experiment.id} />
        </Route>
        <Route exact path={`${match.url}/cluster/`}>
          <ExperimentClusterResult pk={id}/>
        </Route>
        <Route path="*">
          <h3>No pages</h3>
        </Route>
      </Switch>
    </Paper>
  );
};
