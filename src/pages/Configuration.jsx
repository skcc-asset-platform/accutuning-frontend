import React, { useState } from 'react'


export default () => {
    // const [editEndpoint, setEditEndpoint] = useState(false)
    const [endpoint, setEndpoint] = useState(localStorage.getItem('accutuning_endpoint'))

    return (
        <div className="wrap_endpoint">
        <div className="cont_endpoint">
            <strong className="tit_endpoint">Check the Server Connection</strong>
        Endpoint
            <div className="item_txt">
            <input type="text" size={50} value={endpoint} onChange={(e)=>setEndpoint(e.target.value)}/>
            <button className="btn_endpoint" onClick={() => {
                if (endpoint && endpoint.length > 0) {
                    if (endpoint.slice(-1) === '/') {
                        localStorage.setItem('accutuning_endpoint', endpoint.slice(0, -1))
                    }
                    else {
                        localStorage.setItem('accutuning_endpoint', endpoint)
                    }
                }
                else {
                    localStorage.setItem('accutuning_endpoint', '')
                }
                // console.log(process.env.PUBLIC_URL)
                window.location.href = window.location.origin
            }}>
                save
            </button>
            </div>
        </div>
        </div>
    )
}