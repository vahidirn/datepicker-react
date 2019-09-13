import React, {useState} from 'react';
import DatePicker from "./components/DatePicker/DatePicker";
import "./styles/scss/main.scss";


function App() {
    let [selectedDayRange, setSelectedDayRange] = useState({
        from: null,
        to: null
    });

    return (
        <div className="App">
            <DatePicker
                onChange={(value) => {
                    setSelectedDayRange(value);
                }}
                colorPrimary='#3389EE'
                colorPrimaryLight='#3389ee59'
                isGregorian={false}
                selectedDayRange={selectedDayRange}
                minimumDate={{
                    day: 25,
                    month: 4,
                    year: 1398
                }}
                maximumDate={{
                    day: 25,
                    month: 4,
                    year: 1399
                }}

            />
        </div>
    );
}

export default App;
