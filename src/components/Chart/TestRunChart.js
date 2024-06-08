import React from 'react';
import Chart from 'react-apexcharts';

const TestRunChart = ({ testResults }) => {
    // Extract categories (dates), passed data, and failed data from testResults
    const categories = testResults.map(result => result.date);
    const passedData = testResults.map(result => result.passed);
    const failedData = testResults.map(result => result.failed);

    const chartData = {
        series: [{
            name: 'Passed',
            data: passedData
        }, {
            name: 'Failed',
            data: failedData
        }],
        options: {
            chart: {
                type: 'line',
                height: 350,
                width: 400
            },
            xaxis: {
                categories: categories,
                labels: {
                    style: {
                        colors: 'white',
                        fontSize: '12px'
                    }
                }
            },
            colors: ['#00FF00', '#FF0000'],
            yaxis: {
                title: {
                    text: 'Number of Tests',
                    style: {
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: 'normal',
                        fontFamily: 'Cascadia Code'
                    }
                },
                labels: {
                    style: {
                        colors: 'white',
                        fontSize: '12px'
                    }
                }
            },
            grid: {
                show: false // Removes the horizontal grid lines
            },
            legend: {
                labels: {
                    colors: 'white',
                    useSeriesColors: false,
                    fontFamily: 'Cascadia Code'
                }
            },
            plotOptions: {
                bar: {
                    horizontal: false
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
                height={400}
                width={800}
            />
        </div>
    );
};

export default TestRunChart;
