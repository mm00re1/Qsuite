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
                        //colors: 'white',
                        fontSize: '12px'
                    }
                }
            },
            colors: ['#00FF00', '#FF0000'],
            yaxis: {
                title: {
                    text: 'Number of Tests',
                    style: {
                        //color: 'white',
                        fontSize: '16px',
                        fontWeight: 'normal',
                        fontFamily: 'Cascadia Code',
                    }
                },
                labels: {
                    style: {
                        fontSize: '12px',
                        //colors: 'white',
                    }
                }
            },
            grid: {
                show: false // Removes the horizontal grid lines
            },
            legend: {
                labels: {
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
        <div style={{
            width: '100%',
            marginLeft: '18%',
            backgroundColor: 'white', // Dark background color
            //boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.3)', // Box shadow
            padding: '20px', // Add some padding
            borderRadius: '0px' // Rounded corners
        }}>
            <Chart
                options={chartData.options}
                series={chartData.series}
                type="line"
                height={400}
                width="100%"
            />
        </div>
    );
};

export default TestRunChart;
