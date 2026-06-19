import React from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import BloodAvailabilityGrid from "../components/BloodAvailabilityGrid";
import DonorCard from "../components/DonorCard";
import LocationPicker from "../components/LocationPicker";
import SearchableSelect from "../components/SearchableSelect";
import {
  getBloodAvailabilityOverview,
  getBloodGroups,
  getSortOptions,
  searchDonors,
} from "../utils/appData";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 9;

function Search({ mode = "public" }) {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = React.useState(() => ({
    query: searchParams.get("q") || "",
    bloodGroup: searchParams.get("bloodGroup") || "",
    sortBy: searchParams.get("sort") || "match",
    location: {
      country: searchParams.get("country") || currentUser?.homeCountry || "India",
      state: searchParams.get("state") || currentUser?.homeState || "",
      district: searchParams.get("district") || currentUser?.homeDistrict || "",
      city: searchParams.get("city") || currentUser?.homeCity || "",
    },
  }));
  const [page, setPage] = React.useState(1);
  const deferredQuery = React.useDeferredValue(filters.query);
  const bloodGroups = getBloodGroups();
  const sortOptions = getSortOptions();
  const availability = React.useMemo(
    () => getBloodAvailabilityOverview(filters.location),
    [filters.location]
  );

  React.useEffect(() => {
    setPage(1);
  }, [filters.query, filters.bloodGroup, filters.sortBy, filters.location]);

  React.useEffect(() => {
    if (location.state?.filters) {
      setFilters((current) => ({
        ...current,
        ...location.state.filters,
      }));
    }
  }, [location.state]);

  const resultSet = React.useMemo(() => {
    return searchDonors({
      query: deferredQuery,
      bloodGroup: filters.bloodGroup,
      country: filters.location.country,
      state: filters.location.state,
      district: filters.location.district,
      city: filters.location.city,
      sortBy: filters.sortBy,
      page,
      pageSize: PAGE_SIZE,
    });
  }, [deferredQuery, filters.bloodGroup, filters.location, filters.sortBy, page]);

  const heroLocationLabel = [
    filters.location.city,
    filters.location.district,
    filters.location.state,
    filters.location.country,
  ]
    .filter(Boolean)
    .join(", ");

  const sourceLabelMap = {
    "Registered Donor": "Registered donors",
    "National Blood Database": "National database",
    "State Blood Database": "State database",
    "Global Blood Database": "Global database",
  };

  const handleLocationChange = (nextLocation) => {
    setFilters((current) => ({
      ...current,
      location: nextLocation,
    }));
  };

  return (
    <div className="section">
      <div className="site-shell search-page">
        <div className="section-heading">
          <div>
            <span className="section-kicker">{mode === "dashboard" ? "Dashboard search" : "Global search"}</span>
            <h1>Search donors by blood group and location tier</h1>
            <p>
              Results are ranked from city to worldwide coverage so patients can expand the search path
              naturally if the closest match is not available.
            </p>
          </div>
          {!currentUser ? (
            <Link className="button primary" to="/login">
              Login for requests
            </Link>
          ) : (
            <span className="status-pill">Signed in as {currentUser.role}</span>
          )}
        </div>

        {mode === "public" ? (
          <div className="search-note">
            <strong>Public access:</strong> you can explore donors now, then login to create requests or donor
            profiles.
          </div>
        ) : null}

        <div className="search-layout">
          <aside className="search-sidebar card-panel">
            <div className="section-heading compact">
              <div>
                <span className="section-kicker">Filters</span>
                <h2>Refine the network</h2>
              </div>
            </div>

            <label className="field-group">
              <span className="field-label">Search</span>
              <input
                className="text-field"
                value={filters.query}
                onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
                placeholder="Name, city, hospital, or note"
              />
            </label>

            <SearchableSelect
              label="Blood group"
              value={filters.bloodGroup}
              options={bloodGroups}
              onChange={(value) => setFilters((current) => ({ ...current, bloodGroup: value }))}
              placeholder="Search blood group"
            />

            <LocationPicker
              value={filters.location}
              onChange={handleLocationChange}
              prefix="Location focus"
              helperText="Search expands outward from the selected city to worldwide coverage."
            />

            <SearchableSelect
              label="Sort"
              value={sortOptions.find((option) => option.value === filters.sortBy)?.label || "Best match"}
              options={sortOptions.map((option) => option.label)}
              onChange={(label) => {
                const match = sortOptions.find((option) => option.label === label);
                if (match) {
                  setFilters((current) => ({ ...current, sortBy: match.value }));
                }
              }}
              placeholder="Choose sort order"
            />

            <div className="search-summary-list">
              <div>
                <span>Matches</span>
                <strong>{resultSet.total}</strong>
              </div>
              <div>
                <span>City tier</span>
                <strong>{resultSet.tierCounts.city}</strong>
              </div>
              <div>
                <span>District tier</span>
                <strong>{resultSet.tierCounts.district}</strong>
              </div>
              <div>
                <span>State tier</span>
                <strong>{resultSet.tierCounts.state}</strong>
              </div>
              <div>
                <span>Country tier</span>
                <strong>{resultSet.tierCounts.country}</strong>
              </div>
              <div>
                <span>Worldwide tier</span>
                <strong>{resultSet.tierCounts.worldwide}</strong>
              </div>
            </div>
          </aside>

          <div className="search-results-column">
            <BloodAvailabilityGrid
              title="Blood availability statistics"
              subtitle={`Location focus: ${heroLocationLabel || "Worldwide"}`}
              items={availability}
              compact
            />

            <div className="source-summary-grid">
              {Object.entries(resultSet.sourceCounts).map(([source, count]) => (
                <article className="source-summary-card" key={source}>
                  <span>{sourceLabelMap[source] || source}</span>
                  <strong>{count}</strong>
                </article>
              ))}
            </div>

            <div className="results-header">
              <div>
                <span className="section-kicker">Results</span>
                <h2>{resultSet.total ? `${resultSet.total} donors matched` : "No donors matched"}</h2>
              </div>
              <span className="status-pill">
                Page {resultSet.page} of {resultSet.pageCount}
              </span>
            </div>

            <div className="results-grid">
              {resultSet.results.length ? (
                resultSet.results.map((donor) => (
                  <div key={donor.id} className="result-card-shell">
                    <DonorCard donor={donor} allowReport={mode === "dashboard" && !donor.isSeeded && donor.ownerId !== currentUser?.id} />
                    <div className="result-card-footer-row">
                      <span className={`tier-pill tier-${donor.matchTier}`}>{donor.matchTier}</span>
                      <span className="source-pill">{donor.sourceType}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state wide">
                  <h3>No donors matched your search</h3>
                  <p>Try a different blood group, broaden the location focus, or clear the text search.</p>
                </div>
              )}
            </div>

            {resultSet.pageCount > 1 ? (
              <div className="pagination-row">
                <button className="button ghost" type="button" disabled={resultSet.page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                  Previous
                </button>
                <span>
                  Page {resultSet.page} of {resultSet.pageCount}
                </span>
                <button
                  className="button ghost"
                  type="button"
                  disabled={resultSet.page >= resultSet.pageCount}
                  onClick={() => setPage((value) => Math.min(resultSet.pageCount, value + 1))}
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Search;
