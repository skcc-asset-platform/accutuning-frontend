import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-apollo';
// import Spinner from '../utils/Spinner'
import { gql } from 'apollo-boost';
import {
    Button, ButtonGroup, Box, Chip,
    FormControlLabel, Checkbox, TextField,
    Grid, Table, TableRow, TableBody, TableCell, Paper, Typography } from "@material-ui/core";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import { Alert, AlertTitle } from '@material-ui/lab';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import MenuItem from '@material-ui/core/MenuItem';
import { useTranslation } from "react-i18next";
import {
    ColumnSelectFormControl,
    ColumnCheckboxFormControl,
} from './DatasetColumns';


const COLOR10 = [
    '#DFFF00',
    '#FFBF00',
    '#FF7F50',
    '#DE3163',
    '#9FE2BF',
    '#40E0D0',
    '#6495ED',
    '#CCCCFF',
    '#CCCCCC',
    '#82E0AA',
]

const QUERY_TEXT_ROWS = gql`
query queryTextRow($id:Int!, $page:Int, $picked:Boolean)  {
    textRows(id: $id, page: $page, picked: $picked) {
        page
        pages
        hasNext
        hasPrev
        objects {
            text
            tag
            picked
            id
            __typename
        }
    }
    textRowsStat(id: $id, picked: $picked) {
        tag
        cnt
    }
}
`


const QUERY_PROCESS_AND_NL = gql`
query queryTagtextProcess($labelingId: Int!) {
    labeling(id: $labelingId) {
        experimentbasePtr {
          processes {
            finishedAt
          }
        }
        id
        textLoaded
        buildTagStatus
        textUseTagger
        textFewshotCount
        textProcessingAlStep
        textProcessingAlUse
        textProcessingStep
        textUserExpectedClsCount
        textClusterMethod
        textClusterN
        textUseTagFeature
        textUseVectorFeatures
        visualizedObjects {
            id
            name
            title
            error
            message
            file {
                url
                ext
            }
        }
    }
}
`


const TextTagStat = ({data, colormap}) => {
    return <div>
        {data.map(r => <Chip
            style={{backgroundColor: colormap[r.tag] || '#cccccc'}}
            size='small' key={r.tag} label={`${r.tag}(${r.cnt})`}/>)}
    </div>
}


const TextTagResult = ({labeling}) => {
    // const [picked, setPicked] = useState(false);
    const [page, setPage] = useState(1);
    const {data, loading, error} = useQuery(QUERY_TEXT_ROWS, {
        variables: {id: labeling.id, picked: false, page},
        fetchPolicy: 'no-cache'
    })
    const { t } = useTranslation();

    if (!data && loading) return 'loading'
    if (error) return String(error)

    if (!(labeling && labeling.buildTagStatus === 'DONE')) {
        // return <span style={{color: 'gray'}}>{`status: ${labeling && labeling.buildTagStatus || '-'}`}</span>
        return null
    }

    if (!(data && data.textRows)) {
        return 'no-data'
    }

    const colormap = {}
    data.textRowsStat.map((m, idx) => {
        colormap[m.tag] = COLOR10[idx] || '#cccccc';
    })

    return (
        <>
            <Box mt={4} mb={2}>
                <Typography variant='h5'>
                    {t('Clustering Tags')}
                </Typography>
            </Box>
            <TextTagStat data={data.textRowsStat} colormap={colormap}/>

            <Box mt={4} mb={2}>
                <Typography variant='h5'>
                    {t('Clustering Details')}
                </Typography>
            </Box>
            <Box component='div'>
                <Typography>
                    {data.textRows.objects.map(row => (
                        <Grid container key={row.id} spacing={2} style={{borderBottom: '1px dashed #cccccc'}}>
                            <Grid item xs={1}><Chip
                                style={{backgroundColor: colormap[row.tag] || '#cccccc'}}
                                size='small' label={row.tag}/></Grid>
                            <Grid item xs={11}>{row.text}</Grid>
                        </Grid>
                    ))}
                </Typography>
            </Box>
            <Box component='div' style={{textAlign:"center"}} mt={4}>
                <ButtonGroup>
                    <Button disabled={!data.textRows.hasPrev} onClick={() => setPage(page-1)}>Prev</Button>
                    <Button disabled={true}>{`${data.textRows.page} / ${data.textRows.pages}`}</Button>
                    <Button disabled={!data.textRows.hasNext} onClick={() => setPage(page+1)}>Next</Button>
                </ButtonGroup>
            </Box>

        </>
    )
}


