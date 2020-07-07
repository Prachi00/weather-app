import classes from "./Dashboard.module.scss";
import React, { useState, useEffect, useRef } from "react";
import { getTime, getDay } from "../../Pipes/datePipe";
import Search from "../../Components/Search/Search";
import Loader from "../../Components/Loader/Loader";
import ChartMap from "../../Components/Chart/Chart";


const Dashboard = () => {
  let forecastObj = useRef({});
  let [current, setCurrent] = useState();
  let [hour, setHour] = useState([]);
  let [chartsData, setChartsData] = useState([]);
  let [daily, setDaily] = useState([]);
  let [selected, setSelected] = useState([]);
  let [name, setName] = useState([]);
  let [loader, setLoader] = useState(true);
  let [coords, setCoords] = useState({});
  const getWeatherData = (lat, lon) => {
    let weatherApi;

    weatherApi = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.REACT_APP_API_KEY}`;

    fetch(weatherApi)
      .then((response) => response.json())
      .then(
        (response) => {
          setLoader(false);
          setCurrent(response.current);
          let forecastData = [];
          for (const item of response.daily.slice(0, 6)) {
            let dayOfWeek = getDay(item.dt);
            forecastData.push({
              day: dayOfWeek,
              dt: item.dt,
              min: Math.ceil(item.temp.min),
              max: Math.ceil(item.temp.max),
              icon: item.weather[0].icon,
              desc: item.weather[0].main,
            });
          }
          setDaily(forecastData);
          /* by default 0th is selected */
          setSelected(forecastData[0]);
        },
        (error) => {}
      );
  };

  useEffect(() => {
    if (daily.length) {
      getForecastDetail();
    }
  }, [daily]);

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
    setCoords({
      lat: position.coords.latitude,
      lon: position.coords.longitude,
    });
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
    setCoords({
      lat: lat,
      lon: lon,
    });
  };

  const getForecastDetail = () => {
    let weatherApi;
    weatherApi = `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${process.env.REACT_APP_API_KEY}`;
    fetch(weatherApi)
      .then((response) => response.json())
      .then((response) => {
        let forecastArr = [];
        let curr;
        for (const item of response.list) {
          curr = getDay(item.dt);

          if (forecastObj.current && !forecastObj.current[curr]) {
            forecastArr = [];
          }
          forecastArr.push({ ...item, ...response.city });
          forecastObj.current[curr] = forecastArr;
          setCurrent({
            ...forecastObj.current[curr][0],
            ...forecastObj.current[curr][0].main,
            ...response.city,
          });
        }
        getForecastForDay(daily[0], true);
      });
  };

  const getForecastForDay = (item, first) => {
    setSelected(item);
    let charts = [];
    let hourData = [];
    if (!first) {
      setCurrent({
        ...forecastObj.current[item.day][0],
        ...forecastObj.current[item.day][0].main,
      });
    }
    for (const data of forecastObj.current[item.day]) {
      charts.push(data.main.temp);
      let time = getTime(new Date(data.dt * 1000));
      hourData.push([`${Math.ceil(data.main.temp)}°C`, time]);
    }
    setChartsData(charts);
    setHour(hourData);
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
                      item === selected
                        ? `${classes.dashboard__forecast__container__active}`
                        : ""
                    }`}
                    onClick={() => getForecastForDay(item)}
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
