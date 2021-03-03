import React from 'react'
import {
    makeStyles,
    Table as MTable,
    TableBody as MTableBody,
    TableCell as MTableCell,
    TableContainer as MTableContainer,
    TableHead as MTableHead,
    TableRow,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    formControl: {
        marginRight: theme.spacing(1),
        minWidth: 120,
    },
    thead: {
        borderTop: '1px solid gray',
        backgroundColor: '#e6e6e6',
        '& th': {
            fontWeight: 'bold',
        },
    },
    tbody: {
        // backgroundColor: '#eeeeee',
        borderBottom: '1px solid black',
    },
    td: {
        // borderBottom: '1px solid #d6d6d6';
        borderRight: '1px dashed #d6d6d6',
        // .tbl_g thead tr th:last-child, .tbl_g tbody tr td:last-child, .tbl_thead thead tr th:last-child, .tbl_tbody tr td:last-child {
        //     border-right: 0 !important;
        // }
    },
    root: {
        width: "auto",
        // marginTop: theme.spacing.unit * 3,
        overflowX: "auto"
    },
    table: {
        minWidth: 500,
        borderTop: '1px solid gray',
        borderBottom: '1px solid gray',
    },
    container: {
        borderRadius: '0px',
        // [theme.breakpoints.up('sm')]: {
        //     maxWidth: theme.breakpoints.width('sm'),
        // },
        // [theme.breakpoints.up('md')]: {
        //     maxWidth: theme.breakpoints.width('md'),
        // },
        // [theme.breakpoints.up('lg')]: {
        //     maxWidth: theme.breakpoints.width('lg'),
        // },
        // [theme.breakpoints.up('xl')]: {
        //     maxWidth: theme.breakpoints.width('xl'),
        // }
    }
}));

const Table = (props) => <MTable className={useStyles().table} {...props}></MTable>
const TableBody = (props) => <MTableBody className={useStyles().tbody} {...props}></MTableBody>
const TableHead = (props) => <MTableHead className={useStyles().thead} {...props}></MTableHead>
const TableContainer = (props) => <MTableContainer elevation={0} className={useStyles().container} {...props}></MTableContainer>
const TableCell = (props) => <MTableCell className={useStyles().td} {...props}></MTableCell>

export {
    Table, TableBody, TableCell, TableRow, TableContainer, TableHead
}