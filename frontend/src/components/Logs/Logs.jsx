import './Logs.css';
import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import AppContext from "../../state/AppContext";
import { SERVER } from "../../config/global";
import dayjs from 'dayjs';
import { DataGrid } from '@mui/x-data-grid';

const FILTER_OPTIONS = [{
    label: 'Today',
    value: 'day'
}, {
    label: 'Last week',
    value: 'week'
}, {
    label: 'Last month',
    value: 'month'
}, {
    label: 'Last year',
    value: 'year'
}];

const columns = [{
    field: 'id',
    headerName: 'ID',
    width: 90
}, {
    field: 'fullname',
    headerName: 'Full name',
    width: 150,
}, {
    field: 'email',
    headerName: 'Email',
    width: 150
}, {
    field: 'car',
    headerName: 'Car',
    width: 90
}, {
    field: 'price',
    headerName: 'Price',
    width: 90
}, {
    field: 'status',
    headerName: 'Status',
    width: 150
}, {
    field: 'startdate',
    headerName: 'Start date',
    width: 150
}, {
    field: 'enddate',
    headerName: 'End date',
    width: 150
}];

function Logs() {
    const { auth } = useContext(AppContext);

    const [dateFilter, setDateFilter] = useState('day');
    const [fetchDate, setFetchDate] = useState(dayjs().format('YYYY-MM-DD 00:00'));

    const [logs, setLogs] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`${SERVER}/api/dashboard/logs?date=${fetchDate}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${auth.token}`,
            }
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    return res.json().then((error) => {
                        throw new Error(error.message || 'Something went wrong!');
                    })
                }
            })
            .then((data) => {
                setError('');
                const rows = data.logs.map(log => ({
                    id: log._id,
                    fullname: log.userId?.firstname + " " + log.userId?.lastname || '',
                    email: log.userId?.email || '',
                    car: log.carId?.Masina || '',
                    price: log.totalPrice || 0,
                    status: log.status || '',
                    startdate: dayjs(log.startDate).format('YYYY-MM-DD HH:mm') || '',
                    enddate: dayjs(log.endDate).format('YYYY-MM-DD HH:mm') || '',
                }));
                setLogs(rows);
            })
            .catch((error) => {
                setError(error.message);
            });
    }, [dateFilter]);

    function handleChange(e) {
        const selectedDateFilter = e.target.value;
        setDateFilter(e.target.value);

        switch (selectedDateFilter) {
            case 'day':
                setFetchDate(dayjs().format('YYYY-MM-DD 00:00'));
                break;
            case 'week':
                setFetchDate(dayjs().subtract(7, 'day').format('YYYY-MM-DD 00:00'));
                break;
            case 'month':
                setFetchDate(dayjs().subtract(30, 'day').format('YYYY-MM-DD 00:00'));
                break;
            case 'year':
                setFetchDate(dayjs().subtract(365, 'day').format('YYYY-MM-DD 00:00'));
                break;
            default:
                setFetchDate('');
                break;
        };
    }

    return (
        <Box className='logs-page'>
            <Box className='logs-input'>
                <FormControl className='logs-form'>
                    <InputLabel id='date-filter-label'>Date</InputLabel>
                    <Select
                        labelId='date-filter-label'
                        id='date-filter-select'
                        value={dateFilter}
                        label='Date'
                        onChange={handleChange}
                    >
                        {
                            FILTER_OPTIONS.map((element, index) => (
                                <MenuItem key={index} value={element.value}>{element.label}</MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
            </Box>

            {
                logs.length > 0 && !error ? (
                    <DataGrid
                        className='logs-table'
                        columns={columns}
                        rows={logs}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 10,
                                },
                            },
                        }}
                        pageSizeOptions={[10]}
                        disableRowSelectionOnClick
                        keepNonExistentRowsSelected
                    />
                ) : <Box className='no-data-grid'>
                    <Typography className='no-data-text'>{error}</Typography>
                </Box>
            }
        </Box>
    );
}

export default Logs;