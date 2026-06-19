import {
  AVAILABILITY_OPTIONS,
  BLOOD_BASE_COUNTS,
  BLOOD_GROUPS,
  DASHBOARD_MENU,
  EMERGENCY_BANNER,
  GENDER_OPTIONS,
  HOME_STEPS,
  PUBLIC_NAV,
  SEEDED_DONORS,
  SEEDED_PATIENT_REQUESTS,
  SORT_OPTIONS,
  TESTIMONIALS,
  URGENCY_OPTIONS,
  WHOLE_PLATFORM_SUMMARY,
} from "../data/networkData";
import {
  getCitiesForDistrict,
  getCountries as getLocationCountries,
  getDefaultCity,
  getDefaultDistrict,
  getDefaultState,
  getDistrictsForState as getLocationDistrictsForState,
  getLocationHierarchy,
  getStatesForCountry as getLocationStatesForCountry,
  normalizeLocationSelection,
  searchLocations,
} from "../data/locationData";
import { createId, normalizeEmail, normalizeText, readStorage, removeStorage, writeStorage } from "./storage";

const STORAGE_KEYS = {
  users: "lifeconnect.users",
  session: "lifeconnect.session",
  donorProfiles: "lifeconnect.donorProfiles",
  patientRequests: "lifeconnect.patientRequests",
  preferences: "lifeconnect.preferences",
};

const AVAILABILITY_RANKS = {
  "Available now": 4,
  "Available today": 3,
  "Available this week": 2,
  "On-call support only": 1,
};

const URGENCY_RANKS = {
  Critical: 4,
  High: 3,
  Moderate: 2,
  Stable: 1,
};

function sortByUpdatedAt(records) {
  return [...records].sort((first, second) => {
    return new Date(second.updatedAt || second.createdAt || 0) - new Date(first.updatedAt || first.createdAt || 0);
  });
}

function dedupeById(records) {
  const seen = new Set();
  const output = [];

  for (const record of records) {
    if (!record?.id || seen.has(record.id)) {
      continue;
    }

    seen.add(record.id);
    output.push(record);
  }

  return output;
}

function mergeSeededRecords(storageKey, seedRecords) {
  const persistedRecords = readStorage(storageKey, []);
  return sortByUpdatedAt(dedupeById([...persistedRecords, ...seedRecords]));
}

function getSafeUser(user, token = "") {
  if (!user) {
    return null;
  }

  const { password, ...safeUser } = user;
  return token ? { ...safeUser, token } : safeUser;
}

function createJwtLikeToken(user) {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: user.id,
    role: user.role,
    name: user.name,
    issuedAt: Date.now(),
  };

  const encode = (value) => {
    const rawValue = JSON.stringify(value);

    if (typeof window !== "undefined" && typeof window.btoa === "function") {
      return window.btoa(unescape(encodeURIComponent(rawValue)));
    }

    if (typeof Buffer !== "undefined") {
      return Buffer.from(rawValue, "utf-8").toString("base64");
    }

    return rawValue;
  };

  return `${encode(header)}.${encode(payload)}.${createId("sig")}`;
}

function findUserRecordById(userId) {
  const users = readStorage(STORAGE_KEYS.users, []);
  return users.find((user) => user.id === userId) || null;
}

function getSessionRecord() {
  return readStorage(STORAGE_KEYS.session, null);
}

function writeSessionRecord(user) {
  const session = {
    userId: user.id,
    token: createJwtLikeToken(user),
  };

  writeStorage(STORAGE_KEYS.session, session);
  return session;
}

function validateRequiredFields(values, fields) {
  const missingFields = fields.filter((field) => !normalizeText(values[field]));

  if (missingFields.length) {
    throw new Error("Please complete all required fields.");
  }
}

