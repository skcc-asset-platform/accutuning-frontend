import React from 'react'
import { connect } from 'react-redux';

const mapStateToProps = (state) => {
    return ({
        fieldsMeta: state.environment.data,
    })
  };


export default connect(mapStateToProps)(({experiment, fieldsMeta}) => {
    const PropSpan = ({ name, listType }) => {
        if (!experiment) {
            return name
        }
        const meta = fieldsMeta ? fieldsMeta.find(f => f.name === name) : null;
        const helptext = meta ? 
            <span color='gray'>{meta.helptext}</span> : null;

        return listType && experiment[name] ? <>
                {`${name} : `}{' '}{helptext}
                <div>
                    {experiment[name].map(e => <span key={e}>{e}</span>)}
                </div>
            </>
            : <span>{`${name} : ${experiment[name]}`}{' '}{helptext}</span>
    }
    return (
        <ul>
            <li><PropSpan name='id' /></li>
            <li><PropSpan name='createdAt' /></li>
            {/* <li><PropSpan name='cpuCount' /></li> */}
            {/* <li><PropSpan name='cpuPercent' /></li> */}
            <li><PropSpan name='estimatorType' /></li>
            <li><PropSpan name='ensembleSize' /></li>
            {/* <li><PropSpan name='includePreprocessorsJson' /></li> */}
            <li><PropSpan name='includeEstimators' listType={true} /></li>
            <li><PropSpan name='availableEstimators' listType={true} /></li>
            {/* <li><PropSpan name='availablePreprocessors' listType={true} /></li> */}
            <li><PropSpan name='availableMetrics' listType={true} /></li>
            {/* <li><PropSpan name='memoryPercent' /></li> */}
            {/* <li><PropSpan name='metricHigherBetter' /></li> */}
            <li><PropSpan name='metric' /></li>
            <li><PropSpan name='randomState' /></li>
            <li><PropSpan name='splitTestdataRate' /></li>
            <li><PropSpan name='resamplingStrategy' /></li>
            <li><PropSpan name='resamplingStrategyCvFolds' /></li>
            <li><PropSpan name='resamplingStrategyHoldoutTrainSize' /></li>
            {/* <li><PropSpan name='resamplingStrategyPartialcvShuffle' /></li> */}
            <li><PropSpan name='startedAt' /></li>
            <li><PropSpan name='stoppedAt' /></li>
            <li><PropSpan name='timeout' /></li>
            <li><PropSpan name='maxEvalTime' /></li>
            <li><PropSpan name='doneSlot' /></li>
            {/* <li><PropSpan name='totalSlot' /></li> */}
            <li><PropSpan name='scaleUnit' /></li>
            <li><PropSpan name='status' /></li>
            <li><PropSpan name='containerImageName' /></li>
            <li><PropSpan name='workerScale' /></li>
            <li><PropSpan name='useOptuna' /></li>
            <li><PropSpan name='useAlphaautoml' /></li>
            <li><PropSpan name='useEnsemble' /></li>
            <li><PropSpan name='includeOneHotEncoding' /></li>
            <li><PropSpan name='includeVarianceThreshold' /></li>
            <li><PropSpan name='includeFeatureEngineerings' /></li>
            <li><PropSpan name='includeFeatureEngineeringsJson' /></li>
            <li><PropSpan name='includeScalingMethods' /></li>
            <li><PropSpan name='includeScalingMethodsJson' /></li>
        </ul>
    )
})