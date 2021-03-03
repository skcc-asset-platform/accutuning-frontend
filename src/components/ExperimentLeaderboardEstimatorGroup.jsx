/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Chip,
    CircularProgress,
    makeStyles,
} from '@material-ui/core'

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

export default ({data}) => {
    const classes = useStyles();
    return data && data.experiment ?
        <TableContainer
            // component={Paper}
            >
            <Table size='small'>
                <TableHead className={classes.thead}>
                    <TableRow>
                        <TableCell className={classes.td}><b>Job</b></TableCell>
                        <TableCell className={classes.td}><b>Name</b></TableCell>
                        <TableCell className={classes.td} align='right'><b>Train</b></TableCell>
                        <TableCell className={classes.td} align='right'><b>Valid</b></TableCell>
                        <TableCell className={classes.td} align='right'><b>Models</b></TableCell>
                        <TableCell><b>Updated</b></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody className={classes.tbody}>
                {data.experiment.leaderboardEstimatorGroup.map(e =>{
                    return <TableRow>
                        <TableCell className={classes.td}>
                            {e.job ?
                                <Chip size='small' label={e.job} icon={<CircularProgress size='0.8rem'/>} />
                                :
                                null
                            }
                        </TableCell>
                        <TableCell className={classes.td}>{e.estimatorName}</TableCell>
                        <TableCell className={classes.td} align='right'>{e.trainScore}</TableCell>
                        <TableCell className={classes.td} align='right'><b>{e.validScore}</b></TableCell>
                        <TableCell className={classes.td} align='right'>{e.count}</TableCell>
                        <TableCell>{e.lastCreatedAt}</TableCell>
                    </TableRow>
                })}
                </TableBody>
            </Table>
        </TableContainer>
        :
        null
}