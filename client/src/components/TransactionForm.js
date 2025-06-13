import React, { useState, useRef, useEffect } from "react";
import "../styles/Transactions.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import { Button } from "react-bootstrap";

export default function TransactionForm({
  setShowTransactionForm,
  addTransaction,
  transactions,
  setTransactions,
  transactionFormState,
  setTransactionFormState,
}) {
  const [errorMessage, setErrorMessage] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  // Initialize startDate with the current date, or a parsed date from transactionFormState if available
  // Ensure transactionFormState.date is parsed correctly if it's coming from an edit scenario
  const [startDate, setStartDate] = useState(
    transactionFormState.date
      ? new Date(transactionFormState.date.split('/').reverse().join('-')) // Convert DD/MM/YYYY to YYYY-MM-DD for reliable Date parsing
      : new Date()
  );

  const inputRef = useRef(null); // Ref for the date input field
  const datePickerContainerRef = useRef(null); // Ref for the date picker container

  // Helper function to format a Date object into YYYY-MM-DD string
  const formatToYYYYMMDD = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to format a Date object into DD/MM/YYYY string for display
  const formatToDDMMYYYY = (date) => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Use useEffect to update startDate if transactionFormState.date changes (e.g., for editing)
  useEffect(() => {
    if (transactionFormState.date) {
      // Convert DD/MM/YYYY to YYYY-MM-DD for reliable Date parsing
      const parts = transactionFormState.date.split('/');
      if (parts.length === 3) {
        setStartDate(new Date(`${parts[2]}-${parts[1]}-${parts[0]}`));
      }
    } else {
      setStartDate(new Date()); // Reset to current date if transactionFormState.date is empty
    }
  }, [transactionFormState.date]);


  async function handleSubmit(e) {
    e.preventDefault();
    console.log("Submitting transactionFormState:", transactionFormState);
    try {
      const { data } = await addTransaction({
        variables: {
          // *** FIX: Send the properly formatted date from the `startDate` state ***
          date: formatToYYYYMMDD(startDate), // Use the reliable Date object from startDate
          amount: parseFloat(transactionFormState.amount),
          highLevelCategory: transactionFormState.highLevelCategory,
          category: transactionFormState.category,
          description: transactionFormState.description,
        },
      });

      setTransactionFormState({
        date: "",
        amount: "",
        highLevelCategory: "Essential",
        category: "Housing",
        description: "",
      });
      setShowTransactionForm(false);
      // It's generally better to refetch transactions after an add/delete
      // or ensure your GraphQL mutation returns the full updated list
      // For now, keeping your existing spread, but be aware of cache issues.
      setTransactions([...transactions, data.addTransaction]); // This assumes data.addTransaction has the full transaction object
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to add transaction. Please try again.");
    }
  }

  // Handles date selection from the DatePicker
  function handleDateSelect(date) {
    setStartDate(date); // Update the internal state of the DatePicker (Date object)
    setTransactionFormState({
      ...transactionFormState,
      date: formatToDDMMYYYY(date), // Format for display in the input field (DD/MM/YYYY)
    });
    setShowDatePicker(false); // Close the date picker after selection
  }

  function handleChange(e) {
    const { name, value } = e.target;
    // Removed the !value.length check as date is handled separately and other fields might be valid with empty strings if not required by backend
    // You should rely on backend validation or add specific frontend validation rules here.
    // For now, let's just update the state directly.
    setErrorMessage(""); // Clear error message on any change

    setTransactionFormState({
      ...transactionFormState,
      [name]: value,
    });
  }

  // handles when user clicks in transaction date input field or calendar icon
  function handleInputClick() {
    setShowDatePicker(true); // sets date picker to true, so it displays
  }

  // Effect to handle clicks outside the date picker and input field
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the input field AND outside the date picker container
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        datePickerContainerRef.current &&
        !datePickerContainerRef.current.contains(event.target)
      ) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDatePicker]); // Re-run effect when showDatePicker changes

  return (
    <>
      <div className="transaction-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="date">Transaction Date</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                id="date"
                name="date"
                value={transactionFormState.date}
                readOnly // Make the input read-only as date is selected via picker
                onClick={handleInputClick}
                ref={inputRef}
              />
              <div className="input-group-append">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleInputClick}
                >
                  <FaCalendarAlt size={20} />
                </button>
              </div>
              {showDatePicker && (
                // Attach ref to this container for click outside detection
                <div className="date-picker-container" ref={datePickerContainerRef}>
                  <DatePicker
                    selected={startDate}
                    onChange={handleDateSelect} // Use the new handleDateSelect
                    inline
                  />
                </div>
              )}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="amount">Transaction Amount (Rupees):</label>
            <input
              className="form-control"
              id="amount"
              name="amount"
              onChange={handleChange}
              value={transactionFormState.amount} // Controlled component: ensure value is tied to state
              type="number" // Use type number for amounts
              step="0.01" // Allow decimal values
            />
          </div>
          <div className="form-group">
            <label htmlFor="highLevelCategory">Essential/Non-Essential:</label>
            <select
              className="form-control form-select"
              id="highLevelCategory"
              onChange={handleChange}
              name="highLevelCategory"
              value={transactionFormState.highLevelCategory} // Controlled component
            >
              <option value="Essential">Essential</option>
              <option value="Non-Essential">Non-Essential</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="category">Select a Category:</label>
            <select
              className="form-control form-select"
              id="category"
              onChange={handleChange}
              name="category"
              value={transactionFormState.category} // Controlled component
            >
              <option value="Housing">Housing</option>
              <option value="Food-Groceries">Food-Groceries</option>
              <option value="Restaurant/Fast-Food">Restaurant/Fast-Food</option>
              <option value="Transportation">Transportation</option>
              <option value="Utilities - Gas, Electric, Water">
                Utilities - Gas, Electric, Water
              </option>
              <option value="Cable/Streaming Services">
                Cable/Streaming Services
              </option>
              <option value="Insurance">Insurance</option>
              <option value="Medical/Health">Medical/Health</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Vacations">Vacations</option>
              <option value="Charity">Charity</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="description">Transaction Description:</label>
            <textarea
              name="description"
              className="form-control"
              id="description"
              rows="3"
              onChange={handleChange}
              value={transactionFormState.description} // Controlled component
            ></textarea>
          </div>
          <div className="form-group">
            <Button variant="primary" type="submit">
              Add Transaction
            </Button>
            {errorMessage ? (
              <p className="error-message">{errorMessage}</p>
            ) : null}
          </div>
        </form>
      </div>
    </>
  );
}