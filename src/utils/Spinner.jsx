import React from 'react';
import "./Spinner.scss"

export default ({children}) => (
    <>
    <div className="lds-circle"><div></div></div>
    {children}</>
)