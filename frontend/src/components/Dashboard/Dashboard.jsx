import './Dashboard.css';
import React, { useContext, useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { SERVER } from '../../config/global';
import AppContext from '../../state/AppContext';
import EuroIcon from '@mui/icons-material/Euro';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import CarRentalIcon from '@mui/icons-material/CarRental';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { BarChart } from '@mui/x-charts/BarChart';

const FILTER_OPTIONS = [{
    label: 'Body type',
    value: 'Tip Caroserie'
}, {
    label: 'Fuel type',
    value: 'Combustibil'
}, {
    label: 'Gearbox',
    value: 'Cutie de viteze'
}, {
    label: 'Transmission',
    value: 'Transmisie'
}];

function Dashboard() {
    const { auth } = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(false);

    const [todaysRevenue, setTodaysRevenue] = useState(0);
    const [lastWeekRevenue, setLastWeekRevenue] = useState(0);
    const [todaysBookings, setTodaysBookings] = useState(0);
    const [lastWeekBookings, setLastWeekBookings] = useState(0);
    const [mostPredictedCar, setMostPredictedCar] = useState('');
    const [numberOfMostPredictedCar, setNumberOfMostPredictedCar] = useState(0);

    const [graphicsFilter, setGraphicsFilter] = useState('Combustibil');
    const [chartData, setChartData] = useState([]);
    const [labelsOptions, setLabelsOptions] = useState(['Diesel', 'Benzina', 'Hibrid']);

    useEffect(() => {
        setIsLoading(true);

        fetch(`${SERVER}/api/dashboard/dashboard-reports`, {
            method: 'GET',
            headers: {
                'Authorization': `${auth.token}`,
            },
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }
            })
            .then((data) => {
                setTodaysRevenue(data.todaysRevenue);
                setLastWeekRevenue(data.lastWeekRevenue);
                setTodaysBookings(data.todaysBookings);
                setLastWeekBookings(data.lastWeekBookings);
                setMostPredictedCar(data.mostPredictedCar);
                setNumberOfMostPredictedCar(data.numberOfMostPredictedCar);
            })

        fetch(`${SERVER}/api/dashboard/dashboard-charts?filter=${graphicsFilter}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${auth.token}`,
            }
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }
            })
            .then((data) => {
                setChartData(data.filteredData);
                setLabelsOptions(data.labels);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    function handleChange(e) {
        const filter = e.target.value;
        setGraphicsFilter(filter);

        fetch(`${SERVER}/api/dashboard/dashboard-charts?filter=${filter}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${auth.token}`,
            }
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }
            })
            .then((data) => {
                setChartData(data.filteredData);
                setLabelsOptions(data.labels);
            })
    }

    return (
        <Box className='dashboard-page'>
            <Box className='card-details'>
                <Card className='card'>
                    <CardContent>
                        <Typography className='card-header'>Today&apos;s revenue</Typography>
                        <Box className='card-content-revenue'>
                            <Typography className='card-content-text'>{todaysRevenue}</Typography>
                            <EuroIcon />
                        </Box>
                        <Box className='card-compare'>
                            <Typography className='card-compare-text'>
                                {
                                    todaysRevenue === 0 && lastWeekRevenue === 0
                                        ? '0%'
                                        : lastWeekRevenue === 0
                                            ? 'N/A'
                                            : `${(((todaysRevenue - lastWeekRevenue) / lastWeekRevenue) * 100).toFixed(2)}%`
                                }
                            </Typography>
                            {
                                todaysRevenue < lastWeekRevenue ? (
                                    <ArrowDownwardIcon className='icon-down' />
                                ) : (
                                    <ArrowUpwardIcon className='icon-up' />
                                )
                            }
                        </Box>
                    </CardContent>
                </Card>

                <Card className='card'>
                    <CardContent>
                        <Typography className='card-header'>Today&apos;s bookings</Typography>
                        <Box className='card-content-revenue'>
                            <Typography className='card-content-text'>{todaysBookings}</Typography>
                            <BookmarkAddIcon />
                        </Box>
                        <Box className='card-compare'>
                            <Typography className='card-compare-text'>
                                {
                                    todaysBookings === 0 && lastWeekBookings === 0
                                        ? '0%'
                                        : lastWeekBookings === 0
                                            ? 'N/A'
                                            : `${(((todaysBookings - lastWeekBookings) / lastWeekBookings) * 100).toFixed(2)}%`
                                }
                            </Typography>
                            {
                                todaysBookings < lastWeekBookings ? (
                                    <ArrowDownwardIcon className='icon-down' />
                                ) : (
                                    <ArrowUpwardIcon className='icon-up' />
                                )
                            }
                        </Box>
                    </CardContent>
                </Card>

                <Card className='card'>
                    <CardContent>
                        <Typography className='card-header'>Most recommended car</Typography>
                        <Box className='card-content-revenue'>
                            <Typography className='card-content-text'>{mostPredictedCar}</Typography>
                            <CarRentalIcon />
                        </Box>
                        <Box className='card-compare'>
                            <Typography className='card-compare-text'>{numberOfMostPredictedCar}</Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            <Box className='dashboard-graphics'>
                <FormControl className='dashboard-form'>
                    <InputLabel id='graphics-filter-label'>Graphics Filter</InputLabel>
                    <Select
                        labelId='graphics-filter-label'
                        id='graphics-filter-select'
                        value={graphicsFilter}
                        label='Graphics filter'
                        onChange={handleChange}
                    >
                        {
                            FILTER_OPTIONS.map((element) => (
                                <MenuItem value={element.value}>{element.label}</MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>

                <BarChart
                    dataset={chartData}
                    xAxis={[{ scaleType: 'band', dataKey: 'week' }]}
                    series={labelsOptions.map(label => ({
                        dataKey: label,
                        label: label
                    }))}
                    width={400}
                    height={400}
                />
            </Box>
        </Box>
    );
}

export default Dashboard;