import axios from "axios";
import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./register.css";
import { getNames as getCountryNames } from "country-list";


import Select from "react-select";

const isValidEmail = (email = "") => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
};


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





    const handleClick = async (e) => {
        e.preventDefault();
        setFormError("");

        const normalizedEmail = (credentials.email || "").trim().toLowerCase();

        if (!credentials.country || !credentials.city) {
            setFormError("Please select both country and city.");
            return;
        }

        if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
            setFormError("Please enter a valid email address.");
            return;
        }

        dispatch({ type: "REGISTER_START" });
        try {
            const res = await axios.post("/api/auth/register", {
                ...credentials,
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
            dispatch({ type: "REGISTER_FAILURE", payload: err.response.data });
            console.log("ERROR: ", err);
        }
    };


    return (
        <div className="register">
            <div className="rContainer">

                <input type="text" placeholder="Username" id="username" onChange={handleChange} className="rInput" required />
                <input type="email" placeholder="Email" id="email" onChange={handleChange} className="rInput" required />
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

                <input type="tel" pattern="[0-9]{10}" placeholder="Phone" id="phone" onChange={handleChange} className="rInput" required />
                {/*<input type="password" placeholder="password" id="password" onChange={handleChange} className="rInput"/>*/}
                <input type="password" placeholder="password" id="password" onChange={handleChange} className="rInput" required />
                <button disabled={loading} onClick={handleClick} className="rButton">
                    Register
                </button>
                {formError && <span className="rError">{formError}</span>}
                {error && <span className="rError">{error.message}</span>}
            </div>
        </div>
    );
};

export default Register;

