import React, { useState, useRef, useEffect } from 'react'
import gql from "graphql-tag";
import { useQuery } from "react-apollo";
import { Button, Grid, Paper } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import { CsvToHtmlTable } from 'react-csv-to-table';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Plot from 'react-plotly.js';
import * as d3 from 'd3'
import { useTranslation } from "react-i18next";
import { Alert } from '@material-ui/lab';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ExperimentClusterResultEDA from './ExperimentClusterResultEDA';
// import BarChartIcon from '@material-ui/icons/BarChart';
import PieChartIcon from '@material-ui/icons/PieChart';
import ClusterLeaderboard from './ClusterLeaderboard';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`scrollable-auto-tabpanel-${index}`}
        aria-labelledby={`scrollable-auto-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box p={3}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
}


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

function a11yProps(index) {
    return {
      id: `scrollable-auto-tab-${index}`,
      'aria-controls': `scrollable-auto-tabpanel-${index}`,
      value: index,
    };
}

// const useStyles = makeStyles((theme) => ({
//     root: {
//         flexGrow: 1,
//         width: '100%',
//         backgroundColor: theme.palette.background.paper,
//     },
// }));


const EXPERIMENT_CLUSTER_RESULT_QUERY = gql`
query experimentClusterResult($id: Int!) {
    experiment(id: $id) {
        id
        __typename
        status
        clusterResults {
            id
            inputFile {
                url
                sizeHumanized
            }
            outputFile {
                url
                sizeHumanized
            }
            clusterJsonFile {
                url
                sizeHumanized
            }
            clusterPickleFile {
                url
                sizeHumanized
            }
            clusterJson
            visualizedObjects {
                id
                json
            }
        }
    }
}
`


// const ClusterOptimalInfo = ({data}) => {
//     // console.log(data)
//     return (
//         <ul>
//             {Object.keys(data.optimal_cfg).map(k => <li key={k}>
//                 {k} : {String(data.optimal_cfg[k])}
//             </li>)}
//         </ul>
//     )
// }

// const Heading = (props) => {
//     return <h2 style={{textAlign: 'center', paddingTop: '20px', paddingBottom: '20px'}}>{props.children}</h2>
// }

const ClusterResultSampleTable = ({id, value}) => {
    const [open, setOpen] = useState(false);
    const [scroll, setScroll] = useState('paper');

    const { data, loading, error } = useQuery(gql`query clusterResultSample($experimentId:Int!, $clusterValue: String!) {
        experiment(id: $experimentId) {
            clusterResults {
                clusterResultSample(value: $clusterValue)
                clusterCenterSample
            }
            id
            __typename
        }
    }`, {variables: {experimentId: id, clusterValue: value}});

    const handleClickOpen = (scrollType) => () => {
        setOpen(true);
        setScroll(scrollType);
    };
    const handleClose = () => {
        setOpen(false);
    };
    const descriptionElementRef = useRef(null);
    useEffect(() => {
      if (open) {
        const { current: descriptionElement } = descriptionElementRef;
        if (descriptionElement !== null) {
          descriptionElement.focus();
        }
      }
    }, [open]);
    if (loading) return 'loading.'
    if (error) return String(error)

    // console.log(data.experiment.clusterResults[0].clusterResultSample)
    return <div className="area_scroll cluster-result">
        <Alert severity="info" action={<Button size="small" variant="contained" color="primary" onClick={handleClickOpen('body')}>
                해당 데이터만 모아서 보기</Button>}>
            첫번째 row의 데이터는 이 분류에 가장 큰 영향을 미쳤습니다.

        </Alert>
        <CsvToHtmlTable
            data={data.experiment.clusterResults[0].clusterResultSample}
            csvDelimiter=","
            tableClassName="tbl_g"
        />
      <Dialog
        open={open}
        onClose={handleClose}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">CENTROID DATA</DialogTitle>
        <DialogContent dividers={scroll === 'paper'}>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
                    <CsvToHtmlTable
            data={data.experiment.clusterResults[0].clusterCenterSample}
            csvDelimiter=","
            tableClassName="tbl_g"
        />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {/* <Button onClick={handleClose} color="primary">
            Cancel
          </Button> */}
          <Button onClick={handleClose} color="primary" variant="contained">
            CLOSE
          </Button>
        </DialogActions>
      </Dialog>
    </div>
}

const ClusterResultPreviewTable = ({keys, values, pk, result, clusterResult}) => {
    // const classes = useStyles();
    const [expanded, setExpanded] = React.useState('panel1');
    const [openPlots, setOpenPlots] = React.useState(false)
    const [value, setValue] = useState(0);
    const handleChange = (event, newValue) => {
        // console.log(newValue, value, Object.keys(result.counter))
        setValue(newValue);
    };
    const accordianHandleChange = (panel) => (event, newExpanded) => {
        setExpanded(newExpanded ? panel : false);
      };
    const cmap = d3.scale.category10()
    const { t } = useTranslation();
    // console.log(cmap)
    // console.log(keys.map(k => cmap(k)))
    // console.log(JSON.parse(clusterResult.visualizedObjects[0].json).map(e => e.label))
    // console.log(result)
    return (
      <Grid container>
        <Grid xs={3} item>
          <Grid container justify="center">
            <Grid item xs={12}>
              <Accordion square expanded={true} onChange={accordianHandleChange('panel1')}>
                <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                  <Typography>
                    {t('Result')}: {keys.length} clusters
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Plot
                      onClick={({points}) => points[0] ? setValue(+points[0].label) : null}
                      style={{width: '100%', marginTop: '10px', marginBottom: '20px'}}
                      useResizeHandler={true}
                      // displayModeBar={false}
                      config={{displayModeBar: false}}
                      data={[
                      {
                          values: values,
                          labels: keys,
                          ids: keys,
                          type: 'pie',
                          // automargin: true
                          marker: {
                              colors:keys.map((k,idx) => cmap(idx)),
                          }
                      },
                      ]}
                      layout={ {
                          // width: '100%', height: '100%',
                          // width: '100%', height: '100%',
                          margin: {"t": 0, "b": 0, "l": 15, "r": 15},
                          showlegend: false,
                          title: `Result: ${keys.length} clusters`,
                          // autosize: true,
                          displayModeBar: false,
                      } }
                  />
                </AccordionDetails>
                <Box component="div" mb={1} style={{textAlign: 'center'}}>
                  <Button size="small" variant="contained" color="primary" component="a" href={clusterResult.outputFile.url} endIcon={<SaveIcon fontSize="inherit" />}>DOWNLOAD OUTPUT(CSV)</Button>
                </Box>
              </Accordion>
            </Grid>
            <Grid item xs={12}>
              <Accordion square expanded={true} onChange={accordianHandleChange('panel2')}>
                <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
                  <Typography>Summary</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                      <ul style={{listStyle: 'disc', marginInlineStart: '8px'}}>
                      <li style={{listStyle: 'disc'}}>{result.alg_messages}</li>
                      <li style={{listStyle: 'disc'}}>{result.dim_messages}</li>
                      </ul>
                  </Typography>
                </AccordionDetails>
                <Box component="div" mb={1} style={{textAlign: 'center'}}>
                  <Button
                    endIcon={<PieChartIcon/>}
                    size="small" variant="contained" color="primary" onClick={() => setOpenPlots(!openPlots)}>SEE explanatory PLOTS</Button>
                </Box>
              </Accordion>
            </Grid>
          </Grid>
        </Grid>
        <Grid xs={9} item>
          <Box ml={2}>
            <AppBar position="static" color="default" elevation={1} style={{height: '57px'}}>
              <Tabs
                value={value}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                aria-label="cluster result table by classes"
                style={{height: '57px'}}
              >
                {keys.map((k, idx) => <Tab style={{height: '57px'}} key={k} label={k} {...a11yProps(idx)} />)}
              </Tabs>
            </AppBar>
            <Box mt={1}>
              <Paper elevation={1}>
                {keys.map((k, idx) =>
                    <TabPanel key={k} value={value} index={idx}>
                        <ClusterResultSampleTable id={pk} value={k}/>
                    </TabPanel>
                )}
              </Paper>
            </Box>
          </Box>
          <Box ml={2} mt={1}>
            {openPlots? <ExperimentClusterResultEDA experimentId={pk}/>:null}
          </Box>
        </Grid>
      </Grid>
    )
}

export default ({pk}) => {
    const [polling,setPolling] = useState(false)
    const { data, loading, error, startPolling, refetch } = useQuery(EXPERIMENT_CLUSTER_RESULT_QUERY, {
        variables: { id: pk },
    });

    if (loading) return 'loading..'
    if (error) return String(error)

    if (data) {
      if (data.experiment.status === 'learning' || data.experiment.status === 'processing') {
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

    if (!(data && data.experiment && data.experiment.clusterResults.length > 0)) {
        return <Box mt={1}>
            <ClusterLeaderboard pk={pk}/>
        </Box>
    }

    const result = JSON.parse(data.experiment.clusterResults[0].clusterJson)

    return (
        <section className="section_content">
            <ClusterResultPreviewTable
                pk={pk}
                keys={Object.keys(result.counter)}
                values={Object.values(result.counter)}
                result={result}
                clusterResult={data.experiment.clusterResults[0]}
            />
            <Box mt={2}>
              <ClusterLeaderboard pk={pk}/>
            </Box>
        </section>
    )
}
