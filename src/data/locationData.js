import { State, City } from "country-state-city";

const COUNTRY_CONFIGS = [
  { displayName: "India", countryCode: "IN", kind: "india" },
  { displayName: "United States", countryCode: "US", kind: "global" },
  { displayName: "United Kingdom", countryCode: "GB", kind: "global" },
  { displayName: "Canada", countryCode: "CA", kind: "global" },
  { displayName: "Australia", countryCode: "AU", kind: "global" },
  { displayName: "Germany", countryCode: "DE", kind: "global" },
  { displayName: "France", countryCode: "FR", kind: "global" },
  { displayName: "UAE", countryCode: "AE", kind: "global" },
  { displayName: "Singapore", countryCode: "SG", kind: "global" },
  { displayName: "Malaysia", countryCode: "MY", kind: "global" },
  { displayName: "South Africa", countryCode: "ZA", kind: "global" },
  { displayName: "Other Countries", countryCode: "ZZ", kind: "generic" },
];

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((first, second) => first.localeCompare(second));
}

function splitEvenly(values, bucketCount) {
  if (!values.length) {
    return Array.from({ length: bucketCount }, () => []);
  }

  const safeBucketCount = Math.max(1, bucketCount);
  const size = Math.ceil(values.length / safeBucketCount);
  const chunks = [];

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }

  while (chunks.length < safeBucketCount) {
    chunks.push([]);
  }

  return chunks;
}

function buildSyntheticDistrictNames(stateName, bucketCount) {
  const prefixes = ["Metro", "Central", "North", "South", "East", "West"];
  return Array.from({ length: bucketCount }, (_, index) => `${prefixes[index % prefixes.length]} ${stateName}`);
}

function buildGenericProfile() {
  const stateDefinitions = [
    {
      name: "Global Health Hub",
      districts: [
        {
          name: "Central Corridor",
          cities: ["Global Health City", "Care Junction", "Relay Point"],
        },
        {
          name: "North Corridor",
          cities: ["North Care", "Beacon Point", "Unity Square"],
        },
      ],
    },
    {
      name: "Regional Relief",
      districts: [
        {
          name: "Metro Center",
          cities: ["Metro Relief", "Hospital Link", "Rapid Care"],
        },
        {
          name: "Outer Belt",
          cities: ["Outer Care", "Field Support", "Aid Network"],
        },
      ],
    },
    {
      name: "Cross Border",
      districts: [
        {
          name: "Transit Hub",
          cities: ["Transit One", "Transit Two", "Transit Three"],
        },
        {
          name: "Community Arc",
          cities: ["Community Care", "Open Relief", "Shared Support"],
        },
      ],
    },
    {
      name: "Remote Support",
      districts: [
        {
          name: "Field Cluster",
          cities: ["Remote Aid", "Relay Field", "Safe Point"],
        },
        {
          name: "Bridge Cluster",
          cities: ["Bridge Care", "Link Point", "Neighbor Aid"],
        },
      ],
    },
  ];

  return {
    displayName: "Other Countries",
    countryCode: "ZZ",
    states: stateDefinitions,
  };
}

function buildIndiaProfile() {
  const states = State.getStatesOfCountry("IN").map((state) => {
    const cities = uniqueSorted(City.getCitiesOfState("IN", state.isoCode).map((city) => city.name));
    const districtCount = Math.max(3, Math.min(5, Math.ceil(Math.max(cities.length, 6) / 10)));
    const districtNames = buildSyntheticDistrictNames(state.name, districtCount);
    const cityChunks = splitEvenly(cities.length ? cities : [`${state.name} City`], districtCount);

    return {
      name: state.name,
      code: state.code,
      districts: districtNames.map((districtName, index) => ({
        name: districtName,
        code: `${state.code}-${index + 1}`,
        cities: uniqueSorted(cityChunks[index] || [`${districtName} City`]),
      })),
    };
  });

  return {
    displayName: "India",
    countryCode: "IN",
    states,
  };
}

