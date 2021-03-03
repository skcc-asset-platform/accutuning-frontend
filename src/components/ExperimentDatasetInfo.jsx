import React from 'react';
import { useTranslation } from "react-i18next";

export default ({preprocessorInfo}) => {
    const { t } = useTranslation();
    return (
        <table className="tbl_g">
        <thead>
            <tr>
                <th>{t('Step')}</th>
                <th>{t('Details')}</th>
            </tr>
        </thead>
        <tbody>
        {preprocessorInfo ?
            preprocessorInfo.map(([key, value]) =>
                <tr key={key}>
                    <td className="txt_l">{key}</td>
                    <td className="txt_l">{String(value)}</td>
                </tr>
            )
            : <tr><td colSpan={2}>{t('No preprocessor')}</td></tr>}
        </tbody>
        </table>
    )
}
