---
title: Auto-detect location react component using google geocoding and reverse geocoding in autocomplete
date: 2018/01/03
description: A Guide to build Auto-detect location react component
author: You
---


Auto-detect location react component using google geocoding and reverse geocoding in autocomplete
=================================================================================================

![](https://miro.medium.com/max/820/1*dRA6Fo6Xb7gLVuVzOoTrLA.png)Auto detect React Component

> **AutoDetect : Dumb component**

Make a state less component with the SVG included.

onClick handler is passed as props for this component which is defined in Higher order component (`AutoComplete`)

```
import React from "react";  
import PropTypes from "prop-types";  
import Navigation from "./navigation.svg";const style = {  
  width: "14px"  
};  
const AutoDetect = (props) => {  
  return (  
    <div >  
      <span className="Datalist\_\_item h-48 c-blue flex flex-middle fs-14" onClick={ props.onClick } >  
        <Navigation className="Note\_\_icon mr-5" fill="#36c" style={ style } /> Current location  
      </span>  
    </div>  
  );  
};  
AutoDetect.propTypes = {  
  onClick: PropTypes.func  
};  
AutoDetect.defaultProps = {  
  onClick: null  
};export default AutoDetect;
```

> **AutoComplete : Pure component**

We call `this._renderAutoDetect()` in render method of AutoComplete which in turns calls `**<AutoDetect />**` component described above.

We will pass onClick handler to this

```
<AutoDetect onClick={ this.\_detectUserLocation } />
```

which will be passed as prop to AutoDetect component.

`**_detectUserLocation**` is where we call browser object `**navigator.geolocation.getCurrentPosition**` which will first prompt user to allow or deny location.

![](https://miro.medium.com/max/674/1*WNC_YM1ed_QP4j9CQrVDUA.png)Browser prompt

If it is allowed then either success or error callback is called.

> **Error callback**

```
this.geoError = (error) => {  
    switch (error.code) {  
      case error.TIMEOUT:  
      console.log("Browser geolocation error !\\n\\nTimeout.");  
      break;  
      case error.PERMISSION\_DENIED:  
      console.log("Only secure origins are allowed");  
      break;  
      case error.POSITION\_UNAVAILABLE:  
      console.log("Browser geolocation error !\\n\\nPosition unavailable.");  
      break;  
      default:  
      console.log(error.code);  
      break;  
     }  
};
```

> **Success callback**

```
this.geoSuccess = (position) => {  
     this.\_displayLocation(position.coords.latitude, position.coords.longitude);  
};
```

The success callback `**geoSuccess**` has position as parameter which contains user latitude and longitude.

Now we will call `**_displayLocation**` passing these lat and long for Google reverse geocoding.

> **Google Reverse GeoCoding**

```
\_geocodeAddress = (geocoder, latlng) => {  
    geocoder.geocode({ location: latlng }, this.\_geoCodeCallback);  
 }if (navigator.geolocation) {  
     this.\_displayLocation = (latitude, longitude) => {  
      const geocoder = new google.maps.Geocoder();  
      const latlng = new google.maps.LatLng(latitude, longitude);  
      this.\_geocodeAddress(geocoder, latlng);  
};
```

From success callback of Geocoding , we called `**_displayLocation**` where we will instantiate google map `**Geocoder**` and call `**maps.Latlng**`

The callback after success is `**_geoCodeCallBack**`

This callback will have result of different address formats fetched from passed latitude and longitude.

We can fetch city from this result.

```
\_geoCodeCallback = (results, status, event) => {  
    const google = window.google; // eslint-disable-line  
   if (status === google.maps.GeocoderStatus.OK) {  
    if (results\[0\]) {  
      const add = results\[0\].formatted\_address;  
      const value = add.split(",");  
      const count = value.length;  
      const city = value\[count - 3\];  
      // here we can dispatch action to search by city name and     autofill the autocomplete  
    } else {  
      console.log("address not found");  
    }  
    } else {  
      console.log(status);  
    }  
 }
```

Now we can dispatch an action to React Middleware or directly to store using connect to fetch the autocomplete result from the city.

```
const bindActionsToDispatch = dispatch =>  
(  
 {  
  searchFlightAirports: (city, meta) => {  
     dispatch(<action\_creator name>(city, meta));  
  }  
 }  
);  
export default connect(null, bindActionsToDispatch)(Autocomplete);
```

**Below is the entire code.**

```
\_geoCodeCallback = (results, status, event) => {  
    const google = window.google; // eslint-disable-line  
   if (status === google.maps.GeocoderStatus.OK) {  
    if (results\[0\]) {  
      const add = results\[0\].formatted\_address;  
      const value = add.split(",");  
      const count = value.length;  
      const city = value\[count - 3\];  
      // here we can dispatch action to search by city name and autofill the autocomplete  
    } else {  
      console.log("address not found");  
    }  
    } else {  
      console.log(status);  
    }  
  }\_geocodeAddress = (geocoder, latlng) => {  
    geocoder.geocode({ location: latlng }, this.\_geoCodeCallback);  
  }\_detectUserLocation = (event) => {  
    // check for Geolocation support  
    const google = window.google; // eslint-disable-lineif (navigator.geolocation) {  
     this.\_displayLocation = (latitude, longitude) => {  
      const geocoder = new google.maps.Geocoder();  
      const latlng = new google.maps.LatLng(latitude, longitude);  
      this.\_geocodeAddress(geocoder, latlng);  
    };this.geoSuccess = (position) => {  
     this.\_displayLocation(position.coords.latitude, position.coords.longitude);  
  };this.geoError = (error) => {  
    switch (error.code) {  
      case error.TIMEOUT:  
      console.log("Browser geolocation error !\\n\\nTimeout.");  
      break;  
      case error.PERMISSION\_DENIED:  
      console.log("Only secure origins are allowed");  
      break;  
      case error.POSITION\_UNAVAILABLE:  
      console.log("Browser geolocation error !\\n\\nPosition unavailable.");  
      break;  
      default:  
      console.log(error.code);  
      break;  
     }  
  };  
   navigator.geolocation.getCurrentPosition(this.geoSuccess, this.geoError);  
  } else {  
   console.log("Geolocation is not supported for this Browser/OS.");  
  }  
 }\_renderAutoDetect = () => {  
  return (  
    <AutoDetect onClick={ this.\_detectUserLocation } />  
  );  
}render() {  
    return (  
     <div className="Autocomplete">  
        <Input  
          autoFocus={ this.props.autoFocus }  
          focusDelay={ this.props.focusDelay }  
          name="autocomplete"  
          inputClassName="Autocomplete\_\_search mb-0"  
          value={ this.props.value }  
          onChange={ this.\_handleChange }  
          autoComplete="off"  
          placeholder={ this.props.placeHolder }  
        />  
        this.\_renderAutoDetect()  
      </div>  
    );  
  }  
}
```

> Note: You will need to create Google API map key and include that in your website layout file.
