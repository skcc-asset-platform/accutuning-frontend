import React from 'react';
import Plot from 'react-plotly.js';
import { HorizontalBar, Scatter, Line} from 'react-chartjs-2';
import { useTranslation } from "react-i18next";


const HeatmapPlot = ({parsed}) => {
    return (<Plot
        data={[
            {
                "z": parsed.data,
                "x": parsed.label,
                "y": parsed.label,
                "autocolorscale": true,
                "colorscale": 'RdBu',
                "type": "heatmap"
            }
        ]}
        useResizeHandler={true}
        style={{width: '100%', height: '100%'}}
        config={{displayModeBar: false}}
        layout={{
            "title": {
                "display": false,
            },
            "font": {
                "family": "Arial, sans-serif",
                "size": 12,
                "color": "#000"
            },
            "autosize": true,
            "xaxis": {
                "ticks": ""
            },
            "yaxis": {
                "ticks": ""
            }
        }}
    />)
}

const HorizontalBarPlot = ({parsed}) => {
    return (<HorizontalBar data={{
        labels: parsed.label,
        datasets: [
            {
                label: 'Ranking',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                data: parsed.data
            }
        ]
    }}
                           options={{
                               responsive: true,
                               title: {
                                   display: false,
                                   // text: 'Shapiro Ranking',
                                   // fontSize: 18,
                                   // fontColor: '#111',
                                   // fontStyle: 'normal',
                                   // fontFamily: " 'Lucida Grande', 'Lucida Sans Unicode', 'Arial', 'Helvetica', 'sans-serif'"
                               },
                               tooltips: {
                                   enabled: true
                               },
                               legend: {
                                   position: 'bottom'
                               },
                               scales: {
                                   xAxes: [{
                                       gridLines: {
                                           color: '#e6e6e6',
                                           lineWidth: 1,
                                           zeroLineColor: '#111'
                                       }
                                   }],
                                   yAxes: [{
                                       gridLines: {
                                           color: '#e6e6e6',
                                           lineWidth: 1,
                                           zeroLineColor: '#111'
                                       }
                                   }]
                               }
                           }} />)
}

const ScatterPlot = ({parsed}) => {
    let datasets = parsed.data.map((vo,idx)=>(
        {
            label: parsed.classes[idx],
            data:vo,
            borderColor: 'rgba(0, 0, 0, 0.1)',
            backgroundColor: 'rgb('+parsed.colors[idx]+')'
        }))
    return (<Scatter data = {{
        datasets: datasets
    }}
                     options={{
                         responsive: true,
                         title: {
                             display: false
                         },
                         tooltips: {
                             enabled: true
                         },
                         legend: {
                             position: 'bottom'
                         },
                         scales: {
                             xAxes: [{
                                 gridLines: {
                                     color: '#e6e6e6',
                                     lineWidth: 1,
                                     zeroLineColor: '#111'
                                 }
                             }],
                             yAxes: [{
                                 gridLines: {
                                     color: '#e6e6e6',
                                     lineWidth: 1,
                                     zeroLineColor: '#111'
                                 }
                             }]
                         }
                     }} />)
}


const LinePlot = ({parsed}) => {
    let datasets = parsed.data.map((vo,idx)=>(
        {
            data: vo,
            fill: false,
            borderColor: 'rgb('+parsed.colors[idx]+')',
            lineTension: 0
        }))
    return (<Line data = {{
        labels: parsed.label,
        datasets: datasets
    }}
                  options={{
                      responsive: true,
                      title: {
                          display: false,
                      },
                      tooltips: {
                          enabled: false
                      },
                      legend: {
                          display: false
                      },
                      scales: {
                          xAxes: [{
                              gridLines: {
                                  color: '#e6e6e6',
                                  lineWidth: 1,
                                  zeroLineColor: '#111'
                              }
                          }],
                          yAxes: [{
                              gridLines: {
                                  color: '#e6e6e6',
                                  lineWidth: 1,
                                  zeroLineColor: '#111'
                              }
                          }]
                      }
                  }} />)
}

export default ({title, data}) => {
    let parsed = null;
    const { t } = useTranslation();
    try {
        parsed = JSON.parse(data.replace(/'/g,'"'));
    }
    catch(err) {
        console.log(err);
    }
    if(title ==='rank_2d_covariance.json' || title ==='rank_2d_pearson.json' || title ==='corr.json' ){
        return (
            <HeatmapPlot parsed = {parsed} ></HeatmapPlot>
        )
    }else if(title ==='rank_1d.json'){
        return (
            <HorizontalBarPlot parsed = {parsed} ></HorizontalBarPlot>
        )
    }else if(title ==='rad_viz.json' || title ==='pca.json'){
        return (
            <ScatterPlot parsed = {parsed} ></ScatterPlot>
        )
    }else if(title ==='parallel_coordinates.json'){
        return (
            <LinePlot parsed = {parsed} ></LinePlot>
        )
    }



    return (
        <>
            {t('Preparing...')}
        </>
    )
}