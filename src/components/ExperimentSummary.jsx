import React from 'react'

export default ({experiment}) => {

    const StatBox = ({label, children}) => (
        <Box
            color="gray.500"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
            alignItems="center"
            ml="2"
        >
            <Stat>
                <StatLabel>
                    {label}
                </StatLabel>
                <StatHelpText>
                    {children}
                </StatHelpText>
            </Stat>
        </Box>
    )

    return (
        <Box pb="6" pt="6">
            <Box d="flex" alignItems="baseline">
                {/* <Button rounded="full" px="2" variantColor="teal">
                    {experiment.estimatorType}
                </Button> */}
                <StatBox label='Type'>{experiment.estimatorType}</StatBox>
                <StatBox label='Metric'>{experiment.metric}</StatBox>
                <StatBox label='Eval.'>{experiment.resamplingStrategy}, max {experiment.maxEvalTime}sec.</StatBox>
                <StatBox label='Data'>
                    {experiment.dataset ? <>
                        {experiment.targetColumnName} with {experiment.dataset.colCount - 1} features
                        <br/>
                        train/val/test: 0.6/0.2/0.2
                    </>
                    :
                    '-'
                    }
                </StatBox>
            </Box>
            <Box d="flex" alignItems="baseline">
                <StatBox label='Status'>
                    {experiment.status}
                    {experiment.status === 'learning' ?
                        '(' + parseInt(experiment.doneSlot/experiment.totalSlot*100) + '%)'
                        :
                        null
                    }
                </StatBox>
                <StatBox label='Best score'>
                    {experiment.bestScore ? 
                        `${experiment.bestScore} in ${experiment.modelsCnt} models`
                        :
                        '-'
                    }
                </StatBox>
                {/* <Box alignItems="center">
                    {Array(5)
                        .fill("")
                        .map((_, i) => (
                        <Icon name="star"
                            key={i}
                            color={i < experiment.splitTestdataRate ? "teal.500" : "gray.300"}
                        />
                        ))}
                    <Box as="span" ml="2" color="gray.600" fontSize="sm">
                        {experiment.maxEvalTime} reviews
                    </Box>
                </Box> */}
            </Box>
        </Box>
    )
}