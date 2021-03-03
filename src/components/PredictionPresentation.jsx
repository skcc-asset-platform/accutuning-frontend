import React from 'react'
import SafeSrcDocIframe from 'react-safe-src-doc-iframe';
import { TextField} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { useTranslation } from "react-i18next";

export default ({data}) => {

    const { t } = useTranslation();

    const stringParser = (value) => {
        let parseValue =  value.replace(/\\/g, '');
        return parseValue.substring(1, parseValue.length-1);
    }

    return (
        <>
            <Box mt={2}>
                <h2>{t('Predict Result')}:
                    {data.prediction.error ? <span style={{color: 'red'}}>ERROR</span> : <span style={{color: 'green'}}>{data.prediction.output}</span>} {data.prediction.duration ? <span style={{color: 'grey'}}>({t('elapsed')}: {data.prediction.duration/100000}s)</span> : null}
                </h2>
                <div>{data.prediction.errorMessage}</div>
                {data.prediction.limeHtml ?
                    <SafeSrcDocIframe
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    srcDoc={data.prediction.limeHtml}
                    border="0"
                    title="lime-html-outpu"
                    width="100%"
                    height="400"
                    style={{ border: '1' }}
                /> : null}
            </Box>
            <Box mt={2}>
                <h2>Input(JSON):</h2>
                <div>
                    <TextField
                        disabled
                        fullWidth
                        defaultValue={stringParser(JSON.stringify(data.prediction.inputJson))}
                        variant="outlined"
                        multiline
                        rows={2}
                    />
                </div>
            </Box>
        </>
    )
}