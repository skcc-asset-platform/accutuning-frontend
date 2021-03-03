import React, { useState } from 'react'

import Slider from '@material-ui/core/Slider';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

// import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from 'react-apollo';
import { gql } from 'apollo-boost';

import ExperimentMutator from "../utils/ExperimentMutator"

const useStyles = makeStyles((theme) => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  }));
  

// const useStyles = makeStyles((theme) => ({
//     root: {
//       width: 250,
//     },
//     margin: {
//       height: theme.spacing(3),
//     },
//   }));

const TargetColumnSelect = ({data, disabled}) => {
    const [target, setTarget] = useState(null)
    // const age = 10
    const handleChange = (evt) => {setTarget(evt.target.value)}
    const classes = useStyles();
    let marks = [];
    let formatter = null;
    if (target) {
        const targetItem = data.find(ele => ele.id === target)
        formatter = (pct) => (targetItem.min + (targetItem.max - targetItem.min) * pct / 100).toFixed(2)
        // console.log(
        //     targetItem.min,
        //     targetItem.min + (targetItem.max - targetItem.max),
        //     targetItem.min + (targetItem.max - targetItem.max) * 0.25,
        //     (targetItem.min + (targetItem.max - targetItem.max) * 0.25).toFixed(2),
        //     targetItem,
        // )
        marks.push({value: 0, label: formatter(0)})
        marks.push({value: 25, label: formatter(25)})
        marks.push({value: 50, label: formatter(50)})
        marks.push({value: 75, label: formatter(75)})
        marks.push({value: 100, label: formatter(100)})
    }
    else {
        formatter = (pct) => `${pct}%`
        marks.push({value: 0, label: formatter(0)})
        marks.push({value: 25, label: formatter(25)})
        marks.push({value: 50, label: formatter(50)})
        marks.push({value: 75, label: formatter(75)})
        marks.push({value: 100, label: formatter(100)})
    }

    return (
        <div style={{width: '250px'}}>
            <FormControl className={classes.formControl}>
                <InputLabel id="demo-simple-select-label">{t('Split by')}</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={target}
                    disabled={disabled}
                    onChange={handleChange}
                >
                    {data && data.filter(
                        (item) => (item.datatype === 'FLOAT64' || item.datatype === 'INT64') && item.missing === 0
                    ).map(
                        (item) => <MenuItem value={item.id}>{item.name}</MenuItem>
                    )}                    
                </Select>
            </FormControl>
            <Slider
                track={false}
                aria-labelledby="track-false-slider"
                getAriaValueText={value => formatter(value)}
                defaultValue={[50]}
                marks={marks}
                onChange={(e, newValue) => console.log(newValue)}
                // valueLabelDisplay="on"
                valueLabelDisplay="auto"
            />            
        </div>    
    )
}



const QUERY_EXPERIMENT_COLUMNS = gql`
    query queryExperimentColumns($id:Int!) {
        experiment(id: $id) {
            id
            name
            firstDataset: dataset {
                id
            }
            dataset:preprocessedDataset {
                id
                columns {
                    id
                    name
                    datatype
                    min
                    max
                    missing
                }
            }
        }
    }
`

// export default (props) => {
//     const [mutate, {loading, error}] = useMutation(gql`
//     mutation($id: ID!, $input: PatchExperimentInput!) {
//         patchExperiment(id: $id, input: $input) {
//             experiment {
//                 id
//                 __typename
//             }
//         }
//     }`)

//     const update = (data) => {
//         const variables = {id: props.pk, input: data}
//         return mutate({variables})
//     }

//     return <FieldUpdater
//         update={update}
//         loading={loading}
//         error={error}
//         {...props}/>
// }


export default ({pk}) => {
    const { data, loading, error } = useQuery(QUERY_EXPERIMENT_COLUMNS, { variables: { id: pk } })
    const [checked, setChecked] = useState(false)

    if (loading) return 'loading..'

    if (!data) return 'nodata';

    const experiment = data.experiment

    return (
        <div>
            <h3>{t('dataset partition')}</h3>
            <FormControlLabel
                control={
                <Checkbox
                    checked={checked}
                    onChange={(event)=>{setChecked(event.target.checked);}}
                    color="primary"
                />
                }
                label="Random"
            />
            <TargetColumnSelect data={data.experiment.dataset.columns} disabled={checked}/>

        <table border="1">
            <thead>
                <tr>
                    <th>{t('partition')}</th>
                    <th>{checked ? 'ratio' : 'range'}</th>
                    <th>{t('count')}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>train</td>
                    <td>{experiment.resamplingStrategyHoldoutTrainSize}</td>
                    <td>0</td>
                </tr>
                <tr>
                    <td>valid</td>
                    <td>{1-experiment.resamplingStrategyHoldoutTrainSize}</td>
                    <td>0</td>
                </tr>
                <tr>
                    <td>test</td>
                    <td>{experiment.splitTestdataRate}</td>
                    <td>0</td>
                </tr>
            </tbody>
        </table>
        </div>
    )
}