import React from 'react'
import { gql } from 'apollo-boost';
import { useQuery } from 'react-apollo';
import { Button, Box, Grid } from "@material-ui/core";
import { Alert, AlertTitle } from '@material-ui/lab';
import { useTranslation } from "react-i18next";

const QUERY_DATASET_EDA = gql`
query queryClusterEDA ($experimentId: Int!) {
  experiment: clusteringExperiment(id: $experimentId) {
    __typename
    id
    clusterResults {
        id
        createdAt
        visualizedObjects {
            id
            name
            title
            error
            description
            message
            file {
                url
                ext
            }
        }
    }
  }
}
`

export default ({experimentId}) => {
    const { data, loading, error } = useQuery(
        QUERY_DATASET_EDA, { variables: {experimentId} });
    const { t } = useTranslation();

    if (loading) return 'loading..'
    if (error) return String(error)
    if (!loading && !data) return 'nodata'

    // let eda_data = [
    //     {
    //         edaTitle: "cluster_plot_convergence",
    //         viewTitle: "OPTIMIZING STEPS",
    //         viewDescription: "최적화를 어떻게 수행했는지 단계별 score를 표시합니다.",
    //         dataYn: false,
    //         fileExt: null,
    //         fileUrl: null,
    //     },
    //     {
    //         edaTitle: "cluster_plot",
    //         viewTitle: "CLUSTERING PLOT",
    //         viewDescription: "분포결과를 2차원 지도로 표시합니다.",
    //         dataYn: false,
    //         fileExt: null,
    //         fileUrl: null,
    //     },
    //     {
    //         edaTitle: "cluster_plot_bar",
    //         viewTitle: "CLUSTERING RESULT",
    //         viewDescription: "분류별 개수를 표시합니다.",
    //         dataYn: false,
    //         fileExt: null,
    //         fileUrl: null,
    //     },
    //     {
    //         edaTitle: "cluster_plot_box_strip",
    //         viewTitle: "CLUSTERING RESULT WITH BOX STRIP",
    //         viewDescription: "",
    //         dataYn: false,
    //         fileExt: null,
    //         fileUrl: null,
    //     },
    //     {
    //         edaTitle: "cluster_plot_parcoord",
    //         viewTitle: "CLUSTERING PAIRPLOT",
    //         viewDescription: t('about-pairplot'),
    //         dataYn: false,
    //         fileExt: null,
    //         fileUrl: null,
    //     },
    //     // {
    //     //     edaTitle: "cluster_plot_parcate",
    //     //     viewTitle: "CLUSTERING PAIRPLOT",
    //     //     viewDescription: t('about-pairplot'),
    //     //     dataYn: false,
    //     //     fileExt: null,
    //     //     fileUrl: null,
    //     // },
    //     // {
    //     //     edaTitle: "cluster_plot_pie_chart",
    //     //     viewTitle: "",
    //     //     viewDescription: "",
    //     //     dataYn: false,
    //     //     fileExt: null,
    //     //     fileUrl: null,
    //     // },
    //     // {
    //     //     edaTitle: "cluster_plot_variance_analysis",
    //     //     viewTitle: "",
    //     //     viewDescription: "",
    //     //     dataYn: false,
    //     //     fileExt: null,
    //     //     fileUrl: null,
    //     // }
    // ];

    // if(data && data.experiment && data.experiment.clusterResults && data.experiment.clusterResults[0].visualizedObjects){
    //     eda_data.map((titleData, idx) => {
    //         data.experiment.clusterResults[0].visualizedObjects.map((edaData) => {
    //             if(edaData.title === titleData.edaTitle){
    //                 titleData.file_ext = edaData.file.ext;
    //                 titleData.file_url = edaData.file.url;
    //                 titleData.dataYn = true;
    //             }
    //         })
    //     })
    // }

    // console.log(obj)

    return data && data.experiment && data.experiment.clusterResults && data.experiment.clusterResults[0].visualizedObjects ?
        data.experiment.clusterResults[0].visualizedObjects.map((v, idx) =>
            <Box component="div" mt={1} mb={1} key={idx}>
                <Alert severity={v.error ? 'error': 'info'} variant="outlined">
                    <AlertTitle>{t(v.title)}</AlertTitle>
                    <Box component="div" width="xl">{t('about-' + v.name)}
                    {v.error ?
                        v.message
                        :
                        <>
                            <Grid container justify="flex-end">
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                    component="a"
                                    target="_blank"
                                    href={v.file.url}>{t('Open plot in new tab')}</Button>
                            </Grid>
                            {v.file.ext === 'png' ? <>
                                <img src={v.file.url} alt={'plot'}/>
                            </> : null}
                            {v.file.ext === 'html' ? <>
                                <iframe sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                    border="0"
                                    title='plot'
                                    style={{borderWidth: '0'}}
                                    src={v.file.url} width="100%" height="800"/>
                            </>: null}
                        </>
                    }
                    </Box>
                </Alert>
            </Box>
        )
        :
        null
        ;
}