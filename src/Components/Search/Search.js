import classes from "./Search.module.scss";
import React, { useState, useRef } from "react";
import pinIcon from "../../Images/pin.svg";
import searchIcon from "../../Images/search.svg";
import { useClickOutside } from "../../Hooks/useClickOutside";

const Search = (props) => {
  let [searchRes, SetSearchRes] = useState([]);
  let [val, setVal] = useState(props.defaultVal);
  const dropdownRef = useRef(null);
  useClickOutside(dropdownRef, () => {
    /* when clicked outside the dropdown, close the dropdown  */
    SetSearchRes([]);
    setVal("");
  });

  const search = (e) => {
    setVal(e.target.value);
    if (!e.target.value.length) {
      SetSearchRes([]);
    }
    if (e.target.value.length > 3) {
      const weatherApi = `https://api.openweathermap.org/data/2.5/find?q=${e.target.value}&cnt=10&units=metric&appid=${process.env.REACT_APP_API_KEY}`;

      fetch(weatherApi)
        .then((response) => response.json())
        .then((response) => {
          let searchData = [];
          for (const item of response.list) {
            searchData.push({
              lat: item.coord.lat,
              lon: item.coord.lon,
              name: item.name,
              temp: Math.ceil(item.main.temp),
              icon: item.weather[0].icon,
              desc: item.weather[0].main,
            });
          }
          SetSearchRes(searchData);
        });
    }
  };

  const searchData = (lat, lon) => {
    props.getSearchData(lat, lon);
    SetSearchRes([]);
  };

  return (
    <div className={classes.search} ref={dropdownRef}>
      <input
        value={val}
        type="text"
        className={classes.search__input}
        onChange={search}
      />
      <img src={pinIcon} alt="" className={classes.search__pin} />
      <img src={searchIcon} alt="" className={classes.search__searchIcon} />
      {searchRes.length ? (
        <div className={classes.search__dropdown}>
          {searchRes.map((item, index) => {
            return (
              <div
                key={index}
                className={classes.search__dropdown__res}
                onClick={() => searchData(item.lat, item.lon)}
              >
                <span>{item.name}</span>
                <div className={classes.search__dropdown__info}>
                  <div className={classes.search__dropdown__info__temp}>
                    <span>{item.temp}&#8451;</span>
                    <span className={classes.search__dropdown__info__desc}>
                      {item.desc}
                    </span>
                  </div>
                  <div>
                    <img
                      className={classes.dashboard__forecast__image}
                      src={`https://openweathermap.org/img/wn/${item.icon}.png`}
                      alt=""
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default Search;
