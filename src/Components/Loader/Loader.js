import classes from "./Loader.module.scss";
import React from "react";

const Loader = (props) => {
  return (
      <div className={classes.parent}>

          <div className={classes.loader}>Loading...</div>
      </div>
  )
};

export default Loader;