const TextRowTextFormControl = ({id, field, extraFields, label, value, helptext, fullWidth, disabled}) => {
    const [val, setVal] = useState(value)
    const [firstVal, setFirstVal] = useState(value)
    const [mutateTextRow] = useMutation(gql`
    mutation mutate_${field}($id: ID!, $input: PatchTextRowInput!) {
        patchTextRow(id: $id, input: $input) {
            textRow {
                id
                __typename
                ${field}
                ${extraFields}
            }
        }
    }`)

    return (
        <form noValidate autoComplete="off">
            {fullWidth ?
                <Grid container alignItems="flex-end">
                    <Grid item xs={9}>
                        <TextField
                            fullWidth={fullWidth}
                            id="standard-basic"
                            label={label}
                            disabled={disabled}
                            helperText={helptext}
                            onChange={(e) => setVal(e.target.value)} value={val}/>
                    </Grid>
                    <Grid item xs={3}>
                        <ButtonGroup size='small'>
                            <Button
                                color='primary'
                                onClick={() => mutateTextRow({variables: {id, input: {[field]: val}}})}>Save</Button>
                            <Button
                                color='secondary'
                                onClick={() => setVal(value)}>Reset</Button>
                        </ButtonGroup>
                    </Grid>
                </Grid>
                :
                <Grid container alignItems="flex-end">
                    <Grid item>
                        <TextField
                            id="standard-basic"
                            label={label}
                            disabled={disabled}
                            helperText={helptext}
                            onChange={(e) => setVal(e.target.value)} value={val}/>
                    </Grid>
                    <Grid item>
                        <ButtonGroup size='small'>
                            <Button
                                color='primary'
                                onClick={() => mutateTextRow({variables: {id, input: {[field]: val}}}).then(() => setFirstVal(val))}>Save</Button>
                            <Button
                                color='secondary'
                                disabled={firstVal === val}
                                onClick={() => setVal(value)}>Reset</Button>
                        </ButtonGroup>
                    </Grid>
                </Grid>
            }
        </form>
    )
}


const TextRowCheckboxFormControl = ({id, field, value, label, helptext, extraFields, disabled}) => {
    const [checked, setChecked] = useState(value)
    const [mutateTextRow] = useMutation(gql`
    mutation mutate_TextRow_${field}($id: ID!, $input: PatchTextRowInput!) {
        patchTextRow(id: $id, input: $input) {
            textRow {
                id
                __typename
                ${field}
                ${extraFields}
            }
        }
    }`)
    const toggle = () => {
        // console.log(eventValue, value)
        const variables = { id, input: { [field]: !checked } }
        mutateTextRow({ variables })
            .then((e) => setChecked(!checked))
            .catch((e) => {
                alert(`정상적으로 수행되지 않았습니다. message: ${String(e)}`)
            })
    }

    useEffect(() => {
        setChecked(value)
    }, [value])

    return (
        <FormControlLabel
            control={<Checkbox checked={checked} onChange={toggle} />}
            disabled={disabled}
            helptext={helptext}
            label={label}
        />
    )
}



