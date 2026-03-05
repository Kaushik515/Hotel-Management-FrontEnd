import axios from "axios";
import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./register.css";
import { getNames as getCountryNames } from "country-list";
import {
        getEmailValidationError,
        getPasswordChecks,
        getPhoneValidationError,
        getPhoneValidationRules,
        isValidEmail,
        PASSWORD_POLICY_MESSAGE,
} from "../../utils/validation";

import Select from "react-select";


const Register = () => {
    const [credentials, setCredentials] = useState({
        username: "",
        email: "",
        country: "",
        city: "",
        phone: "",
        isAdmin: false,
        password: "",
    });
    const [cityData, setCityData] = useState([]);
    const [citiesLoading, setCitiesLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState({
        loading: false,
        checked: false,
        available: false,
        message: "",
    });

    useEffect(() => {
        const fetchCities = async () => {
            setCitiesLoading(true);
            try {
                const res = await fetch(
                    "https://pkgstore.datahub.io/core/world-cities/world-cities_json/data/5b3dd46ad10990bca47b04b4739a02ba/world-cities_json.json",
                    {
                        credentials: "omit",
                    }
                );

                if (!res.ok) {
                    throw new Error("Failed to load city data.");
                }

                const cities = await res.json();
                setCityData(cities || []);
            } catch (err) {
                console.log("Error loading city data: ", err);
                setCityData([]);
            }
            setCitiesLoading(false);
        };

        fetchCities();
    }, []);

    useEffect(() => {
        const username = (credentials.username || "").trim();

        if (!username) {
            setUsernameStatus({
                loading: false,
                checked: false,
                available: false,
                message: "",
            });
            return;
        }

        setUsernameStatus((prev) => ({
            ...prev,
            loading: true,
            checked: false,
            message: "Checking username...",
        }));

        const timer = setTimeout(async () => {
            try {
                const res = await axios.get("/api/auth/check-username", {
                    params: { username },
                });

                setUsernameStatus({
                    loading: false,
                    checked: true,
                    available: !!res.data?.available,
                    message: res.data?.message || "",
                });
            } catch (err) {
                setUsernameStatus({
                    loading: false,
                    checked: false,
                    available: false,
                    message: err?.response?.data?.message || "Unable to verify username right now.",
                });
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [credentials.username]);

    const { loading, error, dispatch } = useContext(AuthContext);

    const navigate = useNavigate()
    

    const handleChange = (e, field) => {
        if (field === "country") {
            
            setCredentials((prev) => ({
                ...prev,
                country: e ? e.value : "",
                city: ""
            }));
        } else if (field === "city") {
            setCredentials((prev) => ({
                ...prev,
                city: e ? e.value : "",
            }));
        }
        else {
            const { id, value } = e.target;
            if (id === "phone") {
                const digitsOnly = value.replace(/\D/g, "");
                setCredentials((prev) => ({ ...prev, [id]: digitsOnly }));
                return;
            }
            setCredentials((prev) => ({ ...prev, [id]: value }));
        }


    };

    const countryOptions = useMemo(() => {
        const countries = [...new Set(getCountryNames().map((country) => (country || "").trim()))]
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));

        return countries.map((country) => ({
            label: country,
            value: country,
        }));
    }, []);

    const cityOptions = useMemo(() => {
        if (!credentials.country) return [];

        const selectedCountry = credentials.country.trim().toLowerCase();
        const cities = [...new Set(
            cityData
                .filter((item) => (item.country || "").trim().toLowerCase() === selectedCountry)
                .map((item) => (item.name || "").trim())
        )]
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));

        const visibleCities = cities.slice(0, 2000);

        return visibleCities.map((city) => ({
            label: city,
            value: city,
        }));
    }, [cityData, credentials.country]);

    const filterByLabel = (option, inputValue) => {
        if (!inputValue) return true;
        return option.label.toLowerCase().includes(inputValue.toLowerCase());
    };

    const passwordChecks = getPasswordChecks(credentials.password);
    const meetsPasswordPolicy = Object.values(passwordChecks).every(Boolean);

    const phoneRules = getPhoneValidationRules(credentials.country);
    const phoneError = getPhoneValidationError(credentials.phone, credentials.country);
    const emailError = getEmailValidationError(credentials.email);

    const handleClick = async (e) => {
        e.preventDefault();
        setFormError("");

        const normalizedUsername = (credentials.username || "").trim();
        const normalizedEmail = (credentials.email || "").trim().toLowerCase();

        if (!normalizedUsername) {
            setFormError("Username is required.");
            return;
        }

        if (usernameStatus.checked && !usernameStatus.available) {
            setFormError("Username is already taken. Please choose another one.");
            return;
        }

        if (!credentials.country || !credentials.city) {
            setFormError("Please select both country and city.");
            return;
        }

        if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
            const emailError = getEmailValidationError(normalizedEmail);
            setFormError(emailError || "Please enter a valid email address.");
            return;
        }

        const phoneError = getPhoneValidationError(credentials.phone || "", credentials.country);
        if (phoneError) {
            setFormError(phoneError);
            return;
        }

        if (!meetsPasswordPolicy) {
            setFormError(PASSWORD_POLICY_MESSAGE);
            return;
        }

        dispatch({ type: "REGISTER_START" });
        try {
            const res = await axios.post("/api/auth/register", {
                ...credentials,
                username: normalizedUsername,
                email: normalizedEmail,
            });
            dispatch({ type: "REGISTER_SUCCESS", payload: null });

            const successMessage =
                typeof res.data === "string"
                    ? res.data
                    : "Registration successful. Please login.";
            alert(successMessage);

            navigate("/login")
        } catch (err) {
            const backendError = err?.response?.data || {
                message: "Unable to register right now. Please try again.",
            };
            dispatch({ type: "REGISTER_FAILURE", payload: backendError });
            console.log("ERROR: ", err);
        }
    };


    return (
        <div className="register">
            <div className="rContainer">

                <input type="text" placeholder="Username" id="username" onChange={handleChange} className="rInput" required />
                {credentials.username && usernameStatus.message && (
                    <small className={usernameStatus.available ? "rSuccess" : "rInfo"}>
                        {usernameStatus.message}
                    </small>
                )}
                <input type="email" placeholder="Email" id="email" onChange={handleChange} className="rInput" required />
                {credentials.email && emailError && (
                    <small className="rError">{emailError}</small>
                )}
                <Select
                    value={credentials.country ? { label: credentials.country, value: credentials.country } : null}
                    onChange={(selectedOption) => handleChange(selectedOption, "country")}
                    id="country"
                    options={countryOptions}
                    filterOption={filterByLabel}
                    placeholder="Country"
                    className="rInput"
                    isClearable
                    isSearchable
                    noOptionsMessage={({ inputValue }) =>
                        inputValue ? "Country doesn't exist" : "Type to search"
                    }
                />

                <Select
                    value={credentials.city ? { label: credentials.city, value: credentials.city } : null}
                    onChange={(selectedOption) => handleChange(selectedOption, "city")}
                    id="city"
                    options={cityOptions}
                    filterOption={filterByLabel}
                    placeholder="City"
                    className="rInput"
                    isClearable
                    isSearchable
                    isLoading={citiesLoading}
                    isDisabled={!credentials.country}
                    noOptionsMessage={({ inputValue }) =>
                        !credentials.country
                            ? "Select country first"
                            : inputValue
                                ? "City doesn't exist"
                                : "Type to search"
                    }
                />

                <input
                    type="tel"
                    placeholder="Phone (digits only)"
                    id="phone"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onChange={handleChange}
                    className="rInput"
                    required
                />
                {credentials.country && phoneRules && (
                    <div className="rPhoneHint">
                        <small>Format: {phoneRules.format} (country code {phoneRules.code} is auto-handled)</small>
                    </div>
                )}
                {credentials.phone && phoneError && (
                    <small className="rError">{phoneError}</small>
                )}
                {/*<input type="password" placeholder="password" id="password" onChange={handleChange} className="rInput"/>*/}
                <div className="rPasswordWrap">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="password"
                        id="password"
                        onChange={handleChange}
                        className="rInput"
                        required
                    />
                    <button
                        type="button"
                        className="rPasswordToggle"
                        onClick={() => setShowPassword((prev) => !prev)}
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>
                <ul className="rPasswordCriteria">
                    <li className={passwordChecks.minLength ? "valid" : "invalid"}>At least 8 characters</li>
                    <li className={passwordChecks.uppercase ? "valid" : "invalid"}>One uppercase letter (A-Z)</li>
                    <li className={passwordChecks.lowercase ? "valid" : "invalid"}>One lowercase letter (a-z)</li>
                    <li className={passwordChecks.number ? "valid" : "invalid"}>One number (0-9)</li>
                    <li className={passwordChecks.special ? "valid" : "invalid"}>One special character (e.g. !@#$)</li>
                </ul>
                <button disabled={loading} onClick={handleClick} className="rButton">
                    Register
                </button>
                {formError && <span className="rError">{formError}</span>}
                {error && <span className="rError">{error.message || "Registration failed."}</span>}
            </div>
        </div>
    );
};

export default Register;

