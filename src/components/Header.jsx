import React from 'react';
import { logoutUser } from '../actions/login'
import { connect } from 'react-redux'
import "../css/style.css"
import { useTranslation } from 'react-i18next';
import { Box, Button, ButtonGroup, Container } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

const mapStateToProps = (state) => {
    return ({
        site: state.site,
        user: state.user,
    })
};

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
}));

const ColorButton = withStyles((theme) => ({
    root: {
        color: 'gray',
        //   backgroundColor: grey[500],
        //   '&:hover': {
        //     backgroundColor: grey[700],
        //   },
    },
}))(Button);

export default connect(mapStateToProps, null)(({ site, user, dispatch }) => {
    const { t, i18n } = useTranslation();
    const classes = useStyles()
    return (
        <div className={classes.root}>
            <AppBar position="static" style={{ backgroundColor: 'black' }}>
                <Container maxWidth={"xl"}>
                    <Toolbar>
                        {/* <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                            <MenuIcon />
                        </IconButton> */}
                        <Typography variant="h6" className={classes.title}>
                            <a href={`${process.env.PUBLIC_URL}/`} className="link_logo" style={{ color: 'white' }}>
                                <img src={require('../images/logo_automl.png')} className="img_logo" width="43"
                                    height="42" alt="Accu.Tuning" />
                                Accu.Tuning
                            </a>
                        </Typography>
                        <ButtonGroup size="small" variant="outlined">
                            <ColorButton onClick={() => { i18n.changeLanguage('en'); localStorage.setItem('i18nextLng', 'en') }}>EN <span role='img'>🇺🇸</span></ColorButton>
                            <ColorButton onClick={() => { i18n.changeLanguage('ko'); localStorage.setItem('i18nextLng', 'ko') }}>KO <span role='img'>🇰🇷</span></ColorButton>
                        </ButtonGroup>
                        {site.data && site.data.ACCUTUNING_AUTH?
                            <>
                                {user && user.data ?
                                    <Box pl={2} component="span">
                                        <ButtonGroup>
                                            <Button variant="contained">
                                                {user.data.username}
                                                {user.data.isSuperuser ?
                                                    ' (admin)'
                                                    :
                                                    null}
                                            </Button>
                                            <Button variant="contained" onClick={() => {
                                                dispatch(logoutUser());
                                                window.location = process.env.PUBLIC_URL
                                            }}>{t('SIGNOUT')}</Button>
                                        </ButtonGroup>
                                    </Box>
                                    :
                                    <Box pl={2} component="span">
                                        <Button variant="contained" onClick={() => {
                                        }}>{t('LOGIN')}</Button>
                                    </Box>
                                }
                            </>
                            :
                            null
                        }
                    </Toolbar>
                </Container>
            </AppBar>
        </div>
    )
})