const TextRowDetail = ({labeling, startPolling}) => {
    const [picked, setPicked] = useState(true);
    const [page, setPage] = useState(1);
    const {data, loading, error } = useQuery(QUERY_TEXT_ROWS, {
        variables: {id: labeling.id, picked, page},
        fetchPolicy: 'no-cache'
    })
    const { t } = useTranslation();
    const [label] = useMutation(gql`
    mutation labelText($id: ID!) {
      labelText(id: $id) {
        labeling {
          id
          buildTagStatus
          __typename
        }
      }
    }
    `);
    if (loading) return 'loading'
    if (error) return String(error)

    if (!(labeling && labeling.buildTagStatus === 'DONE')) {
        return `WORKING (status: ${labeling && labeling.buildTagStatus ? labeling.buildTagStatus : '-'})`
    }

    if (!(data && data.textRows)) {
        return 'no-data'
    }

    const colormap = {}
    data.textRowsStat.map((m, idx) => {
        colormap[m.tag] = COLOR10[idx] || '#cccccc';
    })

    return (
        <>
            <Box mt={4} mb={1}>
                <Typography variant='h5'>
                    {t('Clustering Tags')}
                </Typography>
            </Box>
            <TextTagStat data={data.textRowsStat} colormap={colormap}/>

            <Box mt={4} mb={1}>
                <Typography variant='h5'>
                    {t('Clustering Details')}
                </Typography>
            </Box>

            {labeling.textProcessingAlStep > 0 ?
                <Alert>
                    <AlertTitle>
                        {t('Text and Tag correction - No. ')}{labeling.textProcessingAlStep}
                    </AlertTitle>
                    <Grid container justify='space-between'>
                        <Grid item>
                            <Box mb={2}>
                                <Typography>
                                    {picked ?
                                        'You can correct or newly enter the labeling results of these data.'
                                        :
                                        'You can review the first tagging results and improve them by entering the proper labeling results.'
                                    }
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item>
                            <ButtonGroup>
                                <Button disabled={picked} onClick={()=> setPicked(true)}>{t('Show picked')}</Button>
                                <Button disabled={!picked} onClick={() => setPicked(false)}>{t('Show all')}</Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={()=>{
                                        label({variables: {id: labeling.id}}).then(() => {
                                            startPolling(3000);
                                        })
                                    }}>{t('Start active-learn labeling')}
                                </Button>
                            </ButtonGroup>
                        </Grid>
                    </Grid>
                </Alert>
                :
                <Alert>
                    <AlertTitle>{t('Text and Tag correction - No. ')}{labeling.textProcessingAlStep}</AlertTitle>
                    <Typography>
                        {t('User can improve the automatically tagged results by correcting them')}
                    </Typography>
                </Alert>
            }
            {/* <Grid container>
                <Grid item xs={1}></Grid>
                <Grid item xs={7}></Grid>
                <Grid item xs={4}></Grid>
            </Grid>
            <Table stickyHeader size='small'>
                <TableHead>
                    <TableRow>
                        <TableCell align='center'>{t('picked')}</TableCell>
                        <TableCell>{t('text')}</TableCell>
                        <TableCell style={{minWidth: '400px'}}>{t('tag')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody> */}
            {data.textRows.objects.map(row => (
                <Grid container key={row.id} style={{padding: '12px', borderBottom: '1px dashed #cccccc'}}>
                    <Grid item xs={9} alignItems='center'>
                        {row.text}
                    </Grid>
                    <Grid item xs={3} alignItems='center'>
                        <TextRowCheckboxFormControl
                            id={row.id}
                            field='picked'
                            value={row.picked}
                            label='picked'
                            helptext=''
                            extraFields=''
                            disabled={false}
                        />
                        <TextRowTextFormControl
                            id={row.id}
                            field='tag'
                            value={row.tag}
                            label=''
                            helptext=''
                            extraFields=''
                            disabled={false}
                        />
                    </Grid>
                </Grid>
            ))}
            {/* </TableBody> */}
            {/* </Table> */}
            <Box style={{textAlign:"center"}}>
                <Button disabled={!data.textRows.hasPrev} onClick={() => setPage(page-1)}>Prev</Button>
                <Button disabled={true}>{`${data.textRows.page} / ${data.textRows.pages}`}</Button>
                <Button disabled={!data.textRows.hasNext} onClick={() => setPage(page+1)}>Next</Button>
            </Box>

        </>
    )
}


