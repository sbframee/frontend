import axios from "axios";
import { useEffect, useState } from "react";

const AddCasePopup = ({ onSave })=> {
      
      
        const [errMassage, setErrorMassage] = useState("");
      
        const [name, setName] = useState('');
        const [mobileno, setMobileNo] = useState('');
        const [countries, setCountries] = useState([]);
        const [country, setCountry] = useState('');
        const [states, setStates] = useState([]);
        const [state, setState] = useState('');
        const [cities, setCities] = useState([]);
        const [city, setCity] = useState('');
        const [image, setImage] = useState(null);
      
          
        useEffect(() => {
          axios.get('http://localhost:5000/country/getCountries')
            .then(response => setCountries(response.data))
            .catch(error => console.log(error));
        }, []);
      
        const onCountryChange = event => {
          setCountry(event.target.value);
          setState('');
          setCity('');
          axios.get(`http://localhost:5000/state/getStates?country=${event.target.value}`)
            .then(response => setStates(response.data))
            .catch(error => console.log(error));
        };
      
      
        const onStateChange = event => {
          setState(event.target.value);
          setCity('');
          axios.get(`http://localhost:5000/city/getCities?country=${country}&state=${event.target.value}`)
            .then(response => setCities(response.data))
            .catch(error => console.log(error));
        };
      
        const onCityChange = event => {
          setCity(event.target.value);
        };
      
        const handleImageChange = (e) => {
          setImage(e.target.files[0]);
        };
      
       
        const onSubmit = (e) => {
          e.preventDefault();
          const formData = new FormData();
          formData.append('name', name);
          formData.append('mobileno', mobileno);
          formData.append('country', country);
          formData.append('state', state);
          formData.append('city', city);
          formData.append('image', image);
      
            if(mobileno.length < 10) {
              alert("Mobile number shoild be at least 10 digits ")
              return;
            }
            else if(mobileno.length > 10) {
              alert("Mobile number shoild be at least 10 digits ")
              return;
            }
          axios.post("http://localhost:5000/cases/postCase", formData).then((response) => {
            console.log(response.data);
          });
        };
      
        return (
          <div className="overlay">
            <div
              className="modal"
              style={{  padding: " 10px"}}
            >
             <div
                className="content"
                style={{
                  height: "fit-content",
                  padding: "20px",
                  width: "fit-content",
                }}
              >
                  
                    <div className="row">
                      <h1>Add Case</h1>
                    </div>
      
                    <div>
                      <div className="row">
                        <label className="selectLabel" style={{ width: "100%" }}>
                          Name
                          <input
                    type="text"
                    name="name"
                    className="numberInput"
                    value={name}
                    onChange={event => setName(event.target.value)}
                  />
                        </label>
                      </div>
                      <div className="row">
                        <label className="selectLabel" style={{ width: "100%" }}>
                          Mobile No
                          <input
                    type="text"
                    name="mobileno"
                    className="numberInput"
                    value={mobileno}
                    onChange={event => setMobileNo(event.target.value)}
                  />
                        </label>
                        </div>
                        <div className="row">
                <label className="selectLabel" style={{ width: "100%" }}>
                  Country
                  <select id="country" className="numberInput" value={country} onChange={onCountryChange}>
          <option value="">Select a country</option>
          {countries.map(({ name }) => <option key={name} value={name}>{name}</option>)}
        </select>
                </label>  
                </div>
                <div className="row"> 
                {country ? (
                  <label className="selectLabel" style={{ width: "100%" }}>
                    State
                    <select id="state" className="numberInput" value={state} onChange={onStateChange} disabled={!country}>
          <option value="">Select a state</option>
          {states.map(({ name }) => <option key={name} value={name}>{name}</option>)}
        </select>     
                  </label>
                ) : (
                  ""
                )}
                 </div>
                 <div className="row"> 
{state ? (
                  <label className="selectLabel" style={{ width: "100%" }}>
                    City
                    <select id="city" value={city} className="numberInput" onChange={onCityChange} disabled={!state}>
          <option value="">Select a city</option>
          {cities.map(({ name }) => <option key={name} value={name}>{name}</option>)}
        </select>
                  </label>
                ) : (
                  ""
                )}
                        
                        </div>
                       
                        <div>
                <label className="selectLabel">
                  Image:
                   <input type="file" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
             
              <div className="bottomContent" style={{ padding: "20px" }}>
                <button type="button" onClick={onSubmit}>
                  Save
                </button>
              </div>
            
                     
                    </div>
                    <i style={{ color: "red" }}>
                      {errMassage === "" ? "" : "Error: " + errMassage}
                    </i>
      
                   
                </div>
                <button onClick={onSave} className="closeButton">
                  x
                </button>
              </div>
              </div>
                    );
      
      
}

export default AddCasePopup