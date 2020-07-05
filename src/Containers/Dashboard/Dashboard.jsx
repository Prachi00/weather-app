import classes from "./Dashboard.module.scss";
import React, { useState, useEffect } from "react";
import { getTime, getDay } from "../../Pipes/datePipe";
import Search from "../../Components/Search/Search";
import Loader from "../../Components/Loader/Loader";
import ChartMap from "../../Components/Chart/Chart";

let today = getDay();

const Dashboard = () => {
  let [current, setCurrent] = useState();
  let [hour, setHour] = useState([]);
  let [chartsData, setChartsData] = useState([]);
  let [daily, setDaily] = useState([]);
  let [name, setName] = useState([]);
  let [loader, setLoader] = useState(true);
  const getWeatherData = (lat, lon) => {
    let weatherApi;

    weatherApi = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${
      process.env.REACT_APP_API_KEY
    }`;

    fetch(weatherApi)
      .then((response) => response.json())
      .then(
        (response) => {
                        setLoader(false);
                        setCurrent(response.current);
                        let hourData = [];
                        let charts = [];
                        // response.hourly.slice(0, 24).map((item) => {
                        //   let date = new Date(item.dt * 1000);
                        //   let time = getTime(date);
                        //   hourData.push([`${Math.ceil(item.temp)}°C`, time]);
                        //   charts.push(Math.ceil(item.temp));
                        // });
                        for (const item of response.hourly.slice(0, 24)) {
                          let date = new Date(item.dt * 1000);
                          let time = getTime(date);
                          hourData.push([`${Math.ceil(item.temp)}°C`, time]);
                          charts.push(Math.ceil(item.temp));
                        }
                        setHour(hourData);
                        setChartsData(charts);
                        let forecastData = [];
                        // response.daily.slice(0, 7).map((item) => {

                        // });
                        for (const item of response.daily.slice(0, 7)) {
                          let dayOfWeek = getDay(item.dt);
                          forecastData.push({
                            day: dayOfWeek,
                            min: Math.ceil(item.temp.min),
                            max: Math.ceil(item.temp.max),
                            icon: item.weather[0].icon,
                            desc: item.weather[0].main,
                          });
                        }
                        setDaily(forecastData);
                      },
        (error) => {}
      );
  };

  const getCityName = (lat, lon) => {
    let weatherApi;

    weatherApi = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.REACT_APP_API_KEY}`;

    fetch(weatherApi)
      .then((response) => response.json())
      .then((response) => {
        setName(response.name);
      });
  };
  const success = (position) => {
    localStorage.setItem("location-allowed", true);
    getCityName(position.coords.latitude, position.coords.longitude);
    getWeatherData(position.coords.latitude, position.coords.longitude);
  };

  const error = () => {
    localStorage.removeItem("location-allowed");
    alert("Unable to retrieve location.");
  };

  useEffect(() => {
    let options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error, options);
    } else {
      alert(
        "Your browser does not support location tracking, or permission is denied."
      );
    }
  }, []);

  const getSearchData = (lat, lon) => {
    getWeatherData(lat, lon);
  };

  return (
    <React.Fragment>
      {loader ? (
        <Loader />
      ) : (
        <div className={classes.dashboard}>
          <div className={classes.dashboard__parent}>
            <Search getSearchData={getSearchData} defaultVal={name} />
            <div className={classes.dashboard__forecast}>
              {daily.map((item, index) => {
                return (
                  <div
                    key={index}
                    className={`${classes.dashboard__forecast__container} ${
                      item.day === today
                        ? `${classes.dashboard__forecast__container__active}`
                        : ""
                    }`}
                  >
                    <span>{item.day}</span>
                    <div>
                      <span className={classes.dashboard__forecast__temp}>
                        {item.max}&#176;
                      </span>
                      <span className={classes.dashboard__forecast__min}>
                        {item.min}&#176;
                      </span>
                    </div>
                    <img
                      className={classes.dashboard__forecast__image}
                      src={`https://openweathermap.org/img/wn/${item.icon}.png`}
                      alt=""
                    />
                    <span className={classes.dashboard__forecast__desc}>
                      {item.desc}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className={classes.dashboard__card}>
              {current && current.weather ? (
                <div className={classes.dashboard__current}>
                  <div className={classes.dashboard__current__info}>
                    <span className={classes.dashboard__current__temp}>
                      {Math.ceil(current.temp)}&#8451;
                    </span>
                    <img
                      src={`https://openweathermap.org/img/wn/${current?.weather[0].icon}@2x.png`}
                      alt=""
                    />
                  </div>
                  {hour.length && chartsData.length ? (
                    <ChartMap label={hour} data={chartsData} />
                  ) : null}
                  <div className={classes.dashboard__extra}>
                    <div className={classes.dashboard__extra__option}>
                      <span className={classes.dashboard__extra__option__label}>
                        Pressure
                      </span>
                      <span>{current.pressure} hpa</span>
                    </div>
                    <div className={classes.dashboard__extra__option}>
                      <span className={classes.dashboard__extra__option__label}>
                        Humidity
                      </span>
                      <span>{current.humidity} %</span>
                    </div>
                  </div>
                  <div className={classes.dashboard__extra}>
                    <div className={classes.dashboard__extra__sun}>
                      <span className={classes.dashboard__extra__option__label}>
                        Sunrise
                      </span>
                      <span className={classes.dashboard__extra__sun__time}>
                        {getTime(new Date(current.sunrise * 1000))}
                      </span>
                    </div>
                    <div className={classes.dashboard__extra__sun}>
                      <span className={classes.dashboard__extra__option__label}>
                        Sunset
                      </span>
                      <span className={classes.dashboard__extra__sun__time}>
                        {getTime(new Date(current.sunset * 1000))}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default Dashboard;
