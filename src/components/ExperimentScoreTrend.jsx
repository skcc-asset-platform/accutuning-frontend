import React from "react";
import ScoreTrend from "./ScoreTrend";

export default ({data}) => {
    let trendData = data ? data.leaderboard.map((t) => +t.score).filter((t) => t !== null)
      : [];
    trendData.reverse();

    let trendDataLabel = data
        ? data.leaderboard
            .map((t) => t.estimatorName)
            .filter((t) => t !== null)
        : [];
    trendDataLabel.reverse();

    return <ScoreTrend data={trendData} label={trendDataLabel} />
}