// const StatusIndicator = ({data}) => {
//     const { t } = useTranslation();

//     if (data && data.experimentProcess && data.experimentProcess.errorMessage) {
//         return <Box mb={4}><Alert severity="error">
//         <AlertTitle>{t('Error')}</AlertTitle>
//         {data.experimentProcess.errorMessage}
//         </Alert></Box>
//     }

//     return data && data.experimentProcess
//         ?
//         <Box mb={4}><Alert severity="info">
//         <AlertTitle>
//             Labeling({
//                 data.labeling.textProcessingAlStep > 0 ?
//                     'few-shot'
//                     :
//                     'zero-shot'
//             }) {t('is on progress')}</AlertTitle>
//             {
//                 data.labeling.textProcessingStep === 'LOADING' ?
//                     <u><Spinner/>loading</u>
//                     :
//                     "loading"
//             }
//             {' - '}
//             {
//                 data.labeling.textProcessingStep === 'VECTORIZING' ?
//                     <u><Spinner/>vectorizing</u>
//                     :
//                     "vectorizing"
//             }
//             {' - '}
//             {
//                 data.labeling.textProcessingStep === 'CLUSTERING' ?
//                     <u><Spinner/>clustering</u>
//                     :
//                     "clustering"
//             }
//             {' - '}
//             {
//                 data.labeling.textProcessingStep === 'LABELING' ?
//                     <u><Spinner/>{t('labeling')}</u>
//                     :
//                     "labeling"
//             }
//             {
//                 data.labeling.textProcessingAlUse  ?
//                 <>
//                     {' - '}
//                     {
//                         data.labeling.textProcessingStep === 'VECTORIZING4AL' ?
//                             <u><Spinner/>vectorizing(2)</u>
//                             :
//                             "vectorizing(2)"
//                     }
//                     {' - '}
//                     {
//                         data.labeling.textProcessingStep === 'ALING' ?
//                             <u><Spinner/>learning</u>
//                             :
//                             "learning"
//                     }
//                 </>
//                 :
//                 null
//             }
//             {' - '}
//             {
//                 data.labeling.textProcessingStep === 'PLOTTING' ?
//                     <u><Spinner/>plotting</u>
//                     :
//                     "plotting"
//             }
//             {' - '}
//             {
//                 data.labeling.textProcessingStep === 'FINISH' ?
//                     <u>finish</u>
//                     :
//                     "finish"
//             }
//         </Alert></Box>
//         :
//         null
// }


