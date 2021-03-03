/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-script-url */
import React, {useState, forwardRef} from 'react'
import UploadDropZone from "@rpldy/upload-drop-zone";
import Spinner from '../utils/Spinner'
import { connect } from 'react-redux';
import { toastError, toastSuccess } from '../utils';
import { makeStyles, AppBar, Tabs, Tab, Button, ButtonGroup, Box, Table, TableHead, TableBody, TableCell, TableRow, Typography, LinearProgress } from '@material-ui/core'
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "react-apollo";
import gql from "graphql-tag"
import { Alert } from '@material-ui/lab';
import ChunkedUploady, {useChunkStartListener, useChunkFinishListener} from "@rpldy/chunked-uploady";
import {useItemFinishListener, useItemStartListener} from "@rpldy/uploady";
import { asUploadButton } from "@rpldy/upload-button";
import SparkMD5 from 'spark-md5'
import { endpoint } from '../index'

function LinearProgressWithLabel(props) {
  // const { t } = useTranslation();
  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

const useStyles = makeStyles((theme) => ({
  textContainer: {
    display: 'block',
    width: '200px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));


function calhash(file, setHash) {
  var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
      chunkSize = 2097152,                             // Read in chunks of 2MB
      chunks = Math.ceil(file.size / chunkSize),
      currentChunk = 0,
      spark = new SparkMD5.ArrayBuffer(),
      fileReader = new FileReader();

  fileReader.onload = function (e) {
      console.log('read chunk nr', currentChunk + 1, 'of', chunks);
      spark.append(e.target.result);                   // Append array buffer
      currentChunk++;

      if (currentChunk < chunks) {
          loadNext();
      } else {
          let h = spark.end()
          console.log('finished loading');
          console.info('computed hash', h);  // Compute hash
          setHash(h)
      }
  };

  fileReader.onerror = function () {
      console.warn('oops, something went wrong.');
  };

  function loadNext() {
      var start = currentChunk * chunkSize,
          end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;

      fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
  }

  loadNext();
}



const ChunkComponent = ({setUploading, onComplete, createType}) => {
  const [id, setId] = useState(null)
  const [hash, setHash] = useState('')
  const [pct, setPct] = useState(null)
  let idd = null
  const { t } = useTranslation();

  useItemStartListener((data) => {
    // console.log(data);
    setPct(0)
    setHash('')
    calhash(data.file, setHash)
    setUploading(true)
  })

  useChunkStartListener((data) => {
    // console.log(data, id)
    if (id || idd) {
      if (data.item.completed === 0) {
        idd = null; setId(null)
        return null
      }
      return {
        sendOptions: {...data.sendOptions, params: {upload_id: id || idd}}
      }
    }
    return null;
  })

  useChunkFinishListener((data) => {
    // console.log(data)
    const {upload_id: uploadId} = data.uploadData.response.data;
    const {completed: pct} = data.item;
    setId(uploadId); idd = uploadId
    setPct(pct)
    return {uploadData: {...data.uploadData, state: 'fff', hello: '123'}};
  })

  useItemFinishListener((data) => {
    // console.log('ITEM FINISH', data)
    setPct(100)
    setUploading(false)
    if (id || idd) {

      const jwt = localStorage.getItem('jwt')
      let formData = new URLSearchParams()
      formData.append('upload_id', id || idd)
      formData.append('md5', hash)
      formData.append('createType', createType)

      fetch(endpoint + '/chunked_upload_complete/', {
        method: 'post',
        headers: {
          // 'Content-Type': 'application/json',
          'Authorization': `JWT ${jwt}`,
        },
        body: formData,
      }).then((data) => data.json()).then((data) => {
        // console.log(data)
        toastSuccess(data.message)
        if (onComplete)
            onComplete()
      })
    }
    return null
  })

  return pct > 0 ? <Box><LinearProgressWithLabel value={pct}/>
    <Typography color='textSecondary'>hash:{hash || t('calculating') + '...'}</Typography>
  </Box> : null
}


const DivUploadButton = asUploadButton(forwardRef(
  (props, ref) => {
    const { t } = useTranslation();
    return (
      <div {...props} style={{ cursor: "pointer" }} className='dropzone'>
        <p>{t("Drag 'n' drop some files here, or click to select files")} 등록할 수 있는 파일의 최대 크기는 1G입니다. 다만 실험에 사용되는 데이터는 최대 10만건으로 크기가 제한됩니다.</p>
      </div>
    )
  }
));


const WorkspaceFiles = ({refreshExperiments, createType}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [uploading, setUploading] = useState(false)
  const {data} = useQuery(gql`query workspaceFiles {
    workspaceFiles {
      title
      name
      suffix
      filesizeHumanized
      url
    }
    s3Files {
      title
      name
      suffix
      filesizeHumanized
      url
    }
  }
  `)

  const [value, setValue] = React.useState("upload");
  const showTab = (event, newValue) => {
      setValue(newValue);
  };
  const QUERY = {
    experiment: gql`
    mutation createExperiment($sourceUri: String!, $uriType: String!) {
      createExperiment(sourceUri: $sourceUri, uriType: $uriType) {
        __typename
        experiment {
          __typename
          id
          name
          status
        }
      }
    }
    `,
    labeling: gql`
    mutation createLabeling($sourceUri: String!, $uriType: String!) {
      createLabeling(sourceUri: $sourceUri, uriType: $uriType) {
        __typename
        labeling {
          __typename
          id
          name
        }
      }
    }
    `,
    clustering: gql`
    mutation createClustering($sourceUri: String!, $uriType: String!) {
      createClustering(sourceUri: $sourceUri, uriType: $uriType) {
        __typename
        clustering {
          __typename
          id
          name
        }
      }
    }`
  }
  const [createExperiment, { loading: creating }] = useMutation(QUERY[createType]);

  const createExperimentFromUri = (uri, uriType) => {
    return createExperiment({ variables: {sourceUri: uri, uriType: uriType}})
    .then(() => {
      refreshExperiments()
      toastSuccess('실험생성이 요청되었습니다.')
    })
    .catch(e => {
      toastError(e)
      // onLoad()
    })

  }

  return (
    <>
        <Box mt={1} mb={2}>
        <Typography color='textSecondary'>
          {t('about-sources')}
        </Typography>
        </Box>
        <AppBar position="static" color="default" elevation={0}>
            <Tabs
                value={value}
                onChange={showTab}
                indicatorColor="primary"
                textColor="primary"
            >
                <Tab label={t("New Upload")} value="upload" />
                <Tab label={t("From S3")} value="s3" />
                <Tab label={t("History")} value="history" />
            </Tabs>
        </AppBar>

        {value === 'upload' ? <Box>
          <Box mt={2} mb={1}></Box>
          {data && data.startUpload ?
            <b><Spinner></Spinner> {t('uploading..')}</b>
            :
            <Box>
              <ChunkedUploady
                destination={{ url: endpoint + "/chunked_upload/" }}
                chunkSize={2142880}>
                  {!uploading ?
                    <UploadDropZone onDragOverClassName="dropzone"
                                    // grouped={grouped}
                                    // maxGroupSize={groupSize}
                                    >
                      <DivUploadButton/>
                    </UploadDropZone>
                    :
                    <Alert severity='warning'>
                      {t('업로드중입니다. 업로드가 끝나면 실험이 자동으로 생성됩니다. 창을 닫지 말아주세요.')}
                    </Alert>
                  }
                  <ChunkComponent
                    createType={createType}
                    setUploading={setUploading} onComplete={() => refreshExperiments()}/>
              </ChunkedUploady>
            </Box>
          }
          <Box mt={2} mb={10}></Box>
        </Box>
        :
        null
        }

        {value === 'history' ? <Box>
          <Box mt={2} mb={1}></Box>
          <Table stickyHeader size='small'>
          <TableHead>
            <TableRow>
              <TableCell>{t('type')}</TableCell>
              <TableCell>{t('title')}</TableCell>
              <TableCell align='right'>{t('filesize')}</TableCell>
              <TableCell>action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data && data.workspaceFiles ? data.workspaceFiles.map(file => {
              return <TableRow key={file.name}>
                <TableCell>{file.suffix} </TableCell>
                <TableCell>
                  <div className={classes.textContainer}>
                    {file.name}
                  </div>
                </TableCell>
                <TableCell align='right'>{file.filesizeHumanized} </TableCell>
                <TableCell>
                  <ButtonGroup size='small'>
                  <Button disabled={creating || uploading} variant="contained" color='primary' size="small" onClick={() => {
                    createExperimentFromUri(file.title, 'HTTP')
                  }} >{t('create')}</Button>
                  <Button size='small' variant="outlined" color='primary' component='a' href={file.url}>{t('Download')}</Button>
                  </ButtonGroup>
                </TableCell>
              </TableRow>
            }) : null}
            {data && data.workspaceFiles.length === 0 ? <TableRow>
                <TableCell align='center' colSpan={4}>{t('No Data')}</TableCell>
              </TableRow> : null}
          </TableBody>
        </Table>
      </Box>
      :
      null
      }

      {value === 's3' ? <Box>
        <Box mt={2} mb={1}></Box>
        <Table stickyHeader size='small'>
          <TableHead>
            <TableRow>
            <TableCell>{t('type')}</TableCell>
            <TableCell>{t('title')}</TableCell>
            <TableCell align='right'>{t('filesize')}</TableCell>
            <TableCell>action</TableCell>
          </TableRow>
          </TableHead>
          <TableBody>
            {data && data.s3Files ? data.s3Files.map(file => {
              return <TableRow key={file.name}>
                <TableCell>{file.suffix} </TableCell>
                <TableCell>
                  <div className={classes.textContainer}>
                    {file.name}
                  </div>
                </TableCell>
                <TableCell align='right'>{file.filesizeHumanized} </TableCell>
                <TableCell>
                  <ButtonGroup size='small'>
                  <Button disabled={creating || uploading} variant="contained" color='primary' size="small" onClick={() => {
                    createExperimentFromUri(file.url, 'S3')
                  }} >{t('create')}</Button>
                  <Button size='small' variant="outlined" color='primary' component='a' href={file.url}>{t('Download')}</Button>
                  </ButtonGroup>
                </TableCell>
              </TableRow>
            }) : null}
            {data && data.s3Files.length === 0 ? <TableRow>
                <TableCell align='center' colSpan={4}>{t('No Data')}</TableCell>
              </TableRow> : null}
          </TableBody>
        </Table>
      </Box>
      :
      null
      }
    </>
  )
}


// export default connect((state) => {
//   return ({
//     data: state.workspace,
//   })
// })(WorkspaceFiles);
export default WorkspaceFiles;