function buildDonorRecord(values, currentUser, existingRecord) {
  const now = new Date().toISOString();
  const country = normalizeText(values.country) || currentUser?.homeCountry || "India";
  const state = normalizeText(values.state) || currentUser?.homeState || getDefaultState(country);
  const district = normalizeText(values.district) || currentUser?.homeDistrict || getDefaultDistrict(country, state);
  const city = normalizeText(values.city) || currentUser?.homeCity || getDefaultCity(country, state, district);

  return {
    id: existingRecord?.id || createId("donor"),
    ownerId: currentUser.id,
    fullName: normalizeText(values.fullName) || currentUser.name,
    bloodGroup: normalizeText(values.bloodGroup),
    gender: normalizeText(values.gender),
    mobileNumber: normalizeText(values.mobileNumber),
    email: normalizeEmail(values.email) || currentUser.email,
    country,
    state,
    district,
    city,
    availabilityStatus: normalizeText(values.availabilityStatus),
    lastDonationDate: values.lastDonationDate || "",
    supportMessage: normalizeText(values.supportMessage),
    profilePhoto: values.profilePhoto || existingRecord?.profilePhoto || "",
    sourceType: "Registered Donor",
    verificationStatus: (existingRecord?.reportUserIds || []).length >= 3 ? "Under review" : "Proof uploaded",
    reportUserIds: existingRecord?.reportUserIds || [],
    isSeeded: false,
    createdAt: existingRecord?.createdAt || now,
    updatedAt: now,
  };
}

function buildPatientRecord(values, currentUser, existingRecord) {
  const now = new Date().toISOString();
  const country = normalizeText(values.country) || currentUser?.homeCountry || "India";
  const state = normalizeText(values.state) || currentUser?.homeState || getDefaultState(country);
  const district = normalizeText(values.district) || currentUser?.homeDistrict || getDefaultDistrict(country, state);
  const city = normalizeText(values.city) || currentUser?.homeCity || getDefaultCity(country, state, district);

  return {
    id: existingRecord?.id || createId("request"),
    ownerId: currentUser.id,
    patientName: normalizeText(values.patientName) || currentUser.name,
    hospitalName: normalizeText(values.hospitalName),
    bloodGroupRequired: normalizeText(values.bloodGroupRequired),
    unitsRequired: normalizeText(values.unitsRequired),
    requiredDate: values.requiredDate || "",
    urgencyLevel: normalizeText(values.urgencyLevel),
    contactNumber: normalizeText(values.contactNumber),
    country,
    state,
    district,
    city,
    medicalNotes: normalizeText(values.medicalNotes),
    documentUrl: values.documentUrl || existingRecord?.documentUrl || "",
    status: (existingRecord?.reportUserIds || []).length >= 3 ? "Needs review" : "Active",
    reportUserIds: existingRecord?.reportUserIds || [],
    isSeeded: false,
    createdAt: existingRecord?.createdAt || now,
    updatedAt: now,
  };
}

function filterByText(records, query, fields) {
  const normalizedQuery = normalizeText(query).toLowerCase();

  if (!normalizedQuery) {
    return records;
  }

  return records.filter((record) =>
    fields.some((field) => normalizeText(record[field]).toLowerCase().includes(normalizedQuery))
  );
}

function getLocationTier(record, selection = {}) {
  const normalized = normalizeLocationSelection(selection);

  if (
    normalized.city &&
    record.city === normalized.city &&
    record.district === normalized.district &&
    record.state === normalized.state &&
    record.country === normalized.country
  ) {
    return "city";
  }

  if (
    normalized.district &&
    record.district === normalized.district &&
    record.state === normalized.state &&
    record.country === normalized.country
  ) {
    return "district";
  }

  if (normalized.state && record.state === normalized.state && record.country === normalized.country) {
    return "state";
  }

  if (normalized.country && record.country === normalized.country) {
    return "country";
  }

  return "worldwide";
}

