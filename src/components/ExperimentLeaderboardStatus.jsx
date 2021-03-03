import React from "react";
import ScoreTrend from "./ScoreTrend";
import { useTranslation } from "react-i18next";
import { Box, Button, Chip, Typography, Grid, IconButton,
    List, ListItem, ListItemText, ListItemSecondaryAction } from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      maxWidth: 752,
    },
    demo: {
      backgroundColor: '#f5f6f9', //theme.palette.background.paper,
    },
    title: {
      margin: theme.spacing(4, 0, 2),
    },
}));


export default ({data}) => {
    const classes = useStyles();

    const { t } = useTranslation();


    let trendData = data ? data.leaderboard.map((t) => +t.score).filter((t) => t !== null)
      : [];
    trendData.reverse();

    let trendDataLabel = data 
        ? data.leaderboard
            .map((t) => t.estimatorName)
            .filter((t) => t !== null)
        : [];
    trendDataLabel.reverse();

    let progressNumber = data ? data.status === "preprocessing"
        ? 0
        : parseInt(data.doneSlot / data.timeout) * 100
        : null;

    if (progressNumber && progressNumber > 100) {
        progressNumber = 100;
    }

    const convertToTimeformat = (slot) => {
        var s = parseInt(slot);
        var h = Math.floor(s / 3600); // Get whole hours
        s -= h * 3600;
        var m = Math.floor(s / 60); // Get remaining minutes
        s -= m * 60;
        return h + ":" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
    };

    return (
        <Grid container spacing={2} mt={1}>
            {/* <Grid item xs={12} md={6}>
                <strong className="tit_progress">{t('Total Progress')}</strong>
                {data.status === "preprocessing" ? (
                    <strong>{t('Pre-preocessing')}</strong>
                ) : (
                    <strong>
                    {convertToTimeformat(data.doneSlot)}{" / "}
                    {convertToTimeformat(data.timeout)}
                    </strong>
                )}
                <div className="graph_progress">
                    <span
                        className="bar_progress"
                        style={{ width: progressNumber + "%" }}
                    ></span>
                </div>
                <span className="num_progress">{progressNumber + "%"}</span>
            </Grid> */}
            <Grid item xs={12} md={6}>
                <ScoreTrend data={trendData} label={trendDataLabel} />
            </Grid>
            <Grid item xs={6} md={3}>
                <Grid container spacing={2}>
                    <Grid item xs={6} md={6}>
                        {/* <Typography variant="h6" className={classes.title}>Preparation Data Info.</Typography> */}
                        <div className={classes.demo}>
                            <List dense={true}>
                                <ListItem>
                                    <ListItemText
                                        primary={t('Algorithms')}
                                        secondary={String(data.includeEstimators.join(', '))}
                                    />
                                </ListItem>
                            </List>
                        </div>
                    </Grid>
                    <Grid item xs={6} md={6}>
                        {/* <Typography variant="h6" className={classes.title}>Preparation Data Info.</Typography> */}
                        <div className={classes.demo}>
                            <List dense={true}>
                                {data.processes.length === 0 ?
                                    <ListItem>
                                        <ListItemText primary={`NO JOBS`}
                                                secondary=''/>
                                    </ListItem>
                                    :
                                    null
                                }
                                {data.processes.map((proc, idx) =>
                                    <ListItem key={idx}>
                                        {proc.finishedAt ?
                                            <ListItemText primary={`Job#${proc.id}`}
                                                secondary='FINISHED'/>
                                            :
                                            <>
                                                {proc.currentTrial ? <ListItemText
                                                    primary={`Job#${proc.id} Trial-${proc.currentTrial.number + 1}`}
                                                    secondary={
                                                        `${proc.currentTrial.params['CLASSIFIER'] || proc.currentTrial.params['REGRESSOR']}\n(${parseInt(proc.currentTrial.elapsed_sec)}s/${data.maxEvalTime}s)`
                                                    }
                                                />
                                                :
                                                <ListItemText
                                                    primary={`Job#${proc.id} Trial- ... `}
                                                    secondary={
                                                        data.setupInfo ? '...' : 'Preparing..'
                                                    }
                                                />
                                                }
                                            </>
                                        }
                                    </ListItem>
                                )}
                            </List>
                        </div>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}