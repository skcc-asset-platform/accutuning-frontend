import React from 'react'
import MutateAction from '../utils/MutateAction';
import FieldUpdater from '../utils/FieldUpdater';
import { gql } from 'apollo-boost';
import { useQuery } from 'react-apollo';
import { useTranslation } from "react-i18next";
// import { Redirect } from 'react-router';


const EXPERIMENT_CONFIRM_QUERY = gql`
query experimentConfirm($id: Int!) {
    experiment (id: $id)  {
        id
        status
        metric
        availableMetrics
        estimatorType
        targetColumnName
        dataset:preprocessedDataset {
            id
            name
            columns {
                id
                name
            }
        }
    }
}`


export default ({id, onClose}) => {
    const { data, loading, error, refetch } = useQuery(EXPERIMENT_CONFIRM_QUERY, { variables: {id}});
    const { t } = useTranslation();
    // const [ redirectLeaderboard, setRedirectLeaderboard ] = useState(false)
    
    // if (redirectLeaderboard) {
    //     return <Redirect to={`/r/${id}/leaderboard/`}/>
    // }
    if (!data && loading) return 'loading..'
    if (error) return String(error)

    return (
        <div className="layer_automl layer">
            <div className="header_popup">
                <strong className="tit_popup">{t('Run AutoML')}</strong>
            </div>
            <div className="body_popup">
                <div className="wrap_btn">
                    <MutateAction
                        verb='patch'
                        path={`/experiments/${id}/`}
                        data={{estimatorType: 'CLASSIFIER'}}
                        className={data.experiment.estimatorType === 'CLASSIFIER' ? "btn_m on" : "btn_m"}
                        onLoad={refetch}>{t('Classification')}</MutateAction>
                    <MutateAction
                        verb='patch'
                        path={`/experiments/${id}/`}
                        data={{estimatorType: 'REGRESSOR'}}
                        className={data.experiment.estimatorType === 'REGRESSOR' ? "btn_m on" : "btn_m"}
                        onLoad={refetch}>{t('Regression')}</MutateAction>
                </div>
                <dl>
                    <div className="item_dl type_inline">
                        <dt>{t('Target')}</dt>
                        <dd>
                        <FieldUpdater path={`/experiments/${id}/`} onLoad={refetch}
                            showLabel={false}
                            field='targetColumnName'
                            options={data && data.experiment.dataset ? data.experiment.dataset.columns.map(c => c.name) : [data.experiment.targetColumnName]}
                            value={data.experiment.targetColumnName} />
                        </dd>
                    </div>
                    <div className="item_dl type_inline">
                        <dt>{t('Metric')}</dt>
                        <dd>
                        <FieldUpdater path={`/experiments/${id}/`} onLoad={refetch} field='metric' options={data.experiment.availableMetrics} value={data.experiment.metric.toLowerCase()}/>
                        </dd>
                    </div>
                </dl>
            </div>
            <div className="footer_popup">
                <MutateAction
                    verb='post'
                    className="btn_m btn_run"
                    path={`/experiments/${id}/start/`}
                    onLoad={() => {
                        // onClose();
                        window.location.href = `/r/${id}/leaderboard/`
                        // setRedirectLeaderboard(true)
                        }}>
                        {t('Run AutoML')}
                        <span className="ico_automl ico_arr"></span>
                </MutateAction>
                <button type="button" className="btn_close" data-dismiss="modal" onClick={() => onClose()}>
                    <span className="ico_automl ico_close">{t('Close Popup')}</span>
                </button>
            </div>
        </div>
    )
}