/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import gql from "graphql-tag";
import { useApolloClient } from "react-apollo";


export default () => {
    const client = useApolloClient()
    let experimentsFromCache;
    try {
        const {experiments} = client.readQuery({query: gql`query {
            experiments {
                status
            }
        }`})
        experimentsFromCache = experiments
    }
    catch {
    }
    return (
        <span>{t('experiments')}: {experimentsFromCache ? experimentsFromCache.length : null}</span>
    )
}