function getHierarchyCounts(records, selection = {}) {
  const normalized = normalizeLocationSelection(selection);
  const worldwide = records.length;
  const countryRecords = normalized.country
    ? records.filter((record) => record.country === normalized.country)
    : records;
  const stateRecords = normalized.state
    ? countryRecords.filter((record) => record.state === normalized.state)
    : countryRecords;
  const districtRecords = normalized.district
    ? stateRecords.filter((record) => record.district === normalized.district)
    : stateRecords;
  const cityRecords = normalized.city ? districtRecords.filter((record) => record.city === normalized.city) : districtRecords;

  return {
    worldwide,
    country: countryRecords.length,
    state: stateRecords.length,
    district: districtRecords.length,
    city: cityRecords.length,
  };
}

function compareByMatchTier(first, second) {
  const tierOrder = {
    city: 0,
    district: 1,
    state: 2,
    country: 3,
    worldwide: 4,
  };

  return tierOrder[first.matchTier] - tierOrder[second.matchTier];
}

function compareAvailability(first, second) {
  return (AVAILABILITY_RANKS[second.availabilityStatus] || 0) - (AVAILABILITY_RANKS[first.availabilityStatus] || 0);
}

function augmentDonorForSearch(record, selection = {}) {
  return {
    ...record,
    matchTier: getLocationTier(record, selection),
    matchLabel: getLocationTier(record, selection),
    availabilityRank: AVAILABILITY_RANKS[record.availabilityStatus] || 0,
    updatedTimestamp: new Date(record.updatedAt || record.createdAt || 0).getTime(),
  };
}

export function getBloodGroups() {
  return BLOOD_GROUPS;
}

export function getAvailabilityOptions() {
  return AVAILABILITY_OPTIONS;
}

export function getUrgencyOptions() {
  return URGENCY_OPTIONS;
}

export function getGenderOptions() {
  return GENDER_OPTIONS;
}

export function getSortOptions() {
  return SORT_OPTIONS;
}

export function getCountriesList() {
  return getLocationCountries();
}

export function getStatesForSelectedCountry(country) {
  return getLocationStatesForCountry(country);
}

export function getDistrictsForSelectedState(country, state) {
  return getLocationDistrictsForState(country, state);
}

export function getCitiesForSelectedDistrict(country, state, district) {
  return getCitiesForDistrict(country, state, district);
}

export function getDonorProfiles() {
  return sortByUpdatedAt(readStorage(STORAGE_KEYS.donorProfiles, []));
}

export function getCommunityDonorByOwner(ownerId) {
  return getDonorProfiles().find((record) => record.ownerId === ownerId) || null;
}

export function getAllDonors() {
  return mergeSeededRecords(STORAGE_KEYS.donorProfiles, SEEDED_DONORS);
}

export function getSearchableDonors() {
  return getAllDonors();
}

export function upsertDonorProfile(values, currentUser) {
  if (!currentUser) {
    throw new Error("Please login first.");
  }

  validateRequiredFields(values, [
    "fullName",
    "bloodGroup",
    "gender",
    "mobileNumber",
    "email",
    "country",
    "state",
    "district",
    "city",
    "availabilityStatus",
    "lastDonationDate",
    "supportMessage",
  ]);

  const existingRecord = getCommunityDonorByOwner(currentUser.id);
  const profilePhoto = values.profilePhoto || existingRecord?.profilePhoto || "";

  if (!profilePhoto) {
    throw new Error("A profile photo is required before the donor profile can go live.");
  }

  const nextRecord = buildDonorRecord({ ...values, profilePhoto }, currentUser, existingRecord);
  const donorProfiles = readStorage(STORAGE_KEYS.donorProfiles, []);
  const updatedProfiles = existingRecord
    ? donorProfiles.map((record) => (record.id === existingRecord.id ? nextRecord : record))
    : [nextRecord, ...donorProfiles];

  writeStorage(STORAGE_KEYS.donorProfiles, updatedProfiles);
  return nextRecord;
}

