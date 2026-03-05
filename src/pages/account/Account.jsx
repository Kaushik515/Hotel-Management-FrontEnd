import "./account.css";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { AuthContext } from "../../context/AuthContext";
import {
  getEmailValidationError,
  getPasswordChecks,
  getPasswordLabel,
  getPasswordScore,
  getPhoneValidationError,
  getPhoneValidationRules,
  isValidEmail,
  PASSWORD_POLICY_MESSAGE,
} from "../../utils/validation";

const Account = () => {
  const { user, dispatch, isAuthInitialized } = useContext(AuthContext);
  const navigate = useNavigate();

  const currentUserId = user?._id || user?.id;

  const mapUserToProfile = (data = {}) => ({
    username: data?.username || "",
    email: data?.email || "",
    country: data?.country || "",
    city: data?.city || "",
    phone: data?.phone || "",
    img: data?.img || "",
  });

  const [profile, setProfile] = useState(mapUserToProfile(user));
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthInitialized) {
      return;
    }

    if (!currentUserId) {
      navigate("/login");
      return;
    }

    setProfile((prev) => ({ ...prev, ...mapUserToProfile(user) }));

    const fetchMyProfile = async () => {
      setLoadingProfile(true);
      setError("");
      try {
        const res = await axios.get("/api/users/me");
        setProfile(mapUserToProfile(res.data));
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          dispatch({ type: "LOGOUT" });
          navigate("/login");
          return;
        }

        setError(
          err?.response?.data?.message ||
            "Could not load account details. Please try again."
        );
      }
      setLoadingProfile(false);
    };

    fetchMyProfile();
  }, [user, navigate, dispatch, isAuthInitialized, currentUserId]);

  const handleProfileChange = (e) => {
    if (e.target.id === "phone") {
      const digitsOnly = (e.target.value || "").replace(/\D/g, "");
      setProfile((prev) => ({ ...prev, phone: digitsOnly }));
      return;
    }

    setProfile((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage("");
    setError("");

    const normalizedEmail = (profile.email || "").trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      const emailError = getEmailValidationError(normalizedEmail);
      setError(emailError || "Please provide a valid email address.");
      return;
    }

    const phoneError = getPhoneValidationError(profile.phone || "", profile.country || "");
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setSavingProfile(true);
    try {
      const payload = {
        ...profile,
        email: normalizedEmail,
      };

      let res;
      try {
        res = await axios.put("/api/users/me", payload);
      } catch (err) {
        if (err?.response?.status === 403 && currentUserId) {
          res = await axios.put(`/api/users/${currentUserId}`, payload);
        } else {
          throw err;
        }
      }

      dispatch({ type: "UPDATE_USER", payload: res.data });
      setProfile(mapUserToProfile(res.data));
      setProfileMessage("Profile updated successfully.");
      setIsEditingProfile(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not update profile.");
    }
    setSavingProfile(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage("");
    setError("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setError("Current and new password are required.");
      return;
    }

    if (!meetsPasswordPolicy) {
      setError(PASSWORD_POLICY_MESSAGE);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirm password must match.");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await axios.put("/api/users/me/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordMessage(res.data?.message || "Password updated successfully.");
      setIsSecurityOpen(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not update password.");
    }
    setChangingPassword(false);
  };

  const passwordScore = getPasswordScore(passwordForm.newPassword);
  const passwordLabel = getPasswordLabel(passwordScore);
  const passwordChecks = getPasswordChecks(passwordForm.newPassword);
  const meetsPasswordPolicy = Object.values(passwordChecks).every(Boolean);

  const phoneRules = getPhoneValidationRules(profile.country);
  const phoneValidationError = getPhoneValidationError(profile.phone, profile.country);

  return (
    <div>
      <Navbar />
      <Header type="list" />
      <div className="accountContainer">
        <h1 className="accountTitle">My Account</h1>

        {!isAuthInitialized && <p>Loading account details...</p>}
        {isAuthInitialized && loadingProfile && <p>Loading account details...</p>}
        {error && <p className="accountError">{error}</p>}
        {profileMessage && <p className="accountSuccess">{profileMessage}</p>}
        {passwordMessage && <p className="accountSuccess">{passwordMessage}</p>}

        {isAuthInitialized && !loadingProfile && (
          <>
            <div className="accountCard">
              <div className="accountCardHeader">
                <h2>Profile Details</h2>
                {!isEditingProfile ? (
                  <button
                    type="button"
                    className="accountSecondaryButton"
                    onClick={() => {
                      setError("");
                      setProfileMessage("");
                      setIsEditingProfile(true);
                    }}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button
                    type="button"
                    className="accountSecondaryButton"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setError("");
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>

              {!isEditingProfile ? (
                <div className="accountSummaryGrid">
                  <div className="accountSummaryItem">
                    <span>Username</span>
                    <b>{profile.username || "-"}</b>
                  </div>
                  <div className="accountSummaryItem">
                    <span>Email</span>
                    <b>{profile.email || "-"}</b>
                  </div>
                  <div className="accountSummaryItem">
                    <span>Country</span>
                    <b>{profile.country || "-"}</b>
                  </div>
                  <div className="accountSummaryItem">
                    <span>City</span>
                    <b>{profile.city || "-"}</b>
                  </div>
                  <div className="accountSummaryItem">
                    <span>Phone</span>
                    <b>{profile.phone || "-"}</b>
                  </div>
                  <div className="accountSummaryItem">
                    <span>Profile Image</span>
                    <b>{profile.img || "Not set"}</b>
                  </div>
                </div>
              ) : (
                <form className="accountEditForm" onSubmit={handleProfileSubmit}>
                  <input
                    id="username"
                    value={profile.username}
                    onChange={handleProfileChange}
                    placeholder="Username"
                    required
                  />
                  <input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    placeholder="Email"
                    required
                  />
                  <input
                    id="country"
                    value={profile.country}
                    onChange={handleProfileChange}
                    placeholder="Country"
                    required
                  />
                  <input
                    id="city"
                    value={profile.city}
                    onChange={handleProfileChange}
                    placeholder="City"
                    required
                  />
                  <input
                    id="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    placeholder="Phone (digits only)"
                    inputMode="numeric"
                    required
                  />
                  {isEditingProfile && profile.country && phoneRules && (
                    <div className="accountPhoneHint">
                      <small>Format: {phoneRules.format} (country code {phoneRules.code} is auto-handled)</small>
                    </div>
                  )}
                  {isEditingProfile && profile.phone && phoneValidationError && (
                    <small className="accountPhoneError">{phoneValidationError}</small>
                  )}
                  <input
                    id="img"
                    value={profile.img}
                    onChange={handleProfileChange}
                    placeholder="Profile image URL (optional)"
                  />
                  <button type="submit" disabled={savingProfile}>
                    {savingProfile ? "Saving..." : "Save Profile"}
                  </button>
                </form>
              )}
            </div>

            <div className="accountCard">
              <div className="accountCardHeader">
                <h2>Security Center</h2>
                <button
                  type="button"
                  className="accountSecondaryButton"
                  onClick={() => {
                    setError("");
                    setPasswordMessage("");
                    setIsSecurityOpen((prev) => !prev);
                  }}
                >
                  {isSecurityOpen ? "Close" : "Change Password"}
                </button>
              </div>

              {!isSecurityOpen ? (
                <p className="accountSecurityHint">
                  Keep your account protected by updating your password regularly.
                </p>
              ) : (
                <form className="accountEditForm" onSubmit={handlePasswordSubmit}>
                  <div className="accountPasswordWrap">
                    <input
                      id="currentPassword"
                      type={showPassword.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Current password"
                      required
                    />
                    <button
                      type="button"
                      className="accountPasswordToggle"
                      onClick={() =>
                        setShowPassword((prev) => ({
                          ...prev,
                          current: !prev.current,
                        }))
                      }
                    >
                      {showPassword.current ? "Hide" : "Show"}
                    </button>
                  </div>

                  <div className="accountPasswordWrap">
                    <input
                      id="newPassword"
                      type={showPassword.next ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="New password"
                      required
                    />
                    <button
                      type="button"
                      className="accountPasswordToggle"
                      onClick={() =>
                        setShowPassword((prev) => ({
                          ...prev,
                          next: !prev.next,
                        }))
                      }
                    >
                      {showPassword.next ? "Hide" : "Show"}
                    </button>
                  </div>

                  <div className="passwordStrengthWrap">
                    <div className="passwordStrengthBar">
                      <span
                        className={`passwordStrengthFill score${passwordScore}`}
                      ></span>
                    </div>
                    <small>Password strength: {passwordLabel}</small>
                    <ul className="accountPasswordCriteria">
                      <li className={passwordChecks.minLength ? "valid" : "invalid"}>
                        At least 8 characters
                      </li>
                      <li className={passwordChecks.uppercase ? "valid" : "invalid"}>
                        One uppercase letter (A-Z)
                      </li>
                      <li className={passwordChecks.lowercase ? "valid" : "invalid"}>
                        One lowercase letter (a-z)
                      </li>
                      <li className={passwordChecks.number ? "valid" : "invalid"}>
                        One number (0-9)
                      </li>
                      <li className={passwordChecks.special ? "valid" : "invalid"}>
                        One special character (e.g. !@#$)
                      </li>
                    </ul>
                  </div>

                  <div className="accountPasswordWrap">
                    <input
                      id="confirmPassword"
                      type={showPassword.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      className="accountPasswordToggle"
                      onClick={() =>
                        setShowPassword((prev) => ({
                          ...prev,
                          confirm: !prev.confirm,
                        }))
                      }
                    >
                      {showPassword.confirm ? "Hide" : "Show"}
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={changingPassword || !meetsPasswordPolicy}
                  >
                    {changingPassword ? "Updating..." : "Update Password"}
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Account;
