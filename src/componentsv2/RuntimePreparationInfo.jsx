import React from 'react'
import { Box, Button, Chip, Typography, Grid, IconButton,
    List, ListItem, ListItemText, ListItemSecondaryAction } from "@material-ui/core"
// import { useQuery, gql } from '@apollo/client';
import { useQuery, useMutation } from "react-apollo";
import gql from "graphql-tag";

import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from "react-i18next";
import GetAppIcon from '@material-ui/icons/GetApp';


const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      maxWidth: 752,
    },
    demo: {
      backgroundColor: '#eee', //theme.palette.background.paper,
    },
    title: {
      margin: theme.spacing(4, 0, 2),
    },
}));



export default ({id}) => {
    const classes = useStyles();
    const { t, i18n } = useTranslation();
    const {data, loading, error} = useQuery(gql`query querySetupInfo($id: Int!) {
        experiment(id: $id) {
          setupInfo
        }
    }`, {
        variables: {id}
    })

    if (loading) return 'loading'
    if (error) return 'error'
    if (!data || !data.experiment || !data.experiment.setupInfo) return 'not prepared yet'

    return (
        <Grid container spacing={1} mt={1}>
            <Grid item xs={12}>
                {/* <Typography variant="h6" className={classes.title}>Preparation Data Info.</Typography> */}
                <div className={classes.demo}>
                    <List dense={true}>
                        <ListItem>
                        <ListItemText
                            primary={data.experiment.setupInfo['sampled'] ? "ORIGINAL SOURCE(SAMPLED)" : "ORIGINAL SOURCE"}
                            secondary={String(data.experiment.setupInfo['df_source_shape'])}
                        />
                        </ListItem>
                        <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="download" download href={data.experiment.setupInfo['df_source_fp_url']}>
                            <GetAppIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </List>
                </div>
            </Grid>
            <Grid item xs={12}>
                {/* <Typography variant="h6" className={classes.title}>Preparation Data Info.</Typography> */}
                <div className={classes.demo}>
                    <List dense={true}>
                        <ListItem>
                        <ListItemText
                            primary="TRAIN DATA"
                            secondary={String(data.experiment.setupInfo['df_train_shape'])}
                        />
                        </ListItem>
                        <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="download" download href={data.experiment.setupInfo['df_train_fp_url']}>
                            <GetAppIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </List>
                </div>
            </Grid>
            <Grid item xs={12}>
                {/* <Typography variant="h6" className={classes.title}>Preparation Data Info.</Typography> */}
                <div className={classes.demo}>
                    <List dense={true}>
                        <ListItem>
                        <ListItemText
                            primary="VALID DATA"
                            secondary={String(data.experiment.setupInfo['df_valid_shape'])}
                        />
                        </ListItem>
                        <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="download" download href={data.experiment.setupInfo['df_valid_fp_url']}>
                            <GetAppIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </List>
                </div>
            </Grid>
            <Grid item xs={12}>
                {/* <Typography variant="h6" className={classes.title}>Preparation Data Info.</Typography> */}
                <div className={classes.demo}>
                    <List dense={true}>
                        <ListItem>
                        <ListItemText
                            primary="TEST DATA"
                            secondary={String(data.experiment.setupInfo['df_test_shape'] || t('NOT GENERATED'))}
                        />
                        </ListItem>
                        <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="download"
                                download
                                disabled={!data.experiment.setupInfo['df_test_fp']}
                                href={data.experiment.setupInfo['df_test_fp_url']}>
                            <GetAppIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </List>
                </div>
            </Grid>
        </Grid>
        // <Box component="span" ml={1}>
        //     SOURCE SHAPE: <Chip size="small" variant="outlined" color="primary" label={String(data.experiment.setupInfo['Original Data'])}/>
        //     /
        //     TRAIN SHAPE: ({String(data.experiment.setupInfo['Transformed Train Set'])})
        //     /
        //     VALID SHAPE: ({String(data.experiment.setupInfo['Transformed Test Set'])})
        // </Box>
    )
}