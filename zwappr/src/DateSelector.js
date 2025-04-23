import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function DateSelector() {
    const [startDate, setStartDate] = useState(null);

    const handleDateChange = (date) => {
        setStartDate(date);
        console.log("Selected Date:", date.toISOString()); // Save as string
    };

    return (
        <div>
            <label>Select a Date:</label>
            <DatePicker
                selected={startDate}
                onChange={handleDateChange}
                dateFormat="yyyy-MM-dd" // Format the date as a string
                placeholderText="Click to select a date"
            />
        </div>
    );
}

export default DateSelector;