export function upsertCommunityDonor(values, currentUser) {
  return upsertDonorProfile(values, currentUser);
}

export function reportDonorProfile(donorId, currentUser) {
  const donorProfiles = readStorage(STORAGE_KEYS.donorProfiles, []);
  const donor = donorProfiles.find((entry) => entry.id === donorId);

  if (!donor) {
    throw new Error("That donor profile was not found.");
  }

  if (donor.isSeeded) {
    throw new Error("Seeded network donors are read-only and cannot be reported.");
  }

  if (donor.ownerId === currentUser.id) {
    throw new Error("You cannot report your own donor profile.");
  }

  const reportUserIds = donor.reportUserIds || [];

  if (reportUserIds.includes(currentUser.id)) {
    return { updatedRecord: donor, alreadyReported: true };
  }

  const updatedRecord = {
    ...donor,
    reportUserIds: [...reportUserIds, currentUser.id],
    verificationStatus: reportUserIds.length + 1 >= 3 ? "Under review" : donor.verificationStatus,
    updatedAt: new Date().toISOString(),
  };

  writeStorage(
    STORAGE_KEYS.donorProfiles,
    donorProfiles.map((entry) => (entry.id === donorId ? updatedRecord : entry))
  );

  return { updatedRecord, alreadyReported: false };
}

export function reportCommunityDonor(donorId, currentUser) {
  return reportDonorProfile(donorId, currentUser);
}

export function getPatientRequests() {
  return mergeSeededRecords(STORAGE_KEYS.patientRequests, SEEDED_PATIENT_REQUESTS);
}

export function getCommunityPatientRequestByOwner(ownerId) {
  return sortByUpdatedAt(readStorage(STORAGE_KEYS.patientRequests, [])).find((record) => record.ownerId === ownerId) || null;
}

export function getPatientRequestByOwner(ownerId) {
  return getCommunityPatientRequestByOwner(ownerId);
}

export function getAllRequests() {
  return getPatientRequests();
}

export function upsertPatientRequest(values, currentUser) {
  if (!currentUser) {
    throw new Error("Please login first.");
  }

  validateRequiredFields(values, [
    "patientName",
    "hospitalName",
    "bloodGroupRequired",
    "unitsRequired",
    "requiredDate",
    "urgencyLevel",
    "contactNumber",
    "country",
    "state",
    "district",
    "city",
    "medicalNotes",
  ]);

  const existingRecord = getCommunityPatientRequestByOwner(currentUser.id);
  const documentUrl = values.documentUrl || existingRecord?.documentUrl || "";
  const nextRecord = buildPatientRecord({ ...values, documentUrl }, currentUser, existingRecord);
  const patientRequests = readStorage(STORAGE_KEYS.patientRequests, []);
  const updatedRequests = existingRecord
    ? patientRequests.map((record) => (record.id === existingRecord.id ? nextRecord : record))
    : [nextRecord, ...patientRequests];

  writeStorage(STORAGE_KEYS.patientRequests, updatedRequests);
  return nextRecord;
}

export function reportPatientRequest(requestId, currentUser) {
  const patientRequests = readStorage(STORAGE_KEYS.patientRequests, []);
  const request = patientRequests.find((entry) => entry.id === requestId);

  if (!request) {
    throw new Error("That patient request was not found.");
  }

  if (request.isSeeded) {
    throw new Error("Seeded patient requests are read-only and cannot be reported.");
  }

  if (request.ownerId === currentUser.id) {
    throw new Error("You cannot report your own patient request.");
  }

  const reportUserIds = request.reportUserIds || [];

  if (reportUserIds.includes(currentUser.id)) {
    return { updatedRecord: request, alreadyReported: true };
  }

  const updatedRecord = {
    ...request,
    reportUserIds: [...reportUserIds, currentUser.id],
    status: reportUserIds.length + 1 >= 3 ? "Needs review" : request.status,
    updatedAt: new Date().toISOString(),
  };

  writeStorage(
    STORAGE_KEYS.patientRequests,
    patientRequests.map((entry) => (entry.id === requestId ? updatedRecord : entry))
  );

  return { updatedRecord, alreadyReported: false };
}

