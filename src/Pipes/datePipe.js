export const getTime = (dateValue) => {
  /* transforms timestamp into AM/PM format */
  return dateValue.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

export const getDay = (param) => {
  /* get day from timestamp */
  let days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
  if (param) {
    let date = new Date(param * 1000);
    return days[date.getDay()];
  } else {
    return days[new Date().getDay()];
  }
};
