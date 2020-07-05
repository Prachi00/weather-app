import React, { useEffect } from "react";
import classes from "./Chart.module.scss";
import Chart from "chart.js";
export default function ChartMap(props) {
  const createChart = () => {
    let ctx = document.getElementById("myChart");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: props.label,
        datasets: [
          {
            label: "Temperature",
            data: props.data,
            backgroundColor: "rgba(255,255,255,0.1)",
            borderColor: "rgba(54, 162, 235)",
            pointBackgroundColor: "rgba(54, 162, 235, 1)",
            pointBorderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 2,
          },
        ],
      },
      options: {
        legend: {
          display: false,
        },
        scales: {
          yAxes: [
            {
              ticks: {
                padding: 100,
              },
              display: false,
            },
          ],
        },
      },
    });
  };
  useEffect(() => {
    createChart();
  }, []);
  return (
    <div className={classes.chart}>
      <div className={classes.chart__child}>
        <canvas id="myChart" height="280" width="0"></canvas>
      </div>
    </div>
  );
}