const ZeroShotConfiguration = ({data, id, startPolling}) => {
    const disabled = data && data.labeling && (
        data.labeling.buildTagStatus === 'PROCESSING' ||
        data.labeling.buildTagStatus === 'REQUEST'
    )
    const { t } = useTranslation();
    const [label] = useMutation(gql`
    mutation labelText($id: ID!) {
      labelText(id: $id) {
        labeling {
          id
          buildTagStatus
          __typename
        }
      }
    }
  `);
    const [clear] = useMutation(gql`
    mutation resetLabeling($id: ID!) {
    clearLabelingText(id: $id) {
        labeling {
        id
        buildTagStatus
        __typename
        }
    }
    }
    `);
    const [mutateTextClusterNo] = useMutation(gql`
    mutation patchTextClusterN($id: ID!, $input: PatchLabelingInput!) {
        patchLabeling(id: $id, input: $input) {
            labeling {
                id
                textClusterN
                __typename                
            }
        }
    }`)

    return data && data.labeling ? <Paper elevation={0}>
            <Box mt={3} mb={2}>
                <Typography variant='h5'>
                    {t('Configuration')}
                </Typography>
            </Box>
            <Table size='small'>
                <TableBody>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Typography color='textSecondary'>
                                zeroshot은 특별한 도움정보 없이 text에서 키워드를 추출해서,
                                분류와 동시에 라벨링을 수행합니다.
                                결과값에 대해서는 fewshot을 이용해서 사용자가 더 의미있는 데이터로
                                만들어낼 수 있습니다.
                            </Typography>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Status</TableCell>
                        <TableCell>{data.labeling.buildTagStatus}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>{t('n_clusters')}</TableCell>
                        <TableCell>
                            <FormControl>
                                <Select
                                    labelId={`labeling-textClusterN-label`}
                                    id={`labeling-textClusterN-select`}
                                    value={data.labeling.textClusterN}
                                    disabled={false}
                                    onChange={(e) => {
                                        mutateTextClusterNo({ variables: { id: data.labeling.id, input: { textClusterN: e.target.value } } })
                                            .catch((e) => {
                                                alert(`정상적으로 수행되지 않았습니다. message: ${String(e)}`)
                                            })
                                    }}
                                >
                                    {[2,3,4,5,6,7,8,9,10].map(c => <MenuItem value={c}>{String(c)}</MenuItem>)}
                                </Select>
                                <FormHelperText>cluster 분류개수를 정의합니다.</FormHelperText>
                            </FormControl>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell>
                            <ButtonGroup>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    disabled={disabled}
                                    onClick={()=>{
                                        label({variables: {id}}).then(() => {
                                            startPolling(3000);
                                        })
                                    }}>{t(`Start labeling`)}
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    disabled={disabled}
                                    onClick={()=>{
                                        clear({variables: {id}});
                                    }}
                                >
                                    {t('Clear label data')}
                                </Button>
                            </ButtonGroup>
                        </TableCell>
                    </TableRow>
                    {/* <tr>
                    <td>{t('cluster-method')}</td>
                    <td>
                        <FieldUpdater onLoad={() => refetch()}
                            showLabel={false}
                            type='select'
                            path={`/datasets/${dataset_id}/labelings/${col_id}/`}
                            field='textClusterMethod'
                            value={data.labeling.textClusterMethod}/>
                        <span className='help-text'>
                            분류방법{data.labeling.textClusterMethod}
                        </span>
                    </td>
                </tr> */}
                </TableBody>
            </Table>
            {/* textProcessingAlUse: {String(data.labeling.textProcessingAlUse)} */}
            {/* textProcessingStep: {data.labeling.textProcessingStep} */}
            {data && data.labeling && !data.labeling.textProcessingAlUse && data.labeling.textProcessingStep === 'FINISH' ?
                <TextTagResult labeling={data.labeling} />
                :
                null
            }
        </Paper>
        :
        null
}


const FewShotConfiguration = ({data, id, startPolling}) => {
    const disabled = data && data.labeling && (
        data.labeling.buildTagStatus === 'PROCESSING' ||
        data.labeling.buildTagStatus === 'REQUEST'
    )
    const { t } = useTranslation();
    const [label] = useMutation(gql`
    mutation labelText($id: ID!) {
      labelText(id: $id, activeLearn: true) {
        labeling {
          id
          buildTagStatus
          __typename
        }
      }
    }
    `);
    return data && data.labeling ? (
            <Box>
                <Typography color='textSecondary'>
                    {t('Improve results with your annotation.')}
                </Typography>
                <Paper>
                    {data.labeling.textProcessingAlStep === 0 ?
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Actions</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            disabled={disabled}
                                            onClick={()=>{
                                                label({variables: {id}}).then(() => {
                                                    startPolling(3000);
                                                })
                                            }}>{t(`Start active-learn labeling`)}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        :
                        <TextRowDetail
                            labeling={data.labeling}
                            startPolling={startPolling}/>
                    }
                </Paper>
            </Box>
        )
        :
        null
}

