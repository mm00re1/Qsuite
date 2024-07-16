import React from 'react';
import Chart from 'react-apexcharts';

const TestGroupDetailChart = ({ data }) => {
  // Mapping the data to the format suitable for ApexCharts
  if (data.length === 0) {
    return null;
  }
  
  const series = [{
    name: 'Time Taken',
    data: data.map(item => ({
      x: item['Test Name'],
      y: item['Time Taken']
    }))
  }];

  // Configuring the options for ApexCharts
  const options = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false // You can enable this if you want users to have toolbar options
      }
    },
    colors: ["#22023A"],
    xaxis: {
      labels: {
        show: false // Hides the x-axis labels as you requested
      },
    },
    yaxis: {
        title: {
          text: 'Time Taken (sec)' // Y-axis label
        },
        labels: {
          formatter: (value) => value.toLocaleString(), // Formats y-axis values
        }
      },
      grid: {
        show: false, // Make grid lines invisible
      },
      tooltip: {
        y: {
          formatter: (value) => value.toLocaleString() // Formats tooltip values
        }
      },

    dataLabels: {
      enabled: false
    },
  };

  return (
    <div>
      <Chart options={options} series={series} type="bar" height={350} width={840} />
    </div>
  );
};

export default TestGroupDetailChart;
