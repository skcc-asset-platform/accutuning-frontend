/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import WorkspaceFiles from './WorkspaceFiles';
import {
    DialogTitle,
    Dialog,
    DialogContent,
} from '@material-ui/core';
import { useTranslation } from "react-i18next";


const SourcesPopup = ({ refreshExperiments, onClose, createType, open }) => {
    const { t } = useTranslation();

    return (
        <Dialog onClose={onClose} aria-labelledby="source-dialog" open={open}>
            <DialogTitle id='source--dialog-title'>
                {
                    t(`Create a new ${createType}`)
                }
            </DialogTitle>
            <DialogContent>
                <WorkspaceFiles refreshExperiments={refreshExperiments} createType={createType} />
            </DialogContent>
        </Dialog>
    )
}


export default SourcesPopup