export default ({id}) => {
    const { t } = useTranslation();
    const [panel, setPanel] = useState('zero')
    // const [ showIndex, setShowIndex ] = useState(0)
    const {data, loading, error, refetch, startPolling, stopPolling} = useQuery(
        QUERY_PROCESS_AND_NL,
        {
            variables: {
                labelingId: id
            }
        }
    )

    if (loading) return 'loading'
    if (error) return String(error)

    const handleChange = (event, newValue) => {
        setPanel(newValue);
    };
    const isFinished = (value) => value.finishedAt !== null


    if (data && data.labeling.experimentbasePtr.processes) {
        let processes=data.labeling.experimentbasePtr.processes;
        if (processes.every(isFinished)) {
            stopPolling();
            refetch()
            // alert('stop')
        }
        else {
            startPolling(3000)
        }
    }

    return (
        <>
            <Box mb={2}>
                <AppBar position="static" color="default" elevation={0}>
                    <Tabs
                        value={panel}
                        onChange={handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                    >
                        <Tab label="Zero-shot" value="zero"/>
                        <Tab label="Few-shot" value="few"/>
                        <Tab label="Review" value="review"/>
                    </Tabs>
                </AppBar>
            </Box>
            {panel === 'zero' ?
                <ZeroShotConfiguration
                    data={data}
                    id={id}
                    startPolling={startPolling}/>
                :
                null
            }
            {panel === 'few' ?
                <FewShotConfiguration
                    data={data}
                    id={id}
                    startPolling={startPolling}/>
                :
                null
            }
            {panel === 'review' ?
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Box mb={2}><Typography variant='h5'>{t('Metrics')}</Typography></Box>
                        <Table size='small'>
                            <TableBody>
                                {data && data.labeling && data.labeling.metrics ?
                                    data.labeling.metrics.map((metric) => (
                                        <TableRow>
                                            <TableCell>{metric.name}</TableCell>
                                            <TableCell>{metric.value}</TableCell>
                                        </TableRow>
                                    ))
                                    :
                                    null
                                }
                            </TableBody>
                        </Table>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Box mb={2}><Typography variant='h5'>{t('Configuration')}</Typography></Box>
                        <Table size='small'>
                            <TableBody>
                                <TableRow>
                                    <TableCell>{t('Add labeled info.(tags) to new features')}</TableCell>
                                    <TableCell>
                                        <ColumnCheckboxFormControl
                                            id={id}
                                            field='textUseTagFeature'
                                            value={data.labeling.textUseTagFeature}
                                            label=''
                                            helptext=''
                                            extraFields=''
                                            disabled={true}
                                        />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        {t('Add text-vector to new features')}
                                    </TableCell>
                                    <TableCell>
                                        <ColumnCheckboxFormControl
                                            id={id}
                                            field='textUseVectorFeatures'
                                            value={data.labeling.textUseVectorFeatures}
                                            label=''
                                            helptext=''
                                            extraFields=''
                                            disabled={false}
                                        />
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Grid>
                    <Grid item xs={12} sm={12}>
                        <Typography variant='h5'>{t('Clustering visualization')}</Typography>
                        {data.labeling.visualizedObjects.map(v =>
                            <Box component="div" mt={1} mb={1}>
                                <Alert severity={v.error ? 'error' : 'info'} variant="outlined">
                                    <AlertTitle>{t(v.title)}</AlertTitle>
                                    {v.error ?
                                        v.message
                                        :
                                        <>
                                            {t('about-' + v.name)}
                                            <Grid container justify="flex-end">
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    size="small"
                                                    component="a"
                                                    target="_blank"
                                                    href={v.file.url}>{t('Open plot in new tab')}</Button>
                                            </Grid>
                                            {v.file.ext === 'png' ?
                                                <>
                                                    <img src={v.file.url} alt={'plot'}/>
                                                </>
                                                : null}
                                            {v.file.ext === 'html' ?
                                                <>
                                                    <iframe
                                                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                                        border="0"
                                                        title='plot'
                                                        style={{borderWidth: '0'}}
                                                        src={v.file.url} width="100%" height="800"/>
                                                </>
                                                : null}
                                        </>
                                    }
                                </Alert>
                            </Box>
                        )}
                    </Grid>
                </Grid>
                :
                null
            }
        </>
    )
}
