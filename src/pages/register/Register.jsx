import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./register.css";


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
    const [data, setData] = useState([]);
    useEffect(() => {
        axios.get("https://pkgstore.datahub.io/core/world-cities/world-cities_json/data/5b3dd46ad10990bca47b04b4739a02ba/world-cities_json.json")
            .then(res => setData(res.data))
            .catch(err => console.log("Error: ", err));

    }, []);

    const { loading, error, dispatch } = useContext(AuthContext);

    const navigate = useNavigate()
    var selectedCountryCities = [];
    

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

    const countryList = [...new Set(data.map(item => item.country))];

    // console.log(countryList);
    const filterCountryOptions = (inputValue) => {
        return countryList
            .filter((country) =>
                country.toLowerCase()?.startsWith(inputValue?.toLowerCase())
            )
            .map((country) => ({
                label: country,
                value: country,
            }));
    };
    const filterCityOptions = (inputValue) => {
        const selectedCountry = credentials.country;
        selectedCountryCities = data.filter(city => city.country === selectedCountry).map(city => city.name);

        return selectedCountryCities
            .filter((city) =>
                city.toLowerCase()?.startsWith(inputValue?.toLowerCase())
            )
            .map((city) => ({
                label: city,
                value: city,
            }));
    };





    const handleClick = async (e) => {
        e.preventDefault();
        dispatch({ type: "REGISTER_START" });
        try {
            const res = await axios.post("/auth/register", credentials);
            dispatch({ type: "RESISTER_SUCCESS", payload: res.data.details });
            alert(res);
            
            navigate("/")
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
                    options={filterCountryOptions(credentials.country)}
                    placeholder="Country"
                    className="rInput"
                    required
                    noOptionsMessage={({ inputValue }) =>
                        inputValue ? "Country doesn't exist" : "Type to search"
                    }
                />

                <Select
                    value={credentials.city ? { label: credentials.city, value: credentials.city } : null}
                    onChange={(selectedOption) => handleChange(selectedOption, "city")}
                    id="city"
                    options={filterCityOptions(credentials.city)}
                    placeholder="City"
                    className="rInput"
                    required
                    noOptionsMessage={({ inputValue }) =>
                        inputValue ? "City doesn't exist" : "Type to search"
                    }
                />

                <input type="tel" pattern="[0-9]{10}" placeholder="Phone" id="phone" onChange={handleChange} className="rInput" required />
                {/*<input type="password" placeholder="password" id="password" onChange={handleChange} className="rInput"/>*/}
                <input type="password" placeholder="password" id="password" onChange={handleChange} className="rInput" required />
                <button disabled={loading} onClick={handleClick} className="rButton">
                    Register
                </button>
                {error && <span>{error.message}</span>}
            </div>
        </div>
    );
};

export default Register;