function buildGlobalProfile({ displayName, countryCode }) {
  const packageStates = State.getStatesOfCountry(countryCode);

  const states = packageStates.map((state) => {
    const cities = uniqueSorted(City.getCitiesOfState(countryCode, state.isoCode).map((city) => city.name));
    const districtCount = Math.max(2, Math.min(4, Math.ceil(Math.max(cities.length, 4) / 8)));
    const districtNames = buildSyntheticDistrictNames(state.name, districtCount);
    const cityChunks = splitEvenly(cities.length ? cities : [`${state.name} City`], districtCount);

    return {
      name: state.name,
      code: state.isoCode,
      districts: districtNames.map((districtName, index) => ({
        name: districtName,
        code: `${state.isoCode}-${index + 1}`,
        cities: uniqueSorted(cityChunks[index] || [`${districtName} City`]),
      })),
    };
  });

  return {
    displayName,
    countryCode,
    states,
  };
}

function buildLocationProfiles() {
  const profiles = {};

  for (const config of COUNTRY_CONFIGS) {
    if (config.kind === "generic") {
      profiles[config.displayName] = buildGenericProfile();
      continue;
    }

    if (config.kind === "india") {
      profiles[config.displayName] = buildIndiaProfile();
      continue;
    }

    profiles[config.displayName] = buildGlobalProfile(config);
  }

  return profiles;
}

export const LOCATION_PROFILES = buildLocationProfiles();

export const COUNTRY_OPTIONS = COUNTRY_CONFIGS.map((entry) => entry.displayName);

export function getCountryProfile(country) {
  return LOCATION_PROFILES[country] || LOCATION_PROFILES["Other Countries"];
}

export function getCountries() {
  return COUNTRY_OPTIONS;
}

export function getStatesForCountry(country) {
  return getCountryProfile(country).states.map((state) => state.name);
}

export function getDistrictsForState(country, stateName) {
  const profile = getCountryProfile(country);
  const state = profile.states.find((entry) => entry.name === stateName);
  return state ? state.districts.map((district) => district.name) : [];
}

export function getCitiesForDistrict(country, stateName, districtName) {
  const profile = getCountryProfile(country);
  const state = profile.states.find((entry) => entry.name === stateName);
  const district = state?.districts.find((entry) => entry.name === districtName);
  return district ? district.cities : [];
}

export function getDefaultState(country) {
  return getStatesForCountry(country)[0] || "";
}

export function getDefaultDistrict(country, stateName) {
  return getDistrictsForState(country, stateName)[0] || "";
}

export function getDefaultCity(country, stateName, districtName) {
  return getCitiesForDistrict(country, stateName, districtName)[0] || "";
}

export function normalizeLocationSelection(selection = {}) {
  return {
    country: selection.country || "",
    state: selection.state || "",
    district: selection.district || "",
    city: selection.city || "",
  };
}

export function locationMatches(record, selection = {}) {
  const normalized = normalizeLocationSelection(selection);

  return (
    (!normalized.country || record.country === normalized.country) &&
    (!normalized.state || record.state === normalized.state) &&
    (!normalized.district || record.district === normalized.district) &&
    (!normalized.city || record.city === normalized.city)
  );
}

export function getLocationHierarchy(country, stateName, districtName, cityName) {
  return [cityName, districtName, stateName, country].filter(Boolean).join(", ");
}

export function searchLocations(query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const results = [];

  for (const [countryName, profile] of Object.entries(LOCATION_PROFILES)) {
    if (countryName.toLowerCase().includes(normalizedQuery)) {
      results.push({ level: "country", country: countryName, state: "", district: "", city: "" });
    }

    for (const state of profile.states) {
      if (state.name.toLowerCase().includes(normalizedQuery)) {
        results.push({
          level: "state",
          country: countryName,
          state: state.name,
          district: "",
          city: "",
        });
      }

      for (const district of state.districts) {
        if (district.name.toLowerCase().includes(normalizedQuery)) {
          results.push({
            level: "district",
            country: countryName,
            state: state.name,
            district: district.name,
            city: "",
          });
        }

        for (const city of district.cities) {
          if (city.toLowerCase().includes(normalizedQuery)) {
            results.push({
              level: "city",
              country: countryName,
              state: state.name,
              district: district.name,
              city,
            });
          }
        }
      }
    }
  }

  return results.slice(0, 30);
}
