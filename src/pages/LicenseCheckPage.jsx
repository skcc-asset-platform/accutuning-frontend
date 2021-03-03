import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import { Container } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import SaveIcon from '@material-ui/icons/Save';
import { Button } from "@material-ui/core";
import gql from "graphql-tag"
import { useQuery, useMutation } from 'react-apollo';
import { toastError } from '../utils';
// import { client } from '..';


const QUERY_ENV = gql`
query {
    env {
        licenseIsValid
        licenseAllowedHosts
        licenseDue
        host
        # licenseEmail
        licenseCode
        __typename
    }
}
`


export default () => {
    const [code, setCode] = useState(null)
    const [codeError, setCodeError] = useState(false)
    const [codeErrorMessage, setCodeErrorMessage] = useState(null)
    const {data, loading, error, refetch} = useQuery(QUERY_ENV);
    const [update] = useMutation(gql`
mutation updateLicenseCode($code: String!) {
    registerLicense(licenseCode: $code) {
        env {
            licenseIsValid
            __typename
        }
        ok
        errorMessage
    }
}`)

    if (loading) return 'loading.'
    if (error) return String(error)
    // if (updateError) toastError(String(updateError))

    return (
        <Container style={{width: '600px', paddingTop: '150px'}}>
            <h2>License Information</h2>
            <Box mt={2} mb={2}>
                <Alert severity="info">
                    Your server hostname is "<b>{data.env.host}</b>"
                </Alert>
            </Box>
            {/* <Box>
                <TextField
                    label="EMail Address"
                    defaultValue=""
                    fullWidth
                    // helperText="Some important text"
                    // variant="outlined"
                    />
            </Box> */}
            <Box mt={1}>
                <TextField
                    label="License Code"
                    multiline
                    rows={4}
                    defaultValue={data.env.licenseCode}
                    fullWidth
                    onChange={(e) => setCode(e.target.value)}
                    error={codeError}
                    helperText={String(data.env.licenseIsValid && !codeError ? `Valid license code until ${data.env.licenseDue}` : codeErrorMessage || 'Enter the valid license code')}
                    variant="outlined"
                    />
            </Box>
            <Box mt={2}>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    // className={classes.button}
                    disabled={code === null}
                    onClick={() => update({
                        variables: {
                            code
                        }
                    }).then(r => {
                        refetch()
                        setCodeError(!r.data.registerLicense.ok)
                        setCodeErrorMessage(r.data.registerLicense.errorMessage)
                        if (r.data.registerLicense.ok) {
                            setCode(null)
                        }
                    }).catch(e => toastError(e))}
                    startIcon={<SaveIcon />}
                >
                    Save
                </Button>
            </Box>
        </Container>
    )
}