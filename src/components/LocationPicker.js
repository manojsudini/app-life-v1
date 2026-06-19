import React from "react";
import {
  getCitiesForCountryStateDistrict,
  getCountries,
  getDistrictsForCountryState,
  getStatesForCountry,
} from "../utils/appData";
import SearchableSelect from "./SearchableSelect";

function LocationPicker({ value, onChange, disabled = false, prefix = "Location", helperText = "" }) {
  const countryOptions = React.useMemo(() => getCountries(), []);
  const stateOptions = React.useMemo(() => getStatesForCountry(value.country), [value.country]);
  const districtOptions = React.useMemo(
    () => getDistrictsForCountryState(value.country, value.state),
    [value.country, value.state]
  );
  const cityOptions = React.useMemo(
    () => getCitiesForCountryStateDistrict(value.country, value.state, value.district),
    [value.country, value.state, value.district]
  );

  const updateLocation = (field, nextValue) => {
    if (field === "country") {
      const nextState = getStatesForCountry(nextValue)[0] || "";
      const nextDistrict = getDistrictsForCountryState(nextValue, nextState)[0] || "";
      const nextCity = getCitiesForCountryStateDistrict(nextValue, nextState, nextDistrict)[0] || "";
      onChange({
        country: nextValue,
        state: nextState,
        district: nextDistrict,
        city: nextCity,
      });
      return;
    }

    if (field === "state") {
      const nextDistrict = getDistrictsForCountryState(value.country, nextValue)[0] || "";
      const nextCity = getCitiesForCountryStateDistrict(value.country, nextValue, nextDistrict)[0] || "";
      onChange({
        ...value,
        state: nextValue,
        district: nextDistrict,
        city: nextCity,
      });
      return;
    }

    if (field === "district") {
      const nextCity = getCitiesForCountryStateDistrict(value.country, value.state, nextValue)[0] || "";
      onChange({
        ...value,
        district: nextValue,
        city: nextCity,
      });
      return;
    }

    onChange({
      ...value,
      [field]: nextValue,
    });
  };

  return (
    <div className="location-picker">
      <div className="section-mini-title">{prefix}</div>
      <div className="location-grid">
        <SearchableSelect
          label="Country"
          value={value.country}
          options={countryOptions}
          onChange={(nextValue) => updateLocation("country", nextValue)}
          placeholder="Search country"
          disabled={disabled}
          required
        />
        <SearchableSelect
          label="State"
          value={value.state}
          options={stateOptions}
          onChange={(nextValue) => updateLocation("state", nextValue)}
          placeholder="Search state"
          disabled={disabled || !value.country}
          required
        />
        <SearchableSelect
          label="District"
          value={value.district}
          options={districtOptions}
          onChange={(nextValue) => updateLocation("district", nextValue)}
          placeholder="Search district"
          disabled={disabled || !value.state}
          required
        />
        <SearchableSelect
          label="City"
          value={value.city}
          options={cityOptions}
          onChange={(nextValue) => updateLocation("city", nextValue)}
          placeholder="Search city"
          disabled={disabled || !value.district}
          required
        />
      </div>
      {helperText ? <p className="field-help">{helperText}</p> : null}
    </div>
  );
}

export default LocationPicker;

