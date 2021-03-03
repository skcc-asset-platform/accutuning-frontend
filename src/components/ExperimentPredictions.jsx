/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { gql } from 'apollo-boost';
import { useQuery } from 'react-apollo';
import { useTranslation } from "react-i18next";
import Pagination from '@material-ui/lab/Pagination';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { Typography } from '@material-ui/core';
import PredictionResult from './PredictionResult'

const QueryPredictions = gql`
query QueryPredictions($targetDepId: Int! $predictionFirst: Int $predictionSkip: Int) {

    predictions(targetDepId: $targetDepId, predictionFirst: $predictionFirst, predictionSkip: $predictionSkip){
        id
        done
        duration
        inputJson
        output
        buildLime
        errorMessage
    }

    predictionsCount(targetDepId: $targetDepId)   
}
`


export default ({targetDepId, targetPreId, handleTargetPreId}) => {
    const predictionFirst = process.env.REACT_APP_EX_ROW_COUNT
    const [predictionPage, setPredictionPage] = React.useState(1);
    const [predictionSkip, setPredictionSkip] = useState(0);
    const [predictionPageCount, setPredictionPageCount] = useState(1);

    const { data, loading, error, refetch} = useQuery(QueryPredictions, { variables: {targetDepId:targetDepId, predictionFirst:predictionFirst, predictionSkip:predictionSkip}});
    const { t } = useTranslation();

    const handlePredictionPage = (event, value) => {
        setPredictionPage(value);
        setPredictionSkip((value - 1) * process.env.REACT_APP_EX_ROW_COUNT);
    };
    const handleRefreshTable = () =>{
        refetch()
    }
    useEffect(() => {
        if (data && data.predictions.length > 0) {
            setPredictionPageCount(Math.ceil(data.predictionsCount / process.env.REACT_APP_EX_ROW_COUNT));

            if (targetPreId === 0) {
                handleTargetPreId(data.predictions[0].id);
            }
        }else{
            handleTargetPreId(0);
        }
        refetch()
    }, [refetch, data, handleTargetPreId, targetPreId])

    if (loading) {
        return 'loading'
    }

    if (error) {
        return String(error)
    }

    return (
        <Box mt={2}>
            <h2>{t('Prediction History')}
                <Box component="span" ml={1}>
                    <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => handleRefreshTable(true)}>{t('Refresh')}</Button>
                </Box>
            </h2>
            <Typography>
                모델에서 수행한 예측이력을 조회할 수 있습니다.
            </Typography>
            <table className="tbl_g">
                <thead>
                    <th>id</th>
                    <th>{t('done')}</th>
                    <th>{t('lime')}</th>
                    <th>{t('output')}</th>
                    <th>{t('error')}</th>
                    <th>{t('elapsed')}</th>
                    <th>{t('Actions')}</th>
                </thead>
                <tbody>
                    {data.predictions.length > 0 ? data.predictions.map(pre => <tr key={pre.id}>
                        <td>{pre.id}</td>
                        <td>{String(pre.done)}</td> 
                        <td>{String(pre.buildLime)}</td> 
                        <td>{pre.output}</td>
                        <td>{pre.errorMessage}</td>
                        <td>{pre.duration/100000}s</td>
                        <td><Button variant="outlined" color="primary" onClick={() => handleTargetPreId(pre.id)}
                        disabled={pre.id === targetPreId}>{t('detail')}</Button></td>
                    </tr>) : <td colSpan='7'>{t('No deployment yet')}</td>}
                </tbody>
            </table>
            <Box my={2} display="flex" justifyContent="center">
                <Pagination count={predictionPageCount} page={predictionPage} onChange={handlePredictionPage} showFirstButton showLastButton/>
            </Box>

            {targetPreId !==0 ?
                <PredictionResult predictionPk={targetPreId}/>
            :
                null
            }
        </Box>
    )
}