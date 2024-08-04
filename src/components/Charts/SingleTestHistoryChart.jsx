import React from 'react';
import Chart from 'react-apexcharts';

const SingleTestHistoryChart = ({ x_values, y_values, statusHistory }) => {
    // Ensure y_values is defined and is an array
    const isValidArray = Array.isArray(y_values) && y_values.length > 0;

    let color;
    if (statusHistory && isValidArray) {
        if (y_values.every(value => value === 1)) {
            color = '#00FF00'; // Green
        } else if (y_values.every(value => value === 0)) {
            color = '#FF0000'; // Red
        } else {
            color = '#28C7FA'; // Blue
        }
    } else {
        color = '#28C7FA'; // Default to blue if y_values is invalid or statusHistory is false
    }

    const chartData = {
        series: [{
            name: statusHistory ? 'Passed' : "Time Taken",
            data: y_values
        }],
        options: {
            chart: {
                type: 'line',
                height: 350,
                width: 400
            },
            xaxis: {
                categories: x_values,
                labels: {
                    show: false // Removes the x-axis labels
                }
            },
            colors: [color],
            yaxis: {
                title: {
                    text: 'History',
                    style: {
                        color: '#3E0A66',
                        fontSize: '16px',
                        fontWeight: 'normal',
                        fontFamily: 'Cascadia Code'
                    }
                },
                labels: {
                    show: false // Removes the y-axis labels
                }
            },
            grid: {
                show: false // Removes the horizontal grid lines
            },
            legend: {
                labels: {
                    colors: '#3E0A66',
                    useSeriesColors: false,
                    fontFamily: 'Cascadia Code'
                }
            },
            plotOptions: {
                bar: {
                    horizontal: false
                }
            },
            tooltip: {
                y: {
                    formatter: function (value) {
                        return statusHistory ? (value === 1 ? 'True' : 'False') : value.toLocaleString() + " sec"; // Conditional tooltip formatting
                    }
                }
            }
        }
    };

    return (
        <div style={{ marginLeft: '5%', width: '400px' }}>
            <Chart
                options={chartData.options}
                series={chartData.series}
                type="line"
                height={120}
                width={800}
            />
        </div>
    );
};

export default SingleTestHistoryChart;
