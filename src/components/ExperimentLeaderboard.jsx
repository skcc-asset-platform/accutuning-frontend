/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { gql } from "apollo-boost";
import ModelStat from "./ModelStat";
import ModelInfo from "./ModelInfo";
import EnsembleModelInfo from "./EnsembleModelInfo";
import PreparationInfo from "./PreparationInfo";
import ExperimentLeaderboardEstimatorGroup from "./ExperimentLeaderboardEstimatorGroup";
import ExperimentScoreTrend from "./ExperimentScoreTrend";
import { useQuery, useMutation } from "react-apollo";
import Modal from "react-modal";
import {
  ModalContent,
  ModalHeader,
  ModalBody,
  SubHeading,
  toastError,
} from "../utils";
import Spinner from "../utils/Spinner";
import Tooltip from "../utils/Tooltip";
import MoreVertIcon from '@material-ui/icons/MoreVert';
import {
  Typography,
  IconButton,
  Button,
  Grid,
  CircularProgress,
  TableContainer,
  TableHead,
  Table,
  Card,
  CardHeader,
  TableRow, TableBody, TableCell, makeStyles, CardContent } from "@material-ui/core";
import DoneIcon from '@material-ui/icons/Done';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ErrorIcon from '@material-ui/icons/Error';
import { useTranslation } from "react-i18next";


const useStyles = makeStyles((theme) => ({
  thead: {
      // borderTop: '1px solid gray',
      backgroundColor: '#eeeeee',
  },
  tbody: {
      borderBottom: '1px solid black',
  },
  td: {
      // borderBottom: '1px solid #d6d6d6';
      borderRight: '1px dashed #d6d6d6',
      // .tbl_g thead tr th:last-child, .tbl_g tbody tr td:last-child, .tbl_thead thead tr th:last-child, .tbl_tbody tr td:last-child {
      //     border-right: 0 !important;
      // }
  }
}))

const QUERY_MODELS = gql`
  query queryModels($id: Int!) {
    experiment(id: $id) {
      id
      bestScore
      status
      doneSlot
      totalSlot
      timeout
      modelsCnt
      metric
      resamplingStrategy
      setupInfo
      maxEvalTime
      includeEstimators
      processes(experimentProcessType: "optuna") {
        id
        estimatorsChunkJson
        currentTrial
        finishedAt
      }
      leaderboard {
        id
        score
        trainScore
        validScore
        testScore
        createdAt
        estimatorName
        generator
        fitted
        file {
          size
          sizeHumanized
        }
        allMetricsStatus
        evaluationStatStatus
        deployedStatus
      }
      leaderboardEstimatorGroup {
        estimatorName
        count
        trainScore
        validScore
        lastCreatedAt
        job
        jobElapsedSec
      }
    }
  }
`;

const modalStyles = {
  content: {
    position: "relative",
    border: "0",
    top: "auto",
    left: "auto",
    right: "auto",
    bottom: "auto",
  },
};

const FIELDS = [
  "estimatorName",
  "trainScore",
  "validScore",
  "testScore",
  "filesize",
];


const getStatusIcon = (status) => {
  if (status === 'DONE') return <DoneIcon/>
  else if (status === 'ERROR') return <ErrorIcon/>
  else {
    return <CircularProgress size={13} />
  }
}


