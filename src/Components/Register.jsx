import React, { useState, useEffect, useRef } from "react";
// import bcrypt from "bcryptjs";
import "./Register.css";
import extraImg1 from "../assets/logo-zanzibar.png";
import extraImg2 from "../assets/zafiri.png";
import { API_BASE } from "../config";

const departments = [
  "Administration and Human Resources",
   "Finance and Marketing",
  "ICT",
  "Labaratory and Experiment",
  "Research and Analysis",
  "Other",
];

const securityQuestions = [
  "What is your mother's last name?",
  "What is your hobby?",
  "Which city were you born in?",
];

export default function Register({ userToEdit = null, onBackToLogin }) {
  const popupRef = useRef(null);
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    secondName: "",
    lastName: "",
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    gender: "",
    department: "",
    employeeNo: "",
    position: "",
    email: "",
    countryCode: "+255",
    phone: "",
    password: "",
    confirmPassword: "",
    securityQuestion: "",
    securityAnswer: "",
    passport: null,
    terms: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
		if (userToEdit) {
			setForm({
				username: userToEdit.username || "",
				firstName: userToEdit.first_name || userToEdit.firstName || "",
				secondName: userToEdit.second_name || userToEdit.secondName || "",
				lastName: userToEdit.last_name || userToEdit.lastName || "",
				email: userToEdit.email || "",
				department: userToEdit.department || "",
				position: userToEdit.position || "",
				employeeNo: userToEdit.employeeNo || "",
				phone: userToEdit.phone || "",
				gender: userToEdit.gender === 'M' ? 'Male' : 'Female',
				dobDay: userToEdit.dateOfBirth ? userToEdit.dateOfBirth.split('-')[2] : "",
				dobMonth: userToEdit.dateOfBirth ? userToEdit.dateOfBirth.split('-')[1] : "",
				dobYear: userToEdit.dateOfBirth ? userToEdit.dateOfBirth.split('-')[0] : "",
				password: "", // do not prefill password
			});
		} else {
			// clear for new
			setForm((f) => ({ ...f, password: "" }));
		}
	}, [userToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else if (type === "file") {
      setForm({ ...form, [name]: files[0] });
    } else if (name === "countryCode") {
      setForm({ ...form, countryCode: value, phone: value });
    } else if (name === "phone") {
      // Ensure phone always starts with country code
      let phoneValue = value;
      if (!phoneValue.startsWith(form.countryCode)) {
        phoneValue = form.countryCode + phoneValue.replace(/^\+?\d+/, "");
      }
      setForm({ ...form, phone: phoneValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.username) newErrors.username = "Username is required";
    if (!form.firstName) newErrors.firstName = "First name is required";
    if (!form.secondName) newErrors.secondName = "Second name is required";
    if (!form.lastName) newErrors.lastName = "Last name is required";
     const day = parseInt(form.dobDay, 10);
  const month = parseInt(form.dobMonth, 10);
  const year = parseInt(form.dobYear, 10);
  if (!form.dobDay || !form.dobMonth || !form.dobYear) {
    newErrors.dob = "Date of birth is required";
  } else {
    if (isNaN(day) || day < 1 || day > 31) newErrors.dob = "Day must be between 1 and 31";
    else if (isNaN(month) || month < 1 || month > 12) newErrors.dob = "Month must be between 1 and 12";
    else if (isNaN(year) || year < 1900 || year > 2090) newErrors.dob = "Year must be between 1900 and 2090";
  }
    if (!form.gender) newErrors.gender = "Gender is required";
    if (!form.department) newErrors.department = "Department is required";
    if (!form.position) newErrors.position = "Job position is required";
    if (!form.employeeNo) newErrors.employeeNo = "Employee number is required";
    if (!form.email || !form.email.toLowerCase().endsWith("@zafiri.go.tz")) newErrors.email = "Valid company email is required (@zafiri.go.tz)";
    if (!form.phone || form.phone.length < 7) newErrors.phone = "Phone is required";
    if (!form.password) newErrors.password = "Password is required";
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(form.password)) newErrors.password = "Password must be 8+ chars, include upper, lower, number, symbol";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!form.securityQuestion) newErrors.securityQuestion = "Security question required";
    if (!form.securityAnswer) newErrors.securityAnswer = "Security answer required";
    if (!form.terms) newErrors.terms = "You must accept terms and conditions";
    if (!form.confirm) newErrors.confirm = "You must confirm information is correct";
    return newErrors;
  };
  // Helper to read csrftoken cookie (in case backend enforces CSRF later)
  const _getCookie = (name) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      
      try {
        let res;
        if (userToEdit && (userToEdit.id || userToEdit.pk || userToEdit.username)) {
          // update user (PATCH)
          const id = userToEdit.id || userToEdit.pk || userToEdit.username;
          res = await fetch(`${API_BASE}/api/users/${id}/`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: form.username,
              first_name: form.firstName,
              second_name: form.secondName,
              last_name: form.lastName,
              email: form.email,
              department: form.department,
              position: form.position,
              phone: form.phone,
              gender: form.gender ? form.gender.charAt(0) : '', // 'M' or 'F'
              dateOfBirth: `${form.dobYear}-${String(form.dobMonth).padStart(2, '0')}-${String(form.dobDay).padStart(2, '0')}`,
              securityQuestion: form.securityQuestion,
              securityAnswer: form.securityAnswer,
              employeeNo: form.employeeNo,
              // only send password if set
              ...(form.password ? { password: form.password } : {}),
            }),
          });
        } else {
          // create new user - remove credentials: "include" since CSRF is disabled
          res = await fetch(`${API_BASE}/api/create-user/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }, // Removed credentials: "include"
            body: JSON.stringify({
              username: form.username,
              firstName: form.firstName,
              secondName: form.secondName,
              lastName: form.lastName,
              email: form.email,
              department: form.department,
              position: form.position,
              phone: form.phone,
              gender: form.gender,
              dateOfBirth: `${form.dobYear}-${String(form.dobMonth).padStart(2, '0')}-${String(form.dobDay).padStart(2, '0')}`,
              securityQuestion: form.securityQuestion,
              securityAnswer: form.securityAnswer,
              employeeNo: form.employeeNo,
              password: form.password,
            }),
          });
        }

        const text = await res.text();
        let data;
        try { data = text ? JSON.parse(text) : {}; } catch { data = { detail: text }; }

        if (!res.ok) throw new Error(data?.detail || data?.error || `Server error (${res.status})`);

        setSuccessMessage('Registration successful!');
        setShowPopup(true);
        
        // Auto-close popup and navigate back after 2 seconds
        setTimeout(() => {
          setShowPopup(false);
          if (onBackToLogin) onBackToLogin();
        }, 2000);

      } catch (err) {
        console.error('Registration network error:', err);
        setErrorMessage(err.message || 'Network error. Please check your connection and try again.');
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 6000);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="register-container">
      {/* Back button with same size as UserStats */}
      <button
        type="button"
        style={{ 
          position: "fixed",
          top: "20px",
          right: "20px",
          background: "#3b82f6", 
          color: "white",
          padding: "0.75rem 1.5rem",
          borderRadius: "8px",
          border: "none",
          fontSize: "0.95rem",
          fontWeight: "500",
          cursor: "pointer",
          zIndex: 1000,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          transition: "all 0.2s ease"
        }}
        onClick={onBackToLogin}
        onMouseEnter={(e) => {
          e.target.style.background = "#2563eb";
          e.target.style.transform = "scale(1.02)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "#3b82f6";
          e.target.style.transform = "scale(1)";
        }}
      >
        ← Back
      </button>

      <div className="register-card">
        <div className="register-title-row">
          <h2 className="register-title">REGISTRATION FORM</h2>
          <div className="register-title-images">
            <img src={extraImg1} alt="logo-zanzibar.png" />
            <img src={extraImg2} alt="zafri.png" />
          </div>
        </div>
        <p className="register-subtitle">Zanzabar Fisheries And Marine Research Institute.</p>
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
            
              <label className="form-label">  First Name <span style={{ color: "red" }}>*</span></label>
              <input
                className={`form-input ${errors.firstName ? "error" : ""}`}
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
              />
              {errors.firstName && <div className="error-message">{errors.firstName}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Second Name <span style={{ color: "red" }}>*</span></label>
              <input
                className={`form-input ${errors.secondName ? "error" : ""}`}
                name="secondName"
                value={form.secondName}
                onChange={handleChange}
                placeholder="Enter your second name"
              />
              {errors.secondName && <div className="error-message">{errors.secondName}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Last Name <span style={{ color: "red" }}>*</span></label>
              <input
                className={`form-input ${errors.lastName ? "error" : ""}`}
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
              />
              {errors.lastName && <div className="error-message">{errors.lastName}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">  Date of Birth <span style={{ color: "red" }}>*</span></label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className={`form-input ${errors.dob ? "error" : ""}`}
                name="dobDay"
                value={form.dobDay}
                onChange={handleChange}
                placeholder="dd"
                maxLength={2}
                style={{ width: 60 }}
              />
              <input
                className={`form-input ${errors.dob ? "error" : ""}`}
                name="dobMonth"
                value={form.dobMonth}
                onChange={handleChange}
                placeholder="mm"
                maxLength={2}
                style={{ width: 60 }}
              />
              <input
                className={`form-input ${errors.dob ? "error" : ""}`}
                name="dobYear"
                value={form.dobYear}
                onChange={handleChange}
                placeholder="yyyy"
                maxLength={4}
                style={{ width: 80 }}
              />
            </div>
            {errors.dob && <div className="error-message">{errors.dob}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Gender</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={form.gender === "Male"}
                  onChange={handleChange}
                />
                Male
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={form.gender === "Female"}
                  onChange={handleChange}
                />
                Female
              </label>
            </div>
            {errors.gender && <div className="error-message">{errors.gender}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">  Department <span style={{ color: "red" }}>*</span></label>
            <select
              className={`form-input ${errors.department ? "error" : ""}`}
              name="department"
              value={form.department}
              onChange={handleChange}
            >
              <option value="">Select</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {errors.department && <div className="error-message">{errors.department}</div>}
          </div>

          <div className="form-group">
            <label className="form-label"> Job Position <span style={{ color: "red" }}>*</span></label>
              <input
                className={`form-input ${errors.position ? "error" : ""}`}
                name="position"
                value={form.position}
                onChange={handleChange}
                placeholder="e.g. Researcher,lab scientist, etc."
              />
            {errors.position && <div className="error-message">{errors.position}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">  Employee Number <span style={{ color: "red" }}>*</span></label>
              <input
                className={`form-input ${errors.employeeNo ? "error" : ""}`}
                name="employeeNo"
                value={form.employeeNo}
                onChange={handleChange}
                placeholder="Enter employee number"
              />
            {errors.employeeNo && <div className="error-message">{errors.employeeNo}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">  Email Address <span style={{ color: "red" }}>*</span></label>
              <input
                className={`form-input ${errors.email ? "error" : ""}`}
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g.name@Zafiri.go.tz"
              />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <select
                className="form-input"
                name="countryCode"
                value={form.countryCode}
                onChange={handleChange}
                style={{ width: 100 }}
              >{/* List of country codes */}
                <option value="+355">Albania (+355)</option>
                <option value="+213">Algeria (+213)</option>
                <option value="+376">Andorra (+376)</option>
                <option value="+244">Angola (+244)</option>
                <option value="+54">Argentina (+54)</option>
                <option value="+374">Armenia (+374)</option>
                <option value="+61">Australia (+61)</option>
                <option value="+43">Austria (+43)</option>
                <option value="+994">Azerbaijan (+994)</option>
                <option value="+973">Bahrain (+973)</option>
                <option value="+880">Bangladesh (+880)</option>
                <option value="+1">Barbados (+1)</option>
                <option value="+32">Belgium (+32)</option>
                <option value="+501">Belize (+501)</option>
                <option value="+229">Benin (+229)</option>
                <option value="+975">Bhutan (+975)</option>
                <option value="+591">Bolivia (+591)</option>
                <option value="+387">Bosnia and Herzegovina (+387)</option>
                <option value="+267">Botswana (+267)</option>
                <option value="+55">Brazil (+55)</option>
                <option value="+673">Brunei (+673)</option>
                <option value="+359">Bulgaria (+359)</option>
                <option value="+226">Burkina Faso (+226)</option>
                <option value="+257">Burundi (+257)</option>
                <option value="+855">Cambodia (+855)</option>
                <option value="+237">Cameroon (+237)</option>
                <option value="+1">Canada (+1)</option>
                <option value="+238">Cape Verde (+238)</option>
                <option value="+236">Central African Republic (+236)</option>
                <option value="+235">Chad (+235)</option>
                <option value="+56">Chile (+56)</option>
                <option value="+86">China (+86)</option>
                <option value="+57">Colombia (+57)</option>
                <option value="+269">Comoros (+269)</option>
                <option value="+242">Congo (+242)</option>
                <option value="+243">Congo, Democratic Republic (+243)</option>
                <option value="+682">Cook Islands (+682)</option>
                <option value="+506">Costa Rica (+506)</option>
                <option value="+225">Côte d'Ivoire (+225)</option>
                <option value="+385">Croatia (+385)</option>
                <option value="+53">Cuba (+53)</option>
                <option value="+357">Cyprus (+357)</option>
                <option value="+420">Czech Republic (+420)</option>
                <option value="+45">Denmark (+45)</option>
                <option value="+253">Djibouti (+253)</option>
                <option value="+1">Dominica (+1)</option>
                <option value="+1">Dominican Republic (+1)</option>
                <option value="+593">E  First Name <span style={{ color: "red" }}>*</span>cuador (+593)</option>
                <option value="+20">Egypt (+20)</option>
                <option value="+503">El Salvador (+503)</option>
                <option value="+240">Equatorial Guinea (+240)</option>
                <option value="+291">Eritrea (+291)</option>
                <option value="+372">Estonia (+372)</option>
                <option value="+251">Ethiopia (+251)</option>
                <option value="+232">Sierra Leone (+232)</option>
              <option  value="+500">Falkland Islands (+500)</option>
                <option value="+298">Faroe Islands (+298)</option>
                <option value="+679">Fiji (+679)</option>
                <option value="+358">Finland (+358)</option>
                <option value="+33">France (+33)</option>
                <option value="+594">French Guiana (+594)</option>
                <option value="+689">French Polynesia (+689)</option>
                <option value="+241">Gabon (+241)</option>
                <option value="+220">Gambia (+220)</option>
                <option value="+995">Georgia (+995)</option>
                <option value="+49">Germany (+49)</option>
                <option value="+233">Ghana (+233)</option>
                <option value="+350">Gibraltar (+350)</option>
                <option value="+30">Greece (+30)</option>
                <option value="+299">Greenland (+299)</option>
                <option value="+1">Grenada (+1)</option>
                <option value="+590">Guadeloupe (+590)</option>
                <option value="+1">Guam (+1)</option>
                <option value="+502">G  First Name <span style={{ color: "red" }}>*</span>uatemala (+502)</option>
                <option value="+224">Guinea (+224)</option>
                <option value="+245">Guinea-Bissau (+245)</option>
                <option value="+592">Guyana (+592)</option>
                <option value="+509">Haiti (+509)</option>
                <option value="+504">Honduras (+504)</option>
                <option value="+852">Hong Kong (+852)</option>
                <option value="+36">Hungary (+36)</option>
                <option value="+354">Iceland (+354)</option>
                <option value="+91">India (+91)</option>
                <option value="+62">Indonesia (+62)</option>
                <option value="+98">Iran (+98)</option>
                <option value="+964">Iraq (+964)</option>
                <option value="+353">Ireland (+353)</option>
                <option value="+972">Israel (+972)</option>
                <option value="+39">Italy (+39)</option>
                <option value="+1">Jamaica (+1)</option>
                <option value="+81">Japan (+81)</option>
                <option value="+962">Jordan (+962)</option>
                <option value="+7">Kazakhstan (+7)</option>
                <option value="+254">Kenya (+254)</option>
                <option value="+686">Kiribati (+686)</option>
                <option value="+383">Kosovo (+383)</option>
                <option value="+965">Kuwait (+965)</option>
                <option value="+996">Kyrgyzstan (+996)</option>
                <option value="+856">Laos (+856)</option>
                <option value="+371">Latvia (+371)</option>
                <option value="+961">Lebanon (+961)</option>
                <option value="+266">Lesotho (+266)</option>
                <option value="+231">Liberia (+231)</option>
                <option value="+218">Libya (+218)</option>
                <option value="+423">Liechtenstein (+423)</option>
                <option value="+370">Lithuania (+370)</option>
                <option value="+352">Luxembourg (+352)</option>
                <option value="+853">Macau (+853)</option>
                <option value="+389">Macedonia (+389)</option>
                <option value="+261">Madagascar (+261)</option>
                <option value="+265">Malawi (+265)</option>
                <option value="+60">Malaysia (+60)</option>
                <option value="+960">Maldives (+960)</option>
                <option value="+223">Mali (+223)</option>
                <option value="+356">Malta (+356)</option>
                <option value="+692">Marshall Islands (+692)</option>
                <option value="+596">Martinique (+596)</option>
                <option value="+222">Mauritania (+222)</option>
                <option value="+230">Mauritius (+230)</option>
                <option value="+262">Mayotte (+262)</option>
                <option value="+52">Mexico (+52)</option>
                <option value="+691">Micronesia (+691)</option>
                <option value="+373">Moldova (+373)</option>
                <option value="+377">Monaco (+377)</option>
                <option value="+976">Mongolia (+976)</option>
                <option value="+382">Montenegro (+382)</option>
                <option value="+212">M  First Name <span style={{ color: "red" }}>*</span>orocco (+212)</option>
                <option value="+258">Mozambique (+258)</option>
                <option value="+95">Myanmar (+95)</option>
                <option value="+264">Namibia (+264)</option>
                <option value="+674">Nauru (+674)</option>
                <option value="+977">Nepal (+977)</option>
                <option value="+31">Netherlands (+31)</option>
                <option value="+687">New Caledonia (+687)</option>
                <option value="+64">New Zealand (+64)</option>
                <option value="+234">Nigeria (+234)</option>
                <option value="+672">Norfolk Island (+672)</option>
                <option value="+850">North Korea (+850)</option>
                <option value="+1">Northern Mariana Islands (+1)</option>
                <option value="+47">Norway (+47)</option>
                <option value="+968">Oman (+968)</option>
                <option value="+92">Pakistan (+92)</option>
                <option value="+680">Palau (+680)</option>
                <option value="+970">Palestine (+970)</option>
              <option value="+507">Panama (+507)</option>
              <option value="+675">Papua New Guinea (+675)</option>
              <option value="+595">Paraguay (+595)</option>
              <option value="+974">Qatar (+974)</option>
              <option value="+262">Reunion (+262)</option>
              <option value="+40">Romania (+40)</option>
              <option value="+7">Russia (+7)</option>
              <option value="+250">Rwanda (+250)</option>
              <option value="+677">Solomon Islands (+677)</option>
              <option value="+248">Seychelles (+248)</option>
              <option value="+232">Sierra Leone (+232)</option>
              <option value="+65">Singapore (+65)</option>
              <option value="+421">Slovakia (+421)</option>
              <option value="+386">Slovenia (+386)</option>
              <option value="+677">Solomon Islands (+677)</option>
              <option value="+252">Somalia (+252)</option>
              <option value="+27">South Africa (+27)</option>
              <option value="+82">South Korea (+82)</option>
              <option value="+211">South Sudan (+211)</option>
              <option value="+34">Spain (+34)</option>
              <option value="+94">Sri Lanka (+94)</option>
              <option value="+249">Sudan (+249)</option>
              <option value="+597">Suriname (+597)</option>
              <option value="+268">Swaziland (+268)</option>
              <option value="+46">Sweden (+46)</option>
              <option value="+41">Switzerland (+41)</option>
              <option value="+963">Syria (+963)</option>
              <option value="+886">Taiwan (+886)</option>
              <option value="+992">Tajikistan (+992)</option>
              <option value="+255">Tanzania (+255)</option>
              <option value="+66">Thailand (+66)</option>
              <option value="+670">Timor-Leste (+670)</option>
              <option value="+228">Togo (+228)</option>
              <option value="+690">Tokelau (+690)</option>
              <option value="+676">Tonga (+676)</option>
              <option value="+1">Trinidad and Tobago (+1)</option>
              <option value="+216">Tunisia (+216)</option>
              <option value="+90">Turkey (+90)</option>
              <option value="+993">Turkmenistan (+993)</option>
              <option value="+1">Turks and Caicos Islands (+1)</option>
              <option value="+688">Tuvalu (+688)</option>
              <option value="+971">UAE (+971)</option>
              <option value="+256">Uganda (+256)</option>
              <option value="+380">Ukraine (+380)</option>
              <option value="+44">United Kingdom (+44)</option>
              <option value="+1">United States (+1)</option>
              <option value="+598">Uruguay (+598)</option>
              <option value="+998">Uzbekistan (+998)</option>
              <option value="+678">Vanuatu (+678)</option>
              <option value="+58">Venezuela (+58)</option>
              <option value="+84">Vietnam (+84)</option>
              <option value="+1">Virgin Islands (+1)</option>
              <option value="+967">Yemen (+967)</option>
              <option value="+260">Zambia (+260)</option>
              <option value="+263">Zimbabwe (+263)</option>
              </select>
              <input
                className={`form-input ${errors.phone ? "error" : ""}`}
                name="phone"
                value={form.phone.startsWith(form.countryCode) ? form.phone : form.countryCode + form.phone}
                onChange={handleChange}
                placeholder="e.g. +255656306692"
                maxLength={13}
                style={{ flex: 1 }}
              />
            </div>
            {errors.phone && <div className="error-message">{errors.phone}</div>}
          </div>
        <div className="form-group">
              <label className="form-label"> Username <span style={{ color: "red" }}>*</span></label>
              <input
                className={`form-input ${errors.username ? "error" : ""}`}
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Choose a username"
              />
              {errors.username && <div className="error-message">{errors.username}</div>}
            </div>

          <div className="form-group">
            <label className="form-label">  Password <span style={{ color: "red" }}>*</span></label>
            <input
              type="password"
              className={`form-input ${errors.password ? "error" : ""}`}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 8 chars, upper/lower/symbol/number"
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password <span style={{ color: "red" }}>*</span></label>
            <input
              type="password"
              className={`form-input ${errors.confirmPassword ? "error" : ""}`}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
            />
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Security Question</label>
            <select
              className={`form-input ${errors.securityQuestion ? "error" : ""}`}
              name="securityQuestion"
              value={form.securityQuestion}
              onChange={handleChange}
            >
              <option value="">Select</option>
              {securityQuestions.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
            {errors.securityQuestion && <div className="error-message">{errors.securityQuestion}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Security Answer</label>
              <input
                className={`form-input ${errors.securityAnswer ? "error" : ""}`}
                name="securityAnswer"
                value={form.securityAnswer}
                onChange={handleChange}
                placeholder="Enter your answer"
              />
            {errors.securityAnswer && <div className="error-message">{errors.securityAnswer}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Passport Size Picture</label>
            <input
              type="file"
              className={`form-input ${errors.passport ? "error" : ""}`}
              name="passport"
              accept="image/*"
              onChange={handleChange}
              placeholder="Upload passport photo"
            />
            {errors.passport && <div className="error-message">{errors.passport}</div>}
          </div>

         <div className="form-group">
       <label className="checkbox-option">
         <input
        type="checkbox"
        name="terms"
        checked={form.terms}
         onChange={handleChange}
        />
          I accept the <a href="https://zafiri.go.tz/rules-and-conditions" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>terms and conditions</a>
        </label>
         {errors.terms && <div className="error-message">{errors.terms}</div>}
        </div>
          <div className="form-group">
            <label className="checkbox-option">
              <input
                type="checkbox"
                name="confirm"
                checked={form.confirm}
                onChange={handleChange}
              />
              I confirm that above information is correct
            </label>
            {errors.confirm && <div className="error-message">{errors.confirm}</div>}
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
            style={{
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>

          <button
            type="button"
            className="submit-button"
            style={{ background: "#e2e8f0", color: "#334155", marginTop: 8 }}
            onClick={() => {
              setForm({
                username: "",
                firstName: "",
                secondName: "",
                lastName: "",
                dobDay: "",
                dobMonth: "",
                dobYear: "",
                gender: "",
                department: "",
                employeeNo: "",
                position: "",
                email: "",
                countryCode: "+255",
                phone: "",
                password: "",
                confirmPassword: "",
                securityQuestion: "",
                securityAnswer: "",
                passport: null,
                terms: false,
                confirm: false,
              });
              setErrors({});
              setSubmitted(false);
            }}
          >
            Clear Form
          </button>
      
          {submitted && !errorMessage && (
            <div className="success-message">Registration successful!</div>
          )}
          {errorMessage && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '8px',
              margin: '16px 0',
              textAlign: 'center'
            }}>
              {errorMessage}
            </div>
          )}
        </form>
                {showPopup && (
          <div
            ref={popupRef}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: successMessage ? "#10b981" : "#dc2626",
              color: "#fff",
              padding: "32px 40px",
              borderRadius: "18px",
              boxShadow: "0 8px 32px rgba(31,38,135,0.18)",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              fontSize: "1.1rem",
              fontWeight: 600,
              maxWidth: "400px",
              textAlign: "center"
            }}
          >
            {successMessage ? (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#059669"/>
                <path d="M7 13l3 3 6-6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#dc2626"/>
                <path d="M15 9l-6 6M9 9l6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            <div style={{ marginTop: 14 }}>
              {successMessage || errorMessage}
            </div>
            {!successMessage && !errorMessage && <div>Processing...</div>}
          </div>
        )}
      </div>
    </div>
  );
}