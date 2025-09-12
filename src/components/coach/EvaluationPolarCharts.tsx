'use client';

//CREATES THE POLAR CHARTS USED FOR EVALUATION FORMS

import React from 'react';
import dynamic from 'next/dynamic';

interface ChartComponentProps {
  chartData: {
    data: number[];
    labels: string[];
    enableHover: boolean;
  };
}

//Imports apex charts
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

const EvaluationPolarCharts: React.FC<ChartComponentProps> = ({
  chartData,
}) => {
  // console.log("Data from eval: ", chartData);

  // const chartData = {
  //     label:  labels,
  //     datasets: data,
  // }

  //Used to set what type of chart should be generated and how it should be styled
  //based on user's device

  const options = {
    labels: chartData.labels,
    chart: {
      type: 'polarArea' as const,
      height: 400,
      width: '100%',
      animations: {
        enabled: false,
      },
    },
    legend: {
      onItemHover: {
        highlightDataSeries: chartData.enableHover,
      },
      position: 'bottom' as const,
    },
    tooltip: {
      enabled: chartData.enableHover,
    },
    states: {
      hover: {
        filter: {
          type: chartData.enableHover ? 'lighten' : 'none',
        },
      },
      active: {
        filter: {
          type: chartData.enableHover ? 'darken' : 'none',
        },
      },
    },
    colors: [
      '#F94144',
      '#F3722C',
      '#F9C74F',
      '#90BE6D',
      '#43AA8B',
      '#577590',
      '#8F3985',
      '#07BEB8',
      '#F7C59F',
    ],
    stroke: {
      colors: ['#000000'],
    },
    fill: {
      opacity: 0.8,
    },
    yaxis: {
      min: 0,
      max: 10,
    },
    responsive: [
      {
        breakpoint: 9999, // Very large screens
        options: {
          chart: {
            height: 550,
            width: 550,
          },
        },
      },
      {
        breakpoint: 1200,
        options: {
          chart: {
            height: 350,
          },
        },
      },
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 320,
          },
        },
      },
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 280,
          },
          legend: {
            position: 'bottom' as const,
            floating: false,
            width: undefined,
          },
        },
      },
    ],
  };

  //Returns the polar area chart back to the page that calls it
  return (
    <ReactApexChart
      options={options}
      series={chartData.data}
      type="polarArea"
    />
  );
};

export default EvaluationPolarCharts;