export function getRecentUrgentRequests(limit = 3) {
  return getAllRequests()
    .filter((request) => request.status === "Active")
    .sort((first, second) => {
      const urgencyGap = (URGENCY_RANKS[second.urgencyLevel] || 0) - (URGENCY_RANKS[first.urgencyLevel] || 0);

      if (urgencyGap !== 0) {
        return urgencyGap;
      }

      return new Date(second.updatedAt || second.createdAt || 0) - new Date(first.updatedAt || first.createdAt || 0);
    })
    .slice(0, limit);
}

export function getEmergencyRequests(limit = 12) {
  return getAllRequests()
    .filter((request) => request.urgencyLevel === "Critical" && request.status === "Active")
    .sort((first, second) => new Date(second.updatedAt || second.createdAt || 0) - new Date(first.updatedAt || first.createdAt || 0))
    .slice(0, limit);
}

export function getSmartMatchCounts(criteria) {
  const bloodGroup = normalizeText(criteria.bloodGroup || criteria.bloodGroupRequired);
  const matchedDonors = getAllDonors().filter((donor) => !bloodGroup || donor.bloodGroup === bloodGroup);
  const counts = getHierarchyCounts(matchedDonors, criteria);

  return {
    ...counts,
    donors: matchedDonors.length,
  };
}

export function countCompatibleDonors(criteria) {
  return getSmartMatchCounts(criteria).worldwide;
}

