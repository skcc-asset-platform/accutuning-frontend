/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { makeStyles } from '@material-ui/core';
import React from 'react';
import { Line } from 'react-chartjs-2';

const useStyles = makeStyles((theme) => ({
    chart: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "flex-start",
        width: "100%",
        height: "150px",
        padding: "15px 10px",
        // borderRadius: "5px",
        backgroundColor: "#f5f6f9",
        boxSizing: "border-box",
    }
}));

export default ({ data, label }) => {
    const classes = useStyles()
    const chartData = {
        labels: label,
        datasets: [
            {
                data: data,//data.slice(Math.max(data.length-20, 0)),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                lineTension: 0.1
            }
        ]
    };
    const chartOptions ={
        animation: {
            duration: 0
        },
        responsive: true,
        legend: {
            display: false
        },
        title: {
            display: false
        },
        tooltips: {
            mode: 'index',
            intersect: false
        },
        elements: {
            point: {
                radius: 2,
                borderWidth: 2,
            }
        },
        scales: {
            xAxes: [{
                scaleLabel: {
                    display: false
                },
                gridLines: {
                    display: false
                },
                ticks: {
                    display: false,
                    beginAtZero: true
                }
            }],
            yAxes: [{
                scaleLabel: {
                    display: false
                },
                gridLines: {
                    display: false,
                    drawBorder: false
                },
                ticks: {
                    display: true,
                    beginAtZero: true
                }
            }]
        }
    };
    return (
        <div className={classes.chart}>
            {data && data.length > 3 ?
                <Line data={chartData} options={chartOptions} width={580} height={150}/>
                :
                null
            }
        </div>
    )
}