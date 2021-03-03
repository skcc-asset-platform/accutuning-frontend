import React from 'react'
// import {
// //     Button as CButton,
//     Heading,
// //     Box as CBox,
// //     Badge as CBadge,
// //     FormErrorMessage,
// //     FormLabel,
// //     FormControl,
// //     Input,
// } from "@chakra-ui/core";

// export * from "@chakra-ui/core"

export const SubHeading = (props) => (
    <h2 {...props}>{props.children}</h2>
)

export const MainBox = (props) => (
    <div className="wrapper wrap_preprocess">
        <main>
            <div className="container">
                {props.children}
            </div>
        </main>
    </div>
)

export const Button = (props) => (
    <button style={{padding: '4px', border: '1px solid black'}} {...props}>{props.children}</button>
)

export const Alert = (props) => (
    <div {...props}>{props.children}</div>
)

export const AlertIcon = (props) => (
    <span {...props}>{props.children}</span>
)

export const Badge = (props) => (
    <span {...props}>{props.children}</span>
)

export const Box = (props) => (
    <div {...props}>{props.children}</div>
)

export const ButtonGroup = (props) => (
    <div {...props}>{props.children}</div>
)

