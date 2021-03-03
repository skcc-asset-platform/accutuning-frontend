/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect }from 'react';
import { gql } from 'apollo-boost';
import { useQuery } from 'react-apollo';
import { ModalContent, ModalHeader, ModalBody } from '../utils';
import ExperimentDatasetChart from './ExperimentDatasetChart';
// import MutateAction from "../utils/MutateAction";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import { Card, CardContent } from '@material-ui/core';
import { useTranslation } from "react-i18next";

const QUERY_DATASET_CORR = gql`
query queryDatasetCorr($id: Int!) {
    dataset (id: $id) {
        id
        visualizedObjects {
            id
            title
            json
        }
    }
}
`

export default ({id, onRequestClose}) => {
    const { data, loading, error, refetch} = useQuery(QUERY_DATASET_CORR, { variables: {id}});
    const [value, setValue] = React.useState('rank_2d_pearson.json');  
    const { t } = useTranslation();
    const handleChange = (event, newValue) => {
      setValue(newValue);
    };

    useEffect(() => {
        refetch()
    }, [refetch])

    if (!data && loading) {
        return 'loading'
    }

    if (error) {
        return <div style={{color: 'red'}}>
            {String(error)}, dataset_id: {id}
        </div>
    }

    let visualization_data = [
        { jsonType: 'rank_2d_pearson.json' , title: 'Rank 2D Pearson', disable: true},
        { jsonType: 'rank_2d_covariance.json' , title: 'Rank 2D Covariance', disable: true},
        { jsonType: 'rank_1d.json' , title: 'Rank 1D', disable: true},
        { jsonType: 'rad_viz.json' , title: 'Radial Visualizer', disable: true},
        { jsonType: 'pca.json' , title: 'PCA', disable: true},
        { jsonType: 'parallel_coordinates.json' , title: 'Parallel Coordinates', disable: true},
        { jsonType: 'feature_importance.json' , title: 'Feature Importance', disable: true},
        { jsonType: 'feature_corr.json' , title: 'Feature Correlation', disable: true},
        { jsonType: 'corr.json' , title: 'Correlation', disable: true},
        { jsonType: 'class_balance.json' , title: 'Class Balance', disable: true},
        { jsonType: 'balanced_binning_reference.json' , title: 'Balanced binning reference', disable: true},
    ];

    if(data && data.dataset && data.dataset.visualizedObjects){
        visualization_data.map((titleData, idx) => {
            data.dataset.visualizedObjects.map((chartData) => {
                if(chartData.title === titleData.jsonType){
                    titleData.disable = false;
                }
            }) 
        })
    }
    

    // const titleSwitch = (title) => {
    //     switch(title){
    //         case 'corr.json':
    //             return <a className="link_menu">{t('Correlation')}</a>
    //         case 'feature_corr.json':
    //             return <a className="link_menu">{t('Feature Correlation')}</a>
    //         case 'class_balance.json':
    //             return <a className="link_menu">{t('Class Balance')}</a>
    //         case 'balanced_binning_reference.json':
    //             return <a className="link_menu">{t('Balanced binning reference')}</a>
    //         case 'rank_2d_pearson.json':
    //             return <a className="link_menu">{t('Rank 2D Pearson')}</a>
    //         case 'rank_2d_covariance.json':
    //             return <a className="link_menu">{t('Rank 2D Covariance')}</a>
    //         case 'rank_1d.json':
    //             return <a className="link_menu">{t('Rank 1D')}</a>
    //         case 'rad_viz.json':
    //             return <a className="link_menu">{t('Radial Visualizer')}</a>
    //         case 'parallel_coordinates.json':
    //             return <a className="link_menu">{t('Parallel Coordinates')}</a>
    //         case 'pca.json':
    //             return <a className="link_menu">{t('PCA')}</a>
    //         case 'feature_importance.json':
    //             return <a className="link_menu">{t('Feature Importance')}</a>
    //         default:
    //             return <a className="link_menu">{title}</a>

    //     }

    // }

    return (
        <ModalContent>
            <ModalHeader title={t('Visualization')}/>
            <ModalBody>
                <div className="wrap_visual">
                    {data && data.dataset && data.dataset.visualizedObjects ?
                        <AppBar position="static" color="default" style={{maxWidth: '650px'}}>
                            <Tabs
                                value={value}
                                onChange={handleChange}
                                indicatorColor="primary"
                                textColor="primary"
                                variant="scrollable"
                            >
                            {visualization_data.map(vo => (
                                <Tab label={<a className="link_menu">{t(vo.title)}</a>} value={vo.jsonType} disabled={vo.disable}/>
                            ))
                            }
                            </Tabs>
                        </AppBar>
                        :
                        null
                    }
                    <Card>
                        <CardContent>
                            {data && data.dataset && data.dataset.visualizedObjects ?
                            data.dataset.visualizedObjects.map((vo, idx) => (value === vo.title ?
                                <>
                                    {<div className="txt_c" key={vo.title}><ExperimentDatasetChart title={vo.title} data={vo.json}/></div>}
                                </>
                                : null))
                            :
                            null
                        }
                        </CardContent>
                    </Card>

                    {data && data.dataset && data.dataset.visualizedObjects.length === 0 ?
                        'no visualization objects'
                        :
                        null
                    }
                    <div className="footer_popup">
                        <button className="btn_close" onClick={onRequestClose}><span className="ico_automl ico_close">{t('Close Popup')}</span></button>
                    </div>
                </div>
            </ModalBody>
        </ModalContent>
    )
}