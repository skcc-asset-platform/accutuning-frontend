import React, {useEffect, useState} from 'react'
import * as client from '../utils/client';


const TableHead = ({data}) => {
    return <tr>
        {data.map(k => <th key={k}>{k}</th>)}
    </tr>
}

const TableBody = ({data}) => {
    return <tr>{Object.keys(data).map(key => <td key={key}>{data[key]}</td>)}</tr>
}


export default ({id}) => {
    const [previewData, setPreviewData] = useState(null);
    // const [pagedPreview, setPagedPreview] = useState(null);
    // const [pageCount, setPageCount] = useState(1);
    // const [page, setPage] = React.useState(1);

    useEffect(() => {
        client.get(`/datasets/${id}/preview_source/`).then(
            (resp) => {
                setPreviewData(resp);
                // setPageCount(Math.ceil(resp.length / process.env.REACT_APP_EX_ROW_COUNT));
                // setPagedPreview(paginate(resp, 1))
            }
        )
    }, [id]);

    // const handlePage = (event, value) => {
    //     setPage(value);
    //     setPagedPreview(paginate(previewData, value))
    // };

    // const paginate = (items, pageNumber) => {
    //     const startIndex = (pageNumber - 1) * process.env.REACT_APP_EX_ROW_COUNT; // 자를 배열의 시작점
    //     return _(items)
    //       .slice(startIndex) // 시작점부터 배열을 자르되
    //       .take(process.env.REACT_APP_EX_ROW_COUNT) // pageSize만큼의 배열을 취함
    //       .value(); // lodash wrapper 객체를 regular 배열로 변환
    // }

    if (!previewData) return 'loading'

    return (
        <>
        <table className="tbl_g tbl_preprocess"><thead>
            <TableHead data={Object.keys(previewData[0])}/>
            </thead>
            <tbody>
                {previewData.map((row, idx) => <TableBody key={idx} data={row}/>)}
            </tbody>
        </table>

        {/* <Box my={2} display="flex" justifyContent="center">
            <Pagination count={pageCount} page={page} onChange={handlePage} showFirstButton showLastButton/>
        </Box>   */}
        </>
    )
}
