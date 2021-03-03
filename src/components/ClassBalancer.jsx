import React, { useState } from 'react';
import { HorizontalBar } from 'react-chartjs-2';
import { gql } from 'apollo-boost';
import { useQuery, useMutation } from 'react-apollo';
import {ModalBody, ModalContent, ModalHeader, toastError} from '../utils'
import {
    Box,
    Button,
    FormGroup,
    TextField,
} from '@material-ui/core';
import {useTranslation} from "react-i18next";


const QUERY_ClASS_BALANCER = gql`
query queryClassBalanceColumn($id:Int!, $targetColumnName:String!) {
    experiment(id: $id) {
        id
        __typename
        samplingSize
        useClassBalancer
        __typename
        dataset {
            id
            singleColumn (name: $targetColumnName) {
                id
                freqIdxJson
                freqJson
            }
        }
    }
}
`

export default ({ experimentId, targetColumnName }) => {
    const { t } = useTranslation();
    const {data, loading, error, refetch} = useQuery(QUERY_ClASS_BALANCER, {
        variables: {id: experimentId, targetColumnName: targetColumnName}
    })
    const [mutateExperiment] = useMutation(gql`
    mutation mutate_experiment($id: ID!, $input: PatchExperimentInput!) {
        patchExperiment(id: $id, input: $input) {
            experiment {
                id
                __typename
                samplingSize
                useClassBalancer
            }
        }
    }`)
    const [chartData, setChartData] = useState(null);

    if (loading) return 'loading'
    if (error) return String(error);

    let parsed_label = JSON.parse(data.experiment.dataset.singleColumn.freqIdxJson);
    let parsed_data = JSON.parse(data.experiment.dataset.singleColumn.freqJson);

    const orig_data=[];
    const label=[];
    parsed_data.map((e, i) => e>0 ? orig_data.push(e)&&label.push(parsed_label[i]) : null);

    let initialData = {
        labels: label,
        datasets: [
            {
                label: 'original',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                data: orig_data
            }
        ]
    };

    let chartOptions = {
        legend: { display: false },
        tooltips:{
            enabled:true
        },
        scales:{
            yAxes: [{
                gridLines:{
                    display:true,
                    drawBorder: true
                },
                ticks: {
                    display:true,
                    beginAtZero: true
                },
                stacked: true

            }],
            xAxes: [{
                stacked: true
            }]
        },
        onClick: (evt, item) => {
            if (item.length > 0) {
                let selected_value = orig_data[item[0]._index];
                let tmp_data = Array(orig_data.length);
                let added = Array(orig_data.length).fill(0);
                let deducted = Array(orig_data.length).fill(0);
                orig_data.forEach(function (vo, idx) {
                    if (vo === selected_value) {
                        tmp_data[idx] = selected_value;
                    } else if (vo < selected_value) {
                        tmp_data[idx] = vo;
                        added[idx] = selected_value - vo;
                    } else {
                        tmp_data[idx] = selected_value;
                        deducted[idx] = vo - selected_value;
                    }
                });
                setChartData({
                    datasets: [
                        {
                            label: 'original',
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1,
                            data: tmp_data
                        },
                        {
                            label: 'addition',
                            backgroundColor: 'rgba(153, 102, 255, 0.2)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 1,
                            data: added
                        },
                        {
                            label: 'deduction',
                            backgroundColor: 'rgba(255,99,132,0.2)',
                            borderColor: 'rgba(255,99,132,1)',
                            borderWidth: 1,
                            data: deducted
                        }
                    ]
                });
                const variables = {
                    id: data.experiment.id,
                    input: { samplingSize: JSON.stringify(selected_value*orig_data.length), useClassBalancer: true }
                };
                mutateExperiment({ variables })
                    .catch((e) => {
                        toastError(`정상적으로 수행되지 않았습니다. message: ${String(e)}`)
                });
                refetch();
            }
        },
    };

    return (
        <ModalContent>
            <ModalHeader title={t('Class balancer Configuration')}/>
            <ModalBody>
                <FormGroup row>
                    {data.experiment.useClassBalancer ?
                        <><p> Using class balancer(desired sampling size : {data.experiment.samplingSize} )</p>
                            <Button size="small" variant="outlined" color="primary"  variant="outlined"
                            onClick={() => {
                                const variables = {id: data.experiment.id, input: { useClassBalancer : false, useSampling : null } };
                                mutateExperiment({ variables })
                                    .catch((e) => {
                                        toastError(`정상적으로 수행되지 않았습니다. message: ${String(e)}`)
                                    });
                                setChartData(null);
                            }}>{t('Clear')}</Button></>
                        :
                        <p>{t('Please select a target class to balance with')}</p>
                        }
                </FormGroup>
                <Box>
                    <HorizontalBar data={chartData || initialData} options={chartOptions} width={415} height={415} />
                </Box>
            </ModalBody>
        </ModalContent>
    )
}