import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";

import "./reserve.css";
import useFetch from "../../hooks/useFetch";
import { useContext, useState } from "react";
import { SearchContext } from "../../context/SearchContext";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Reserve = ({ setOpen, hotelId, hotelName, roomPrice }) => {
  const normalizeToUtcMidnight = (dateValue) => {
    const date = new Date(dateValue);
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  };

  const [selectedRooms, setSelectedRooms] = useState([]);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [reserveError, setReserveError] = useState("");
  const { data, loading, error } = useFetch(`/hotels/room/${hotelId}`);
  const { dates } = useContext(SearchContext);
  const { user } = useContext(AuthContext);

  const getDatesInRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const date = new Date(start.getTime());

    const dates = [];

    while (date <= end) {
      dates.push(normalizeToUtcMidnight(date));
      date.setDate(date.getDate() + 1);
    }

    return dates;
  };

  const hasValidDates = dates?.[0]?.startDate && dates?.[0]?.endDate;
  const alldates = hasValidDates
    ? getDatesInRange(dates[0].startDate, dates[0].endDate)
    : [];
  const selectedRoomCount = selectedRooms.length;
  const totalPrice = (roomPrice || 0) * selectedRoomCount * alldates.length;

  const isAvailable = (roomNumber) => {
    const isFound = roomNumber.unavailableDates.some((date) =>
      alldates.includes(normalizeToUtcMidnight(date))
    );

    return !isFound;
  };

  const handleSelect = (e) => {
    const checked = e.target.checked;
    const value = e.target.value;
    setSelectedRooms(
      checked
        ? [...selectedRooms, value]
        : selectedRooms.filter((item) => item !== value)
    );
  };

  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      setReserveError("");

      if (!user) {
        navigate("/login");
        return;
      }

      if (!hasValidDates) {
        setReserveError("Please select check-in and check-out dates before reserving.");
        return;
      }

      if (selectedRooms.length === 0) {
        setReserveError("Please select at least one room.");
        return;
      }

      setBookingInProgress(true);

      await axios.post(
        "/api/bookings",
        {
          hotelId,
          hotelName,
          roomNumberIds: selectedRooms,
          dates: alldates,
          totalPrice,
        }
      );

      setOpen(false);
      navigate("/my-bookings");
    } catch (err) {
      setReserveError(err?.response?.data?.message || "Failed to reserve room.");
    } finally {
      setBookingInProgress(false);
    }
  };
  return (
    <div className="reserve">
      <div className="rContainer">
        <FontAwesomeIcon
          icon={faCircleXmark}
          className="rClose"
          onClick={() => setOpen(false)}
        />
        <span>Select your rooms:</span>
        {loading && <div className="reserveFeedback">Loading available rooms...</div>}
        {error && !loading && (
          <div className="reserveFeedback reserveFeedbackError">
            Failed to load rooms. Please try again.
          </div>
        )}
        {!loading &&
          !error &&
          data.map((item) => (
          <div className="rItem" key={item._id}>
            <div className="rItemInfo">
              <div className="rTitle">{item.title}</div>
              <div className="rDesc">{item.desc}</div>
              <div className="rMax">
                Max people: <b>{item.maxPeople}</b>
              </div>
              <div className="rPrice">{item.price}</div>
            </div>
            <div className="rSelectRooms">
              {item.roomNumbers.map((roomNumber) => (
                <div className="room" key={roomNumber._id}>
                  <label>{roomNumber.number}</label>
                  <input
                    type="checkbox"
                    value={roomNumber._id}
                    onChange={handleSelect}
                    disabled={!isAvailable(roomNumber)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="reserveSummary">
          <span>{selectedRoomCount} room(s) selected</span>
          <span>{alldates.length} night(s)</span>
          <b>Total: ${totalPrice}</b>
        </div>

        {reserveError && <div className="reserveFeedback reserveFeedbackError">{reserveError}</div>}

        <button
          onClick={handleClick}
          className="rButton"
          disabled={bookingInProgress || loading}
        >
          {bookingInProgress ? "Reserving..." : "Reserve Now!"}
        </button>
      </div>
    </div>
  );
};

export default Reserve;
