import React from 'react'


export default (props) => (
    <a href="#none" className="tooltip_model">
        <span className="ico_automl ico_info">자세히보기</span>
        <div className="txt_tooltip">
            {props.children}
        </div>
    </a>    
)