export function searchDonors({
  query = "",
  bloodGroup = "",
  country = "",
  state = "",
  district = "",
  city = "",
  sortBy = "match",
  page = 1,
  pageSize = 12,
} = {}) {
  const selection = normalizeLocationSelection({ country, state, district, city });
  const searchFields = ["fullName", "bloodGroup", "country", "state", "district", "city", "supportMessage", "sourceType", "email", "mobileNumber"];
  const filtered = filterByText(getAllDonors(), query, searchFields).filter((record) => {
    return !bloodGroup || record.bloodGroup === bloodGroup;
  });
  const ranked = filtered.map((record) => augmentDonorForSearch(record, selection));

  ranked.sort((first, second) => {
    if (sortBy === "recent") {
      return second.updatedTimestamp - first.updatedTimestamp;
    }

    if (sortBy === "availability") {
      const availabilityGap = compareAvailability(first, second);
      return availabilityGap !== 0 ? availabilityGap : compareByMatchTier(first, second);
    }

    if (sortBy === "tier") {
      const tierGap = compareByMatchTier(first, second);
      return tierGap !== 0 ? tierGap : second.updatedTimestamp - first.updatedTimestamp;
    }

    const tierGap = compareByMatchTier(first, second);
    if (tierGap !== 0) {
      return tierGap;
    }

    const availabilityGap = compareAvailability(first, second);
    if (availabilityGap !== 0) {
      return availabilityGap;
    }

    return second.updatedTimestamp - first.updatedTimestamp;
  });

  const total = ranked.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const startIndex = (safePage - 1) * pageSize;
  const results = ranked.slice(startIndex, startIndex + pageSize);

  const tierCounts = ranked.reduce(
    (accumulator, item) => {
      accumulator[item.matchTier] += 1;
      return accumulator;
    },
    { city: 0, district: 0, state: 0, country: 0, worldwide: 0 }
  );

  const sourceCounts = ranked.reduce((accumulator, item) => {
    const key = item.sourceType || "Unknown";
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  return {
    results,
    total,
    page: safePage,
    pageSize,
    pageCount,
    tierCounts,
    sourceCounts,
  };
}

export function getBloodAvailabilityOverview(selection = {}) {
  const donors = getAllDonors();
  const requests = getAllRequests();

  return BLOOD_GROUPS.map((bloodGroup) => {
    const groupDonors = donors.filter((donor) => donor.bloodGroup === bloodGroup);
    const counts = getHierarchyCounts(groupDonors, selection);
    const activeRequests = requests.filter(
      (request) => request.status === "Active" && request.bloodGroupRequired === bloodGroup
    ).length;
    const baseCounts = BLOOD_BASE_COUNTS[bloodGroup];

    return {
      bloodGroup,
      worldwideAvailability: baseCounts.worldwide + Math.round(counts.worldwide * 120),
      countryAvailability: baseCounts.country + Math.round(counts.country * 75),
      stateAvailability: baseCounts.state + Math.round(counts.state * 42),
      cityAvailability: baseCounts.city + Math.round(counts.city * 18),
      activeRequests,
    };
  });
}

export function getPlatformSnapshot() {
  const donors = getAllDonors();
  const requests = getAllRequests();
  const countries = new Set(donors.map((donor) => donor.country));

  return {
    totalDonors: donors.length,
    activeRequests: requests.filter((request) => request.status === "Active").length,
    livesSaved: 18420 + donors.length * 8 + requests.length * 3,
    bloodGroupsAvailable: BLOOD_GROUPS.length,
    countriesCovered: countries.size,
    urgentRequests: requests.filter((request) => request.urgencyLevel === "Critical").length,
  };
}

export function updateUserProfile(values, currentUser) {
  if (!currentUser) {
    throw new Error("Please login first.");
  }

  const users = readStorage(STORAGE_KEYS.users, []);
  const existingUser = findUserRecordById(currentUser.id) || {};
  const updatedRecord = {
    ...existingUser,
    name: normalizeText(values.name) || currentUser.name,
    homeCountry: normalizeText(values.homeCountry) || currentUser.homeCountry,
    homeState: normalizeText(values.homeState) || currentUser.homeState,
    homeDistrict: normalizeText(values.homeDistrict) || currentUser.homeDistrict,
    homeCity: normalizeText(values.homeCity) || currentUser.homeCity,
    phoneNumber: normalizeText(values.phoneNumber) || currentUser.phoneNumber || "",
    bio: normalizeText(values.bio) || currentUser.bio || "",
    preferenceCountry: normalizeText(values.preferenceCountry) || currentUser.preferenceCountry || "",
    preferenceState: normalizeText(values.preferenceState) || currentUser.preferenceState || "",
    preferenceDistrict: normalizeText(values.preferenceDistrict) || currentUser.preferenceDistrict || "",
    preferenceCity: normalizeText(values.preferenceCity) || currentUser.preferenceCity || "",
    updatedAt: new Date().toISOString(),
  };

  const nextUsers = users.map((record) => (record.id === currentUser.id ? { ...record, ...updatedRecord } : record));
  writeStorage(STORAGE_KEYS.users, nextUsers);

  const session = getSessionRecord();
  if (session?.userId === currentUser.id) {
    writeSessionRecord(updatedRecord);
  }

  return getSafeUser(updatedRecord, getSessionRecord()?.token || "");
}

export function registerUser(values) {
  const name = normalizeText(values.name || values.fullName);
  const email = normalizeEmail(values.email);
  const password = normalizeText(values.password);
  const role = normalizeText(values.role).toLowerCase();
  const homeCountry = normalizeText(values.country || values.homeCountry) || "India";
  const homeState = normalizeText(values.state || values.homeState) || getDefaultState(homeCountry);
  const homeDistrict = normalizeText(values.district || values.homeDistrict) || getDefaultDistrict(homeCountry, homeState);
  const homeCity = normalizeText(values.city || values.homeCity) || getDefaultCity(homeCountry, homeState, homeDistrict);

  validateRequiredFields(
    {
      name,
      email,
      password,
      role,
      homeCountry,
      homeState,
      homeDistrict,
      homeCity,
    },
    ["name", "email", "password", "role", "homeCountry", "homeState", "homeDistrict", "homeCity"]
  );

  if (!["donor", "patient"].includes(role)) {
    throw new Error("Please choose either the donor or patient role.");
  }

  const users = readStorage(STORAGE_KEYS.users, []);
  const alreadyExists = users.some((user) => user.email === email);

  if (alreadyExists) {
    throw new Error("An account with that email already exists.");
  }

  const now = new Date().toISOString();
  const nextUser = {
    id: createId("user"),
    name,
    email,
    password,
    role,
    homeCountry,
    homeState,
    homeDistrict,
    homeCity,
    phoneNumber: normalizeText(values.phoneNumber) || "",
    bio: normalizeText(values.bio) || "",
    createdAt: now,
    updatedAt: now,
  };

  writeStorage(STORAGE_KEYS.users, [...users, nextUser]);
  const session = writeSessionRecord(nextUser);
  return getSafeUser(nextUser, session.token);
}

export function loginUser(values) {
  const email = normalizeEmail(values.email);
  const password = normalizeText(values.password);
  const users = readStorage(STORAGE_KEYS.users, []);
  const match = users.find((user) => user.email === email && user.password === password);

  if (!match) {
    throw new Error("Email or password did not match.");
  }

  const session = writeSessionRecord(match);
  return getSafeUser(match, session.token);
}

export function getSessionUser() {
  const session = getSessionRecord();

  if (!session?.userId) {
    return null;
  }

  const userRecord = findUserRecordById(session.userId);

  if (!userRecord) {
    removeStorage(STORAGE_KEYS.session);
    return null;
  }

  return getSafeUser(userRecord, session.token || "");
}

export function logoutUser() {
  removeStorage(STORAGE_KEYS.session);
}

export function getUserPreferences() {
  return readStorage(STORAGE_KEYS.preferences, {});
}

export function updateUserPreferences(values) {
  const preferences = {
    ...getUserPreferences(),
    ...values,
    updatedAt: new Date().toISOString(),
  };

  writeStorage(STORAGE_KEYS.preferences, preferences);
  return preferences;
}

export function clearUserPreferences() {
  removeStorage(STORAGE_KEYS.preferences);
}

export function formatDisplayDate(value) {
  if (!value) {
    return "Not provided";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatLocation(record) {
  return getLocationHierarchy(record.country, record.state, record.district, record.city);
}

export function getLocationSuggestions(query) {
  return searchLocations(query);
}

export function getCountries() {
  return getCountriesList();
}

export function getStatesForCountry(country) {
  return getStatesForSelectedCountry(country);
}

export function getDistrictsForCountryState(country, state) {
  return getDistrictsForSelectedState(country, state);
}

export function getCitiesForCountryStateDistrict(country, state, district) {
  return getCitiesForSelectedDistrict(country, state, district);
}

export function getHomeSteps() {
  return HOME_STEPS;
}

export function getTestimonials() {
  return TESTIMONIALS;
}

export function getEmergencyBanner() {
  return EMERGENCY_BANNER;
}

export function getDashboardMenu() {
  return DASHBOARD_MENU;
}

export function getPublicNav() {
  return PUBLIC_NAV;
}

export function getWholePlatformSummary() {
  return WHOLE_PLATFORM_SUMMARY;
}

export function getAvailabilityRank(label) {
  return AVAILABILITY_RANKS[label] || 0;
}

export function getUrgencyRank(label) {
  return URGENCY_RANKS[label] || 0;
}

export function getEmergencySearchResults(criteria, options = {}) {
  return searchDonors({
    ...criteria,
    sortBy: options.sortBy || "match",
    page: options.page || 1,
    pageSize: options.pageSize || 200,
  });
}

export function getCompatibleDonorSummary(criteria) {
  return getSmartMatchCounts(criteria);
}
