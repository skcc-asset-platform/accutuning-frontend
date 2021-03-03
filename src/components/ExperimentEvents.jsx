import React, {useEffect} from 'react'
import { gql } from 'apollo-boost'
import { useQuery } from 'react-apollo'
import Spinner from '../utils/Spinner'
import { useTranslation } from "react-i18next";


const QUERY_EVENTS = gql`
query queryEvents($id: Int!) {
    experiment (id: $id) {
        id
        logFiles
    }
}
`

export default ({experiment}) => {
    const { data, loading, error, refetch } = useQuery(QUERY_EVENTS, {
        variables: {id: experiment.id},
        pollInterval: 5000,
    })
    const { t } = useTranslation();

    useEffect(() => {
        refetch()
    }, [refetch])

    if (!data && loading) return <Spinner>{t('loading..')}</Spinner>
    if (error) return String(error)

    return (
        <section className="section_content">
            {loading ? <div>{t('loading..')}</div> : null}
            {data.experiment && data.experiment.logFiles.length?
                <table style={{border: '1px solid black'}}>
                    <thead>
                    <tr>
                        <th>{t('file')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.experiment.logFiles.map(file => <React.Fragment key={file}>
                            <tr>
                                <td><a href={file} download>{file}</a></td>
                            </tr>
                        </React.Fragment>)}
                    </tbody>
                </table>
                :
                null
            }
        </section>
    )
}