const LeaderboardEntry = ({ client, experiment, data, color, className }) => {
  const classes = useStyles()
  const [showInfo, setShowInfo] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showEnsembleInfo, setShowEnsembleInfo] = useState(false);
  const [showSimilarEstimators, setShowSimilarEstimators] = useState(false);
  const { t } = useTranslation();
  const [deploy] = useMutation(gql`mutation mutateDeployment($modelId: ID!, $modelType: String!) {
    deployModel(modelId: $modelId, modelType: $modelType) {
      deployment {
        id
        model {
          id
          __typename
          deployedStatus
        }
      }
    }
  }`);
  const [evaluate] = useMutation(gql`mutation mutateEvaluation($modelId: ID!) {
    evaluateModel(id: $modelId) {
      model {
        id
        __typename
        evaluationStatStatus
      }
    }
  }`);

  const e = data[0];
  const groupsCnt = data.length;

  return (
    <>
      <TableRow key={e.id} onClick={() => {}} className={className}>
        <TableCell className={classes.td} align='right'>{e.rank}</TableCell>
        <TableCell className={classes.td}>{String(e.estimatorName)}</TableCell>
        {experiment.resamplingStrategy === "CV" ? (
          <TableCell className={classes.td} align='right'>{String(e.score)}</TableCell>
        ) : (
          <>
            <TableCell className={classes.td} align='right'>{String(e.trainScore)}</TableCell>
            <TableCell className={classes.td} align='right'>{String(e.validScore)}</TableCell>
          </>
        )}
        <TableCell className={classes.td} align='right'>{String(e.file.sizeHumanized)}</TableCell>
        {e.generator === "ensemble" ? (
          <>
            <TableCell className={classes.td}>
                <Button size='small' variant="outlined"
                  onClick={() => {
                    setShowEnsembleInfo(true);
                  }}
                >{t('View')}</Button>
            </TableCell>
            <TableCell>-</TableCell>
            <TableCell className={classes.td}>
              {e.deployedStatus && e.deployedStatus !== 'INIT' ? (
                <Button size='small' variant="contained" aria-label="deploy" disabled endIcon={
                  e.deployedStatus === 'DONE' ? <CloudUploadIcon/> : <CircularProgress size={13} />}>
                  Deploy
                </Button>
              ) : (
                <Button size='small' variant="contained" aria-label="deploy" onClick={() => {
                  deploy({variables: {modelId: e.id, modelType: 'ensemble'}}).catch((e) => toastError(e))
                }} endIcon={<ArrowForwardIcon/>}>
                  Deploy
                </Button>
              )}
            </TableCell>
          </>
        ) : (
          <>
            <TableCell className={classes.td}>
                <Button size='small' variant="outlined"
                  onClick={() => {
                    setShowInfo(true);
                  }}
                >{t('View')}</Button>
            </TableCell>
            <TableCell className={classes.td}>
              {e.evaluationStatStatus === "INIT" ? (
                <Button size='small' variant="contained" color='primary'
                  onClick={() => {evaluate({variables: {modelId: e.id}}).then(() => setShowStats(true)).catch(e=>toastError(e))}}>{t('View')}</Button>
                // <MutateAction
                //   disableAfterClick={true}
                //   verb="post"
                //   onLoad={() => {
                //     setShowStats(true);
                //   }}
                //   path={`/models/${e.id}/stats/`}
                //   className="btn_s btn_border"
                // >
                //   View
                // </MutateAction>
              ) : (
                <Button size='small' variant="outlined" color='primary'
                  onClick={() => {
                    setShowStats(true);
                  }}
                  endIcon={getStatusIcon(e.evaluationStatStatus)}
                >{t('View')}</Button>
              )}
            </TableCell>
            <TableCell className={classes.td}>
              {e.deployedStatus && e.deployedStatus !== 'INIT' ? (
                <Button size='small' variant="contained" color='primary' aria-label="deploy" disabled endIcon={
                  e.deployedStatus === 'DONE' ? <CloudUploadIcon/> : <CircularProgress size={13} />}>
                  Deploy
                </Button>
              ) : (
                <Button size='small' variant="contained" color='primary' aria-label="deploy" onClick={() => {
                  deploy({variables: {modelId: e.id, modelType: 'model'}}).catch((e) => toastError(e))
                }} endIcon={<ArrowForwardIcon/>}>
                  Deploy
                </Button>
                // <MutateAction
                //   disableAfterClick={true}
                //   verb="post"
                //   path={`/experiments/${experiment.id}/deployment/`}
                //   data={{ modelPk: e.id }}
                //   className="btn_deploy tooltip_model"
                // >
                //   <span className="ico_automl ico_arr">Deploy</span>
                //   <div className="txt_tooltip">Click to deploy</div>
                // </MutateAction>
              )}
            </TableCell>
          </>
        )}
      </TableRow>
      {groupsCnt > 1 ? (
        <TableRow>
          <TableCell colSpan={FIELDS.length + 5} align='center'>
            <IconButton size="small" aria-label="more same estimators">
              <MoreVertIcon onClick={() => setShowSimilarEstimators(!showSimilarEstimators)}/>
            </IconButton>
          </TableCell>
        </TableRow>
      ) : null}
      {showSimilarEstimators ? (
        <>
          {data.slice(1).map((e, idx) => (
            <LeaderboardEntry
              color={"#999999"}
              key={e.id}
              data={[e]}
              client={client}
              experiment={experiment}
              className="view_more"
            />
          ))}
          <TableRow>
            <TableCell colSpan={FIELDS.length + 5}></TableCell>
          </TableRow>
        </>
      ) : null}
      <Modal
        isOpen={showEnsembleInfo}
        style={modalStyles}
        onRequestClose={() => setShowEnsembleInfo(false)}
      >
        <ModalContent>
          <ModalHeader title="Ensemble" />
          <ModalBody>
            <EnsembleModelInfo ensembleId={e.id} />
          </ModalBody>
        </ModalContent>

      </Modal>
      <Modal
        isOpen={showInfo}
        style={modalStyles}
        onRequestClose={() => setShowInfo(false)}
      >
        <ModalContent>
          <ModalHeader title={t('Model Pipeline Information')}>
            <div className="help-text">
              {t('See piepeline for the model selected')}
            </div>
          </ModalHeader>
          <ModalBody>
            <ModelInfo modelId={e.id} />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={showStats}
        style={modalStyles}
        onRequestClose={() => setShowStats(false)}
      >
        <ModalContent>
          <ModalHeader title={t('Model Evaluation')}>
            <div className='help-text'>
              {t('about-model-evaluation')}
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="wrap_visual">
              <ModelStat modelId={e.id} />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};


const LeaderboardTable = ({data, client, loading}) => {
  const { t } = useTranslation();
  const leaderboardCollapsed =
    data && data.experiment
      ? data.experiment.leaderboard.map((e, idx) => {
          const prev = data.experiment.leaderboard[idx - 1];
          // let prevEstimatorName = null
          e.shouldBeCollapsed = false;
          e.collapsedCount = 0;
          e.rank = idx + 1
          if (prev) {
            // prevEstimatorName = prev.estimatorName;
            if (e.estimatorName === prev.estimatorName) {
              e.shouldBeCollapsed = true;
              e.collapsedCount = prev.collapsedCount + 1;
            }
          }
          return e;
        })
      : [];

  const leaderboardCollapsedGroups = leaderboardCollapsed.reduce((obj, e) => {
    if (e.shouldBeCollapsed === false) {
      obj.push([e]);
    } else {
      obj[obj.length - 1].push(e);
    }
    return obj;
  }, []);
  const experiment = data.experiment;
  const classes = useStyles()

  return (
    <TableContainer>
      <Table>
        <TableHead className={classes.thead}>
          <TableRow>
            <TableCell className={classes.td} align='right'>{t('Rank')}</TableCell>
            <TableCell className={classes.td}>{t('Estimator')}</TableCell>
            {experiment.resamplingStrategy === "CV" ? (
              <>
                <TableCell className={classes.td} align='right'>{t('Score')} <Tooltip>{experiment.metric}</Tooltip></TableCell>
              </>
            ) : (
              <>
                <TableCell className={classes.td} align='right'>{experiment.metric} (Train)</TableCell>
                <TableCell className={classes.td} align='right'>{experiment.metric} (Valid)</TableCell>
              </>
            )}
            <TableCell className={classes.td} align='right'>{t('Filesize')}</TableCell>
            <TableCell className={classes.td}>{t('Information')}</TableCell>
            <TableCell className={classes.td}>{t('Evaluation')}</TableCell>
            <TableCell>{t('Deploy')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leaderboardCollapsedGroups.length > 0 ? (
            leaderboardCollapsedGroups.map((grp, idx) => (
              <LeaderboardEntry
                key={grp[0].id}
                client={client}
                experiment={experiment}
                data={grp}
              />
            ))
          ) : (
            <TableRow>
              <TableCell align='center' colSpan={FIELDS.length + 4}>
                {loading ? "Loading..." : t("No data")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
    </Table>
    </TableContainer>
  )
}

export default ({ id }) => {
  const { t } = useTranslation();
  const { data, loading, error, refetch, client } = useQuery(QUERY_MODELS, {
    variables: { id: id },
    pollInterval: 5000,
  });
  useEffect(() => {
    refetch();
  }, [refetch]);

  if (error) return String(error);

  return (
    <section className="section_content">
      <SubHeading>
        {t('about-leaderboard')}
      </SubHeading>

      {data && data.experiment ? (
        <>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} md={4}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Card>
                    <CardHeader title='SCORE TREND' subheader=''/>
                    <CardContent>
                      <ExperimentScoreTrend data={data.experiment}/>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardHeader title='DATA PREPARATION' subheader=''/>
                    <CardContent>
                      {data.experiment.setupInfo ?
                        <PreparationInfo id={data.experiment.id}/>
                        :
                        <Typography color='textSecondary'>
                          Not Ready
                        </Typography>
                      }
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader title='JOB DASHBOARD' subheader=''/>
                <CardContent>
                  <ExperimentLeaderboardEstimatorGroup data={data}/>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                  <CardHeader title='LEADERBOARD' subheader=''/>
                  <CardContent>
                    <LeaderboardTable data={data} client={client} loading={loading}/>
                  </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      ) : (
        <Spinner>{t('Loading...')}</Spinner>
      )}
    </section>
  );
};
