import React from 'react';
import "./PollingSpinner.scss"

export default ({children}) => (
    <>
    <div className="lds-ripple"><div></div><div></div></div>
    {children}</>
)