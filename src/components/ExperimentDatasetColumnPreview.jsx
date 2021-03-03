import React, { useState , useEffect} from 'react'
import { gql } from 'apollo-boost'
import { useQuery, useMutation } from 'react-apollo'
import FieldUpdater from '../utils/FieldUpdater'
import MicroBarChart from 'react-micro-bar-chart'
import Checkbox from '@material-ui/core/Checkbox';
import { toastError } from '../utils';
import { useTranslation } from "react-i18next";
import Pagination from '@material-ui/lab/Pagination';
import { Box, TextField, Select, MenuItem, InputLabel, FormControl } from "@material-ui/core";

const QUERY_DATASET_COLUMNS = gql`
query queryColumns($id:Int! $search: String $first: Int $skip: Int $datatype: String) {
    dataset (id: $id ) {
        id
        name
        rowCount
        colCount
        pagingCount (search: $search, datatype:$datatype)
        pagingColumns (search: $search, first: $first, skip: $skip datatype:$datatype) {
            id
            createdAt
            idx
            name
            datatype
            # featType
            unique
            missing
            missingRatio
            mean
            min
            max
            mostFrequent
            freqJson
            taskType
            isFeature
        }
    }
}
`

const MUTATE_DATASET_COLUMN = gql`
mutation ($id:ID!, $input: PatchColumnInput!) {
    patchColumn(id: $id, input: $input) {
        column {
            id
            __typename
            isFeature
        }
    }
}
`


export default ({id}) => {

    const [mutateColumn] = useMutation(MUTATE_DATASET_COLUMN)
    const { t } = useTranslation();

    const [columnPage, setColumnPage] = React.useState(1);
    const [columnFirst, setColumnFirst] = useState(process.env.REACT_APP_EX_ROW_COUNT);
    const [columnSkip, setColumnSkip] = useState(0);
    const [columnFilterText, setColumnFilterText] = useState(null)
    const [columnPageCount, setColumnPageCount] = useState(1);
    const [columnFilterDataType, setColumnFilterDataType] = useState(null);
    // const [autoFocus, setAutoFocus] = useState(false);

    const {data, loading, error, refetch} = useQuery(QUERY_DATASET_COLUMNS, {
        variables: {id, first: columnFirst, skip: columnSkip, search: columnFilterText, datatype: columnFilterDataType}
    })

    useEffect(() => {
        if (data) {
            setColumnPageCount(Math.ceil(data.dataset.pagingCount/ process.env.REACT_APP_EX_ROW_COUNT));
          }
    }, [data]);

    const handleColumnPage = (event, value) => {
        setColumnPage(value);
        setColumnSkip((value - 1) * process.env.REACT_APP_EX_ROW_COUNT);
    };

    const handleDataType = (value) => {
        setColumnFilterDataType(value);
        setColumnPage(1);
        setColumnSkip(0);
    };

    const handleSearchText = (value) => {
        setColumnFilterText(value);
        setColumnPage(1);
        setColumnSkip(0);
    };

    if (!data && loading) return 'loading'
    if (error) return String(error)

    const fields = [
        // 'idx',
        // 'name',
        //'datatype',
        // 'taskType',
        'missing',
        'mostFrequent',
        'unique',
        'mean',
        'min',
        'max',
        // 'isFeature', 'isTarget',
    ];

    return (
        <>
         <Box display="flex" justifyContent="flex-end" mt={1}>
                <li>
                    <FormControl variant="outlined" size="small" style={{minWidth: 120}}>
                    <InputLabel size="small" id="demo-simple-select-outlined-label">DataType</InputLabel>
                        <Select
                            size="small"
                            labelId="demo-simple-select-outlined-label"
                            id="demo-simple-select-outlined"
                            value={columnFilterDataType}
                            onChange={e => handleDataType(e.target.value)}
                            label="DataType"
                            >
                            <MenuItem value="">
                                ALL
                            </MenuItem>
                            <MenuItem value={'object'}>OBJECT</MenuItem>
                            <MenuItem value={'int64'}>INT64</MenuItem>
                            <MenuItem value={'float64'}>FLOAT64</MenuItem>
                            <MenuItem value={'datetime64'}>DATETIME64</MenuItem>
                            <MenuItem value={'text'}>TEXT</MenuItem>
                        </Select>
                    </FormControl>
                </li>
                <li>
                    <TextField
                    style={{marginLeft: '4px'}}
                    size="small"
                    id="outlined-basic"
                    label="SEARCH BY NAME"
                    variant="outlined"
                    value={columnFilterText}
                    // autoFocus={autoFocus}
                    onChange={(e) => {
                        handleSearchText(e.target.value);
                        // setAutoFocus(true);
                    }}/>
                </li>
        </Box>
        <table className="tbl_g">
        <thead>
            <tr>
                <th>{t('Use')}</th>
                <th>{t('Name')}</th>
                <th>{t('datatype')}</th>
                {fields.map(field => <th key={field}>{field}</th>)}
                <th>{t('Distribution')}</th>
            </tr>
        </thead>
        <tbody>
            {data && data.dataset ? data.dataset.pagingColumns.map(col => {
                const PropTd = ({ name }) => <td>{`${col[name]}`}</td>
                return <tr key={col.id}>
                    <td>
                        <Checkbox
                            checked={col.isFeature}
                            onChange={(e) => {
                                // console.log(e.target.checked)
                                mutateColumn({ variables: {id: col.id, input: { isFeature: e.target.checked }}}).catch(e => toastError(e))
                            }}
                            inputProps={{ 'aria-label': col.name }}
                        />
                    </td>
                    <td style={{textAlign: 'left'}}>{col.name}</td>
                    <td>
                        <FieldUpdater
                            onLoad={() => refetch({id: data.dataset.id})}
                            // onLoad={(resp) => {
                            //     console.log(resp)
                            //     getColumn({ fetchPolicy: 'network-only', variables: { id: col.id }})
                            // }}
                            showLabel={false}
                            path={`/datasets/${id}/columns/${col.id}/`}
                            field='datatype'
                            value={col.datatype.toLowerCase()}
                            />
                    </td>
                    {fields.map(field => <PropTd key={field} name={field} />)}
                    <td>
                        <MicroBarChart data={JSON.parse(col.freqJson)}/>
                    </td>
                </tr>
            }) : null}
        </tbody>
        </table>
        <Box my={2} display="flex" justifyContent="center">
            <Pagination count={columnPageCount} page={columnPage} onChange={handleColumnPage} showFirstButton showLastButton/>
        </Box>
        </>
    )
}
