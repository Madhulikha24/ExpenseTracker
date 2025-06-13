// Analysis.txt
import React, { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { QUERY_ME } from "../utils/queries";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js/auto";
import { Pie } from "react-chartjs-2";
import "../styles/Analysis.css";
import Savings from "../components/Savings";
import Dropdown from "../components/Dropdown";
import { formatAmount } from "../utils/helpers";

Chart.register(ArcElement, Tooltip, Legend);

export default function Analysis({ transactions, setTransactions }) {
  const [selectedOption, setSelectedOption] = useState('CurrentMTD');
  const { data, loading } = useQuery(QUERY_ME);

  useEffect(() => {
    if (data?.me?.transactions) {
      setTransactions(data.me.transactions);
      console.log("Fetched transactions (raw from backend):", data.me.transactions); // LOG 1: Check raw fetched data
    }
  }, [data, setTransactions]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  }

  let selectedTransactions = [];
  let selectedTimePeriod = "";
  let selectedTotal;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); // 0-indexed (0 for Jan)
  const currentYear = currentDate.getFullYear();

  const priorMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const priorMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const priorYear = currentYear - 1;

  // Optimized parseTransactionDate for Unix timestamps (number or string)
  const parseTransactionDate = (dateValue) => {
    let timestamp = Number(dateValue); // Convert to number, handles both string "123" and number 123
    if (isNaN(timestamp)) {
      console.warn("Invalid timestamp encountered:", dateValue);
      return null; // Return null if it's not a valid number
    }
    const dateObj = new Date(timestamp);
    if (dateObj instanceof Date && !isNaN(dateObj)) {
      return dateObj;
    }
    console.warn("Could not create valid Date object from timestamp:", dateValue);
    return null;
  };


  const currentMonthTransactions = transactions.filter(transaction => {
    const transactionDate = parseTransactionDate(transaction.date);
    // Add a log here to see the parsed Date object and its month/year
    console.log(`Transaction Date (Parsed): ${transactionDate}, Month: ${transactionDate?.getMonth()}, Year: ${transactionDate?.getFullYear()}`);
    return transactionDate && transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  });
  console.log("Current Month Transactions (filtered):", currentMonthTransactions); // LOG 2

  const currentMonthToDateSum = currentMonthTransactions.reduce((total, transaction) => {
    return total + transaction.amount;
  }, 0);

  const currentYearTransactions = transactions.filter(transaction => {
    const transactionDate = parseTransactionDate(transaction.date);
    return transactionDate && transactionDate.getFullYear() === currentYear;
  });
  console.log("Current Year Transactions (filtered):", currentYearTransactions); // LOG 3

  const currentYearToDateSum = currentYearTransactions.reduce((total, transaction) => {
    return total + transaction.amount;
  }, 0);

  const priorMonthTransactions = transactions.filter(transaction => {
    const transactionDate = parseTransactionDate(transaction.date);
    return transactionDate && transactionDate.getMonth() === priorMonth && transactionDate.getFullYear() === priorMonthYear;
  });
  console.log("Prior Month Transactions (filtered):", priorMonthTransactions); // LOG 4

  const priorMonthToDateSum = priorMonthTransactions.reduce((total, transaction) => {
    return total + transaction.amount;
  }, 0);

  const priorYearTransactions = transactions.filter(transaction => {
    const transactionDate = parseTransactionDate(transaction.date);
    return transactionDate && transactionDate.getFullYear() === priorYear;
  });
  console.log("Prior Year Transactions (filtered):", priorYearTransactions); // LOG 5

  const priorYearToDateSum = priorYearTransactions.reduce((total, transaction) => {
    return total + transaction.amount;
  }, 0);

  console.log("CURRENT MTD SUM: ", currentMonth, ": ", currentMonthToDateSum);
  console.log("CURRENT YTD SUM: ", currentYear, ": ", currentYearToDateSum);
  console.log("PRIOR MTD SUM: ", priorMonth, ": ", priorMonthToDateSum);
  console.log("PRIOR YTD SUM: ", priorYear, ": ", priorYearToDateSum);

  switch(selectedOption) {
    case "CurrentMTD":
      selectedTransactions = currentMonthTransactions;
      selectedTimePeriod = "Current Month to Date Spending";
      selectedTotal = currentMonthToDateSum;
      break
    case "CurrentYTD":
      selectedTransactions = currentYearTransactions;
      selectedTimePeriod = "Current Year to Date Spending";
      selectedTotal = currentYearToDateSum;
      break;
    case "PriorMTD":
      selectedTransactions = priorMonthTransactions;
      selectedTimePeriod = "Prior Month to Date Spending";
      selectedTotal = priorMonthToDateSum;
      break;
    case "PriorYTD":
      selectedTransactions = priorYearTransactions;
      selectedTimePeriod = "Prior Year to Date Spending";
      selectedTotal = priorYearToDateSum;
      break;
    default:
      selectedTransactions = currentMonthTransactions;
      selectedTimePeriod = "Current Month to Date Spending";
      selectedTotal = currentMonthToDateSum;
  }

  const calcHighLevelCategory = (transactionsArray) =>
    transactionsArray.reduce((acc, cur) => {
      const { highLevelCategory, amount } = cur;
      const item = acc.find((it) => it.highLevelCategory === highLevelCategory);
      item ? (item.amount += amount) : acc.push({ highLevelCategory, amount });
      return acc;
    }, []);

  let sumHighLevel = calcHighLevelCategory(selectedTransactions);
  let currentMonthHighLevel = calcHighLevelCategory(currentMonthTransactions);

  console.log("Essential vs NonEssential (sumHighLevel): ", sumHighLevel); // LOG 6

  const calcCategory = (transactionsArray) =>
    transactionsArray.reduce((acc, cur) => {
      const { category, amount } = cur;
      const item = acc.find((it) => it.category === category);
      item ? (item.amount += amount) : acc.push({ category, amount });
      return acc;
    }, []);

  let sumCategory = calcCategory(selectedTransactions);
  console.log("by Category (sumCategory): ", sumCategory); // LOG 7

  let sumAll = transactions.reduce((total, transaction) => total + transaction.amount, 0);
  console.log("TOTAL SUM (All Transactions): ", sumAll);

  const categoryData = {
    labels: [
      "Housing",
      "Food-Groceries",
      "Restaurant/Fast-Food",
      "Transportation",
      "Utilities - Gas, Electric, Water",
      "Cable/Streaming Services",
      "Insurance",
      "Medical/Health",
      "Entertainment",
      "Vacations",
      "Charity",
    ],
    datasets: [
      {
        label: "Spending by Category",
        data: [
          sumCategory.find((x) => x.category === "Housing")?.amount || 0,
          sumCategory.find((x) => x.category === "Food-Groceries")?.amount || 0,
          sumCategory.find((x) => x.category === "Restaurant/Fast-Food")?.amount || 0,
          sumCategory.find((x) => x.category === "Transportation")?.amount || 0,
          sumCategory.find(
            (x) => x.category === "Utilities - Gas, Electric, Water"
          )?.amount || 0,
          sumCategory.find((x) => x.category === "Cable/Streaming Services")
            ?.amount || 0,
          sumCategory.find((x) => x.category === "Insurance")?.amount || 0,
          sumCategory.find((x) => x.category === "Medical/Health")?.amount || 0,
          sumCategory.find((x) => x.category === "Entertainment")?.amount || 0,
          sumCategory.find((x) => x.category === "Vacations")?.amount || 0,
          sumCategory.find((x) => x.category === "Charity")?.amount || 0,
        ],
        backgroundColor: [
          "coral",
          "lightblue",
          "gray",
          "white",
          "purple",
          "yellow",
          "lightgreen",
          "blue",
          "red",
          "green",
          "firebrick",
        ],
        hoverOffset: 4,
      },
    ],
  };

  const commonPieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "white",
          font: {
            size: 10,
          },
          boxWidth: 20,
          padding: 10,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += formatAmount(context.parsed);
            }
            return label;
          }
        }
      }
    },
  };

  const highLevelLegendOptions = {
    ...commonPieChartOptions.plugins.legend,
    labels: {
      ...commonPieChartOptions.plugins.legend.labels,
      font: {
        ...commonPieChartOptions.plugins.legend.labels.font,
        size: 12,
      },
      maxWidth: 150,
      
    },
  };

  const highLevelCategoryData = {
    labels: ["Essential", "Non-Essential"],
    datasets: [
      {
        label: "Spending by Essential/Non-Essential",
        data: [
          sumHighLevel.find((x) => x.highLevelCategory === "Essential")
            ?.amount || 0,
          sumHighLevel.find((x) => x.highLevelCategory === "Non-Essential")
            ?.amount || 0,
        ],
        backgroundColor: ["#7583a7", "#FF4D4D"],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div>
      <h1 id="charts-title">Your Spending Charts</h1>
      <Dropdown onOptionChange={handleOptionChange} />
      <div className="row d-flex justify-content-around">
        <div className="col col-sm-12 col-lg-6" id="pie-chart-1">
          <div className="row">
            <div className="card card-chart ml-5">
              <div className="card-header card-chart-header">
                <h3 className="chart-title text-center text-light">{selectedTimePeriod}</h3>
                <h4>Total: {formatAmount(selectedTotal)}</h4>
                <h3 className="chart-title text-center text-light">
                  <span className="blue-text">Essential</span> vs <span className="red-text">Non-Essential</span>
                </h3>
              </div>
              <div className="card-body card-chart-body m-5">
                <Pie
                  className="chart chartjs-render-monitor chart-legend"
                  data={highLevelCategoryData}
                  options={{
                    ...commonPieChartOptions,
                    plugins: {
                      ...commonPieChartOptions.plugins,
                      legend: highLevelLegendOptions,
                    },
                  }}
                ></Pie>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="card card-chart ml-5">
              <div className="card-header card-chart-header">
                <h3 className="chart-title text-center text-light">{selectedTimePeriod}</h3>
                <h4>Total: {formatAmount(selectedTotal)}</h4>
                <h4 className="chart-title text-centermb-2 text-light">
                  by Category
                </h4>
              </div>
              <div className="card-body card-chart-body m-5">
                <Pie
                  className="chart chartjs-render-monitor chart-legend"
                  data={categoryData}
                  options={commonPieChartOptions}
                ></Pie>
              </div>
            </div>
          </div>
        </div>
        <div className="col col-sm-12 col-lg-6 mt-5">
          <Savings currentMonthHighLevel={currentMonthHighLevel} />
        </div>
        <div>{/* <TransactionTable/> */}</div>
      </div>
    </div>
  );
}