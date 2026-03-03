import "./list.css";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import { useLocation, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { DateRange } from "react-date-range";
import SearchItem from "../../components/searchItem/SearchItem";
import useFetch from "../../hooks/useFetch";
import { SearchContext } from "../../context/SearchContext";

const defaultOptions = {
  adult: 1,
  children: 0,
  room: 1,
};

const List = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSort = searchParams.get("sort") || "recommended";
  const initialMatchRooms = searchParams.get("matchRooms") !== "false";

  const [destination, setDestination] = useState(location.state?.destination || "");
  const [dates, setDates] = useState(location.state?.dates || []);
  const [openDate, setOpenDate] = useState(false);
  const [options, setOptions] = useState(location.state?.options || defaultOptions);
  const [min, setMin] = useState(undefined);
  const [max, setMax] = useState(undefined);
  const [sortBy, setSortBy] = useState(initialSort);
  const [applyRoomCapacityFilter, setApplyRoomCapacityFilter] = useState(initialMatchRooms);

  const { data, loading, error, reFetch } = useFetch(
    `/hotels?city=${destination}&min=${min || 0}&max=${max || 999999}`
  );

  const { dispatch } = useContext(SearchContext);

  useEffect(() => {
    if (!location.state) return;

    setDestination(location.state.destination || "");
    setDates(location.state.dates || []);
    setOptions(location.state.options || defaultOptions);
  }, [location.state]);

  useEffect(() => {
    setSearchParams((prevParams) => {
      const nextParams = new URLSearchParams(prevParams);
      nextParams.set("sort", sortBy);
      nextParams.set("matchRooms", String(applyRoomCapacityFilter));
      return nextParams;
    }, { replace: true });
  }, [sortBy, applyRoomCapacityFilter, setSearchParams]);

  const handleOptionChange = (field, value, minValue = 0) => {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return;

    setOptions((prev) => ({
      ...prev,
      [field]: Math.max(minValue, numericValue),
    }));
  };
  
  const handleClick = () => {
    dispatch({
      type: "NEW_SEARCH",
      payload: { city: destination, destination, dates, options },
    });
    reFetch();
  };

  const processedHotels = useMemo(() => {
    let result = [...data];

    if (applyRoomCapacityFilter) {
      result = result.filter((hotel) => (hotel.rooms?.length || 0) >= options.room);
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => (a.cheapestPrice || 0) - (b.cheapestPrice || 0));
        break;
      case "price-desc":
        result.sort((a, b) => (b.cheapestPrice || 0) - (a.cheapestPrice || 0));
        break;
      case "rating-desc":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        result.sort((a, b) => {
          const ratingDiff = (b.rating || 0) - (a.rating || 0);
          if (ratingDiff !== 0) return ratingDiff;
          return (a.cheapestPrice || 0) - (b.cheapestPrice || 0);
        });
    }

    return result;
  }, [data, applyRoomCapacityFilter, options.room, sortBy]);

  return (
    <div>
      <Navbar />
      <Header type="list" />
      <div className="listContainer">
        <div className="listWrapper">
          <div className="listSearch">
            <h1 className="lsTitle">Search</h1>
            <div className="lsItem">
              <label>Destination</label>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Where are you going?"
                type="text"
              />
            </div>
            <div className="lsItem">
              <label>Check-in Date</label>
              <span onClick={() => setOpenDate(!openDate)}>{dates[0]?.startDate && dates[0]?.endDate
                ? `${format(dates[0].startDate, "MM/dd/yyyy")} to ${format(
                  dates[0].endDate,
                  "MM/dd/yyyy"
                )}`
                : "Select Dates"}</span>
              {openDate && (
                <DateRange
                  onChange={(item) => setDates([item.selection])}
                  minDate={new Date()}
                  ranges={dates}
                />
              )}
            </div>
            <div className="lsItem">
              <label>Options</label>
              <div className="lsOptions">
                <div className="lsOptionItem">
                  <span className="lsOptionText">
                    Min price <small>per night</small>
                  </span>
                  <input
                    type="number"
                    onChange={(e) => setMin(e.target.value)}
                    className="lsOptionInput"
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">
                    Max price <small>per night</small>
                  </span>
                  <input
                    type="number"
                    onChange={(e) => setMax(e.target.value)}
                    className="lsOptionInput"
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Adult</span>
                  <input
                    type="number"
                    min={1}
                    className="lsOptionInput"
                    value={options.adult}
                    onChange={(e) => handleOptionChange("adult", e.target.value, 1)}
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Children</span>
                  <input
                    type="number"
                    min={0}
                    className="lsOptionInput"
                    value={options.children}
                    onChange={(e) => handleOptionChange("children", e.target.value, 0)}
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Room</span>
                  <input
                    type="number"
                    min={1}
                    className="lsOptionInput"
                    value={options.room}
                    onChange={(e) => handleOptionChange("room", e.target.value, 1)}
                  />
                </div>
              </div>
            </div>
            <button onClick={handleClick}>Search</button>
          </div>
          <div className="listResult">
            <div className="listResultTop">
              <span className="listResultCount">
                {processedHotels.length} stay(s) found
              </span>
              <div className="listResultControls">
                <label className="listResultControlItem">
                  Sort
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="lsSortSelect"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating-desc">Rating: High to Low</option>
                  </select>
                </label>

                <label className="listResultControlCheck">
                  <input
                    type="checkbox"
                    checked={applyRoomCapacityFilter}
                    onChange={(e) => setApplyRoomCapacityFilter(e.target.checked)}
                  />
                  Match room count ({options.room}+)
                </label>
              </div>
            </div>

            {loading ? (
              "loading"
            ) : error ? (
              <div className="listFeedbackError">Unable to load hotels. Please try again.</div>
            ) : processedHotels.length === 0 ? (
              <div className="listFeedbackEmpty">No hotels found for current filters.</div>
            ) : (
              <>
                {processedHotels.map((item) => (
                  <SearchItem item={item} key={item._id} />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default List;
