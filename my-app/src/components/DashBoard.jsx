// import { useEffect, useState } from "react";
// import "../DashBoard.css";
// import {  
//   MdMenuBook, 
//   MdAutoStories, 
//   MdCheckCircle,
//   MdFlag 
// } from "react-icons/md";
// import { LuLibrary, LuNotebookText } from "react-icons/lu";
// import { AiOutlinePieChart } from "react-icons/ai";
// import { Line } from "react-chartjs-2";
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
// } from "recharts";

// // Register the components with Chart.js
// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// const Dashboard = () => {
//   const [goals, setGoals] = useState({
//     yearly_goal: 0,
//     yearly_progress: 0,
//     monthly_goal: 0,
//     monthly_progress: 0,
//     weekly_goal: 0,
//     weekly_progress: 0
//   });
//   const [isEditing, setIsEditing] = useState(false);
//   const [updatedGoals, setUpdatedGoals] = useState({
//     yearly_goal: '',
//     yearly_progress: '',
//     monthly_goal: '',
//     monthly_progress: '',
//     weekly_goal: '',
//     weekly_progress: ''
//   });
//   const [summary, setSummary] = useState({
//     totalBooks: 0,
//     completedBooks: 0,
//     currentlyReading: 0
//   });
//   const [pagesChartData, setPagesChartData] = useState({
//     labels: [],
//     datasets: [{
//       label: 'Total Pages Read',
//       data: [],
//       borderColor: 'rgb(46, 153, 151)',
//       fill: false,
//       tension: 0.1,
//     }]
//   });
//   const [minutesChartData, setMinutesChartData] = useState({
//     labels: [],
//     datasets: [{
//       label: 'Total Minutes Read',
//       data: [],
//       borderColor: 'rgba(153, 102, 255, 1)',
//       fill: false,
//       tension: 0.1,
//     }]
//   });
//   const [currentlyReadingBooks, setCurrentlyReadingBooks] = useState([]);
//   const [genreData, setGenreData] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const readerId = sessionStorage.getItem("reader_id");
//   const token = sessionStorage.getItem("token");

//   useEffect(() => {
//     if (!readerId) {
//       console.error("Reader ID is missing from sessionStorage.");
//       setIsLoading(false);
//       return;
//     }

//     const fetchAllData = async () => {
//       try {
//         setIsLoading(true);
        
//         // Fetch goals
//         const goalsResponse = await fetch(`http://localhost:8000/reading-goals/${readerId}`, {
//           headers: {
//             "Authorization": `Bearer ${token}`,
//             "Accept": "application/json"
//           },
//           credentials: "include"
//         });
//         const goalsData = await goalsResponse.json();
//         setGoals(goalsData || {
//           yearly_goal: 0,
//           yearly_progress: 0,
//           monthly_goal: 0,
//           monthly_progress: 0,
//           weekly_goal: 0,
//           weekly_progress: 0
//         });
//         setUpdatedGoals(goalsData || {
//           yearly_goal: 0,
//           yearly_progress: 0,
//           monthly_goal: 0,
//           monthly_progress: 0,
//           weekly_goal: 0,
//           weekly_progress: 0
//         });

//         // Fetch summary
//         const summaryResponse = await fetch(`http://localhost:8000/dashboard/summary/${readerId}`, {
//           headers: {
//             "Authorization": `Bearer ${token}`,
//             "Accept": "application/json"
//           },
//           credentials: "include"
//         });
//         const summaryData = await summaryResponse.json();
//         setSummary(summaryData || {
//           totalBooks: 0,
//           completedBooks: 0,
//           currentlyReading: 0
//         });

//         // Fetch currently reading books
//         const readingResponse = await fetch(`http://localhost:8000/dashboard/currently-reading/${readerId}`, {
//           headers: {
//             "Authorization": `Bearer ${token}`,
//             "Accept": "application/json"
//           },
//           credentials: "include"
//         });
//         const readingData = await readingResponse.json();
//         setCurrentlyReadingBooks(Array.isArray(readingData) ? readingData : []);

//         // Fetch genre data
//         const genreResponse = await fetch(`http://localhost:8000/dashboard/genre-counts/${readerId}`, {
//           headers: {
//             "Authorization": `Bearer ${token}`,
//             "Accept": "application/json"
//           },
//           credentials: "include"
//         });
//         const genreData = await genreResponse.json();
//         if (Array.isArray(genreData)) {
//           const formattedData = genreData.map((item) => ({
//             name: item._id || "Unknown",
//             value: item.count || 0,
//           }));
//           setGenreData(formattedData);
//         } else {
//           setGenreData([]);
//         }

//         // Fetch chart data
//         const chartResponse = await fetch(`http://localhost:8000/dashboard/timer/${readerId}`, {
//           headers: {
//             "Authorization": `Bearer ${token}`,
//             "Accept": "application/json"
//           },
//           credentials: "include"
//         });
//         const chartData = await chartResponse.json();
        
//         if (Array.isArray(chartData)) {
//           const labels = chartData.map(item => item.date) || [];
//           const totalPages = chartData.map(item => item.totalPages) || [];
//           const totalMinutes = chartData.map(item => item.totalMinutes) || [];

//           setPagesChartData({
//             labels: labels,
//             datasets: [{
//               label: 'Total Pages Read',
//               data: totalPages,
//               borderColor: 'rgb(46, 153, 151)',
//               fill: false,
//               tension: 0.1,
//             }]
//           });

//           setMinutesChartData({
//             labels: labels,
//             datasets: [{
//               label: 'Total Minutes Read',
//               data: totalMinutes,
//               borderColor: 'rgba(153, 102, 255, 1)',
//               fill: false,
//               tension: 0.1,
//             }]
//           });
//         }
//       } catch (error) {
//         console.error("Error fetching dashboard data:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchAllData();
//   }, [readerId, token]);

//   const handleEditClick = () => {
//     setIsEditing(true);
//   };

//   const handleClose = () => {
//     setIsEditing(false);
//   };

//   // Updated handleChange function with stronger validation
//   const handleChange = (e) => {
//     const { name, value } = e.target;
    
//     // Only allow numeric input (empty string or numbers)
//     if (value === '' || /^\d+$/.test(value)) {
//       setUpdatedGoals({ 
//         ...updatedGoals, 
//         [name]: value
//       });
//     }
//     // If input doesn't match our validation, we don't update state
//   };

//   // Prevent non-numeric input on keydown
//   const handleKeyDown = (e) => {
//     // Allow: backspace, delete, tab, escape, enter, navigation keys
//     const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight'];
    
//     // If it's not a number and not in allowed special keys, prevent default
//     if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
//       e.preventDefault();
//     }
//   };

//   // Handle paste event to prevent non-numeric input
//   const handlePaste = (e) => {
//     // Get pasted data via clipboard API
//     const pastedData = e.clipboardData.getData('Text');
    
//     // If pasted data is not numeric, prevent default
//     if (!/^\d*$/.test(pastedData)) {
//       e.preventDefault();
//     }
//   };

//   const handleSave = async () => {
//     try {
//       // Convert any empty strings to 0 for the API call
//       const goalsToSave = {
//         reader_id: readerId,
//         yearly_goal: updatedGoals.yearly_goal === '' ? 0 : parseInt(updatedGoals.yearly_goal, 10),
//         yearly_progress: updatedGoals.yearly_progress === '' ? 0 : parseInt(updatedGoals.yearly_progress, 10),
//         monthly_goal: updatedGoals.monthly_goal === '' ? 0 : parseInt(updatedGoals.monthly_goal, 10),
//         monthly_progress: updatedGoals.monthly_progress === '' ? 0 : parseInt(updatedGoals.monthly_progress, 10),
//         weekly_goal: updatedGoals.weekly_goal === '' ? 0 : parseInt(updatedGoals.weekly_goal, 10),
//         weekly_progress: updatedGoals.weekly_progress === '' ? 0 : parseInt(updatedGoals.weekly_progress, 10)
//       };
  
//       const url = `http://localhost:8000/reading-goals/${readerId}`;
//       const response = await fetch(url, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}` },
//         body: JSON.stringify({
//           reader_id: readerId,
//           yearly_goal: updatedGoals.yearly_goal || 0,
//           yearly_progress: updatedGoals.yearly_progress || 0,
//           monthly_goal: updatedGoals.monthly_goal || 0,
//           monthly_progress: updatedGoals.monthly_progress || 0,
//           weekly_goal: updatedGoals.weekly_goal || 0,
//           weekly_progress: updatedGoals.weekly_progress || 0
//         }),
//       });
  
//       if (response.status === 404) {
//         // If no goals found, create new ones
//         await fetch(url, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             reader_id: readerId,
//             yearly_goal: updatedGoals.yearly_goal || 0,
//             yearly_progress: updatedGoals.yearly_progress || 0,
//             monthly_goal: updatedGoals.monthly_goal || 0,
//             monthly_progress: updatedGoals.monthly_progress || 0,
//             weekly_goal: updatedGoals.weekly_goal || 0,
//             weekly_progress: updatedGoals.weekly_progress || 0
//           }),
//         });
//       }
  
//       const data = await response.json();
//       setGoals(data);
//       setIsEditing(false);
//     } catch (err) {
//       console.error("Error updating or creating goals:", err);
//     }
//   };

//   const GoalProgress = ({ title, current, total }) => {
//     // Handle 0/0 case specifically
//     if (total === 0 || total === '') {
//       return (
//         <div className="goal">
//           <p>
//             {title} (0 of 0)
//           </p>
//           <div className="ReadingGoals-progress-bar">
//             <div className="ReadingGoals-progress-fill" style={{ width: '0%' }}></div>
//           </div>
//           <span>0%</span>
//         </div>
//       );
//     }
  
//     const displayCurrent = current > total ? total : current;
//     const progress = Math.min(Math.round((displayCurrent / total) * 100), 100);
//     return (
//       <div className="goal">
//         <p>
//           {title} ({displayCurrent} of {total})
//         </p>
//         <div className="ReadingGoals-progress-bar">
//           <div className="ReadingGoals-progress-fill" style={{ width: `${progress}%` }}></div>
//         </div>
//         <span>{progress}%</span>
//       </div>
//     );
//   };

//   if (isLoading) {
//     return <div className="loading">Loading dashboard data...</div>;
//   }

//   return (
//     <div className="dashboard-container">
//       <h1 className="dashboard-heading">Dashboard</h1>
    
//       <div className="book-summary">
//         <h2 className="summary-heading">
//           <LuLibrary style={{ fontSize: '1.6rem', marginBottom: '-2px' }}/> Reading Statistics </h2>
//         <div className="summary-cards">
//           <div className="summary-card">
//             <p className="summary-title">
//               <MdMenuBook style={{ marginBottom: '-2px' }}/> Total Books</p>
//             <p className="summary-value">{summary.totalBooks}</p>
//           </div>
//           <div className="summary-card">
//             <p className="summary-title">
//               <MdCheckCircle style={{ marginBottom: '-2px' }}/> Completed</p>
//             <p className="summary-value">{summary.completedBooks}</p>
//           </div>
//           <div className="summary-card">
//             <p className="summary-title">
//               <MdAutoStories style={{ marginBottom: '-2px' }}/> Currently Reading</p>
//             <p className="summary-value">{summary.currentlyReading}</p>
//           </div>
//         </div>
        
//         <div className="charts-container">
//           <div className="chart-container">
//             <h3>Total Pages Read per Day</h3>
//             {pagesChartData.labels.length > 0 ? (
//               <Line 
//                 data={pagesChartData} 
//                 options={{ 
//                   responsive: true, 
//                   plugins: { 
//                     title: { 
//                       display: true, 
//                       text: 'Pages Read per Day' 
//                     } 
//                   } 
//                 }} 
//               />
//             ) : (
//               <p className="no-data-message">No pages data available</p>
//             )}
//           </div>

//           <div className="chart-container">
//             <h3>Total Minutes of Reading per Day</h3>
//             {minutesChartData.labels.length > 0 ? (
//               <Line 
//                 data={minutesChartData} 
//                 options={{ 
//                   responsive: true, 
//                   plugins: { 
//                     title: { 
//                       display: true, 
//                       text: 'Minutes of Reading per Day' 
//                     } 
//                   } 
//                 }} 
//               />
//             ) : (
//               <p className="no-data-message">No minutes data available</p>
//             )}
//           </div>
//         </div>
        
//         <div className="dashboard-row">
//           <div className="genre-chart-container">
//             <h2 className="chart-heading"><AiOutlinePieChart style={{ marginBottom: '-2px' }}/> Genre Distribution</h2>
//             {genreData.length > 0 ? (
//               <ResponsiveContainer width="100%" height={270}>
//                 <PieChart>
//                   <Pie
//                     data={genreData}
//                     dataKey="value"
//                     nameKey="name"
//                     outerRadius={90}
//                     className="genre-pie-chart"
//                     label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                   >
//                     {genreData.map((entry, index) => (
//                       <Cell key={`cell-${index}`}
//                       className="genre-pie-chart-cell" />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                 </PieChart>
//               </ResponsiveContainer>
//             ) : (
//               <p className="no-data-message">No genre data available</p>
//             )}
//           </div>

//           <div className="currently-reading-container">
//             <h2 className="currently-reading-heading">
//               <LuNotebookText style={{ marginBottom: '-2px' }} /> Currently Reading
//             </h2>
//             {currentlyReadingBooks.length > 0 ? (
//               currentlyReadingBooks.map((book) => {
//                 const progress = Math.min(Math.round((book.currently_read / book.total_pages) * 100), 100);
//                 return (
//                   <div key={book.bookid} className="currently-reading-item">
//                     <p className="book-title">{book.book_name} by {book.author_name}</p>
//                     <div className="progress-bar">
//                       <div className="progress-fill" style={{ width: `${progress}%` }}></div>
//                     </div>
//                     <span>{progress}%</span>
//                   </div>
//                 );
//               })
//             ) : (
//               <p className="no-data-message">You're not currently reading any books.</p>
//             )}
//           </div>
//         </div>
//       </div> 

//       <div className="ReadingGoals">
//         <h2 className="ReadingGoals-h2">
//           <MdFlag style={{ fontSize: '1.6rem', marginBottom: '-2px' }} />Reading Goals
//         </h2>
//         <p className="ReadingGoals-p">Track your reading progress based on completed books</p>

//         <GoalProgress 
//           title="Yearly Goal" 
//           current={goals.yearly_progress} 
//           total={goals.yearly_goal} 
//         />
//         <GoalProgress 
//           title="Monthly Goal" 
//           current={goals.monthly_progress} 
//           total={goals.monthly_goal} 
//         />
//         <GoalProgress 
//           title="Weekly Goal" 
//           current={goals.weekly_progress} 
//           total={goals.weekly_goal} 
//         />

//         <button className="edit-button" onClick={handleEditClick}>Edit Goals</button>

//         {isEditing && (
//           <div className="modal">
//             <div className="modal-content">
//               <h3>Edit Your Goals</h3>
//               <label>
//                 Yearly Goal: 
//                 <input 
//                   type="text" 
//                   name="yearly_goal" 
//                   value={updatedGoals.yearly_goal}
//                   onChange={handleChange}
//                   onKeyDown={handleKeyDown}
//                   onPaste={handlePaste}
//                   inputMode="numeric"
//                   pattern="[0-9]*"
//                 />
//               </label>
//               <label>
//                 Monthly Goal: 
//                 <input 
//                   type="text" 
//                   name="monthly_goal" 
//                   value={updatedGoals.monthly_goal}
//                   onChange={handleChange}
//                   onKeyDown={handleKeyDown}
//                   onPaste={handlePaste}
//                   inputMode="numeric"
//                   pattern="[0-9]*"
//                 />
//               </label>
//               <label>
//                 Weekly Goal: 
//                 <input 
//                   type="text" 
//                   name="weekly_goal" 
//                   value={updatedGoals.weekly_goal}
//                   onChange={handleChange}
//                   onKeyDown={handleKeyDown}
//                   onPaste={handlePaste}
//                   inputMode="numeric"
//                   pattern="[0-9]*"
//                 />
//               </label>

//               <div className="modal-buttons">
//                 <button onClick={handleSave}>Save</button>
//                 <button onClick={handleClose}>Cancel</button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;



import { useEffect, useState } from "react";
import "../DashBoard.css";
import {  
  MdMenuBook, 
  MdAutoStories, 
  MdCheckCircle,
  MdFlag 
} from "react-icons/md";
import { LuLibrary, LuNotebookText } from "react-icons/lu";
import { AiOutlinePieChart } from "react-icons/ai";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

// Register the components with Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [goals, setGoals] = useState({
    yearly_goal: 0,
    yearly_progress: 0,
    monthly_goal: 0,
    monthly_progress: 0,
    weekly_goal: 0,
    weekly_progress: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [updatedGoals, setUpdatedGoals] = useState({
    yearly_goal: '',
    yearly_progress: '',
    monthly_goal: '',
    monthly_progress: '',
    weekly_goal: '',
    weekly_progress: ''
  });
  const [summary, setSummary] = useState({
    totalBooks: 0,
    completedBooks: 0,
    currentlyReading: 0
  });
  const [pagesChartData, setPagesChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Total Pages Read',
      data: [],
      borderColor: 'rgb(46, 153, 151)',
      fill: false,
      tension: 0.1,
    }]
  });
  const [minutesChartData, setMinutesChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Total Minutes Read',
      data: [],
      borderColor: 'rgba(153, 102, 255, 1)',
      fill: false,
      tension: 0.1,
    }]
  });
  const [currentlyReadingBooks, setCurrentlyReadingBooks] = useState([]);
  const [genreData, setGenreData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const readerId = sessionStorage.getItem("reader_id");
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!readerId) {
      console.error("Reader ID is missing from sessionStorage.");
      setIsLoading(false);
      return;
    }

    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch goals
        const goalsResponse = await fetch(`http://localhost:8000/reading-goals/${readerId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          },
          credentials: "include"
        });
        const goalsData = await goalsResponse.json();
        setGoals(goalsData || {
          yearly_goal: 0,
          yearly_progress: 0,
          monthly_goal: 0,
          monthly_progress: 0,
          weekly_goal: 0,
          weekly_progress: 0
        });
        setUpdatedGoals(goalsData || {
          yearly_goal: 0,
          yearly_progress: 0,
          monthly_goal: 0,
          monthly_progress: 0,
          weekly_goal: 0,
          weekly_progress: 0
        });

        // Fetch summary
        const summaryResponse = await fetch(`http://localhost:8000/dashboard/summary/${readerId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          },
          credentials: "include"
        });
        const summaryData = await summaryResponse.json();
        setSummary(summaryData || {
          totalBooks: 0,
          completedBooks: 0,
          currentlyReading: 0
        });

        // Fetch currently reading books
        const readingResponse = await fetch(`http://localhost:8000/dashboard/currently-reading/${readerId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          },
          credentials: "include"
        });
        const readingData = await readingResponse.json();
        setCurrentlyReadingBooks(Array.isArray(readingData) ? readingData : []);

        // Fetch genre data
        const genreResponse = await fetch(`http://localhost:8000/dashboard/genre-counts/${readerId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          },
          credentials: "include"
        });
        const genreData = await genreResponse.json();
        if (Array.isArray(genreData)) {
          const formattedData = genreData.map((item) => ({
            name: item._id || "Unknown",
            value: item.count || 0,
          }));
          setGenreData(formattedData);
        } else {
          setGenreData([]);
        }

        // Fetch chart data
        const chartResponse = await fetch(`http://localhost:8000/dashboard/timer/${readerId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          },
          credentials: "include"
        });
        const chartData = await chartResponse.json();
        
        if (Array.isArray(chartData)) {
          const labels = chartData.map(item => item.date) || [];
          const totalPages = chartData.map(item => item.totalPages) || [];
          const totalMinutes = chartData.map(item => item.totalMinutes) || [];

          setPagesChartData({
            labels: labels,
            datasets: [{
              label: 'Total Pages Read',
              data: totalPages,
              borderColor: 'rgb(46, 153, 151)',
              fill: false,
              tension: 0.1,
            }]
          });

          setMinutesChartData({
            labels: labels,
            datasets: [{
              label: 'Total Minutes Read',
              data: totalMinutes,
              borderColor: 'rgba(153, 102, 255, 1)',
              fill: false,
              tension: 0.1,
            }]
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [readerId, token]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleClose = () => {
    setIsEditing(false);
  };

  // Updated handleChange function with stronger validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow numeric input (empty string or numbers)
    if (value === '' || /^\d+$/.test(value)) {
      setUpdatedGoals({ 
        ...updatedGoals, 
        [name]: value
      });
    }
    // If input doesn't match our validation, we don't update state
  };

  // Prevent non-numeric input on keydown
  const handleKeyDown = (e) => {
    // Allow: backspace, delete, tab, escape, enter, navigation keys
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight'];
    
    // If it's not a number and not in allowed special keys, prevent default
    if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  // Handle paste event to prevent non-numeric input
  const handlePaste = (e) => {
    // Get pasted data via clipboard API
    const pastedData = e.clipboardData.getData('Text');
    
    // If pasted data is not numeric, prevent default
    if (!/^\d*$/.test(pastedData)) {
      e.preventDefault();
    }
  };

  const handleSave = async () => {
    try {
      // Convert any empty strings to 0 for the API call
      const goalsToSave = {
        reader_id: readerId,
        yearly_goal: updatedGoals.yearly_goal === '' ? 0 : parseInt(updatedGoals.yearly_goal, 10),
        yearly_progress: updatedGoals.yearly_progress === '' ? 0 : parseInt(updatedGoals.yearly_progress, 10),
        monthly_goal: updatedGoals.monthly_goal === '' ? 0 : parseInt(updatedGoals.monthly_goal, 10),
        monthly_progress: updatedGoals.monthly_progress === '' ? 0 : parseInt(updatedGoals.monthly_progress, 10),
        weekly_goal: updatedGoals.weekly_goal === '' ? 0 : parseInt(updatedGoals.weekly_goal, 10),
        weekly_progress: updatedGoals.weekly_progress === '' ? 0 : parseInt(updatedGoals.weekly_progress, 10)
      };
  
      const url = `http://localhost:8000/reading-goals/${readerId}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          reader_id: readerId,
          yearly_goal: updatedGoals.yearly_goal || 0,
          yearly_progress: updatedGoals.yearly_progress || 0,
          monthly_goal: updatedGoals.monthly_goal || 0,
          monthly_progress: updatedGoals.monthly_progress || 0,
          weekly_goal: updatedGoals.weekly_goal || 0,
          weekly_progress: updatedGoals.weekly_progress || 0
        }),
      });
  
      if (response.status === 404) {
        // If no goals found, create new ones
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reader_id: readerId,
            yearly_goal: updatedGoals.yearly_goal || 0,
            yearly_progress: updatedGoals.yearly_progress || 0,
            monthly_goal: updatedGoals.monthly_goal || 0,
            monthly_progress: updatedGoals.monthly_progress || 0,
            weekly_goal: updatedGoals.weekly_goal || 0,
            weekly_progress: updatedGoals.weekly_progress || 0
          }),
        });
      }
  
      const data = await response.json();
      setGoals(data);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating or creating goals:", err);
    }
  };

  const GoalProgress = ({ title, current, total }) => {
    // Handle 0/0 case specifically
    if (total === 0 || total === '') {
      return (
        <div className="goal">
          <p>
            {title} (0 of 0)
          </p>
          <div className="ReadingGoals-progress-bar">
            <div className="ReadingGoals-progress-fill" style={{ width: '0%' }}></div>
          </div>
          <span>0%</span>
        </div>
      );
    }
  
    const displayCurrent = current > total ? total : current;
    const progress = Math.min(Math.round((displayCurrent / total) * 100), 100);
    return (
      <div className="goal">
        <p>
          {title} ({displayCurrent} of {total})
        </p>
        <div className="ReadingGoals-progress-bar">
          <div className="ReadingGoals-progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <span>{progress}%</span>
      </div>
    );
  };

  if (isLoading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard-wrapper">
      <div className={`dashboard-container ${isEditing ? 'blurred' : ''}`}>
        <h1 className="dashboard-heading">Dashboard</h1>
      
        <div className="book-summary">
          <h2 className="summary-heading">
            <LuLibrary style={{ fontSize: '1.6rem', marginBottom: '-2px' }}/> Reading Statistics </h2>
          <div className="summary-cards">
            <div className="summary-card">
              <p className="summary-title">
                <MdMenuBook style={{ marginBottom: '-2px' }}/> Total Books</p>
              <p className="summary-value">{summary.totalBooks}</p>
            </div>
            <div className="summary-card">
              <p className="summary-title">
                <MdCheckCircle style={{ marginBottom: '-2px' }}/> Completed</p>
              <p className="summary-value">{summary.completedBooks}</p>
            </div>
            <div className="summary-card">
              <p className="summary-title">
                <MdAutoStories style={{ marginBottom: '-2px' }}/> Currently Reading</p>
              <p className="summary-value">{summary.currentlyReading}</p>
            </div>
          </div>
          
          <div className="charts-container">
            <div className="chart-container">
              <h3>Total Pages Read per Day</h3>
              {pagesChartData.labels.length > 0 ? (
                <Line 
                  data={pagesChartData} 
                  options={{ 
                    responsive: true, 
                    plugins: { 
                      title: { 
                        display: true, 
                        text: 'Pages Read per Day' 
                      } 
                    } 
                  }} 
                />
              ) : (
                <p className="no-data-message">No pages data available</p>
              )}
            </div>

            <div className="chart-container">
              <h3>Total Minutes of Reading per Day</h3>
              {minutesChartData.labels.length > 0 ? (
                <Line 
                  data={minutesChartData} 
                  options={{ 
                    responsive: true, 
                    plugins: { 
                      title: { 
                        display: true, 
                        text: 'Minutes of Reading per Day' 
                      } 
                    } 
                  }} 
                />
              ) : (
                <p className="no-data-message">No minutes data available</p>
              )}
            </div>
          </div>
          
          <div className="dashboard-row">
            <div className="genre-chart-container">
              <h2 className="chart-heading"><AiOutlinePieChart style={{ marginBottom: '-2px' }}/> Genre Distribution</h2>
              {genreData.length > 0 ? (
                <ResponsiveContainer width="100%" height={270}>
                  <PieChart>
                    <Pie
                      data={genreData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      className="genre-pie-chart"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {genreData.map((entry, index) => (
                        <Cell key={`cell-${index}`}
                        className="genre-pie-chart-cell" />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="no-data-message">No genre data available</p>
              )}
            </div>

            <div className="currently-reading-container">
              <h2 className="currently-reading-heading">
                <LuNotebookText style={{ marginBottom: '-2px' }} /> Currently Reading
              </h2>
              {currentlyReadingBooks.length > 0 ? (
                currentlyReadingBooks.map((book) => {
                  const progress = Math.min(Math.round((book.currently_read / book.total_pages) * 100), 100);
                  return (
                    <div key={book.bookid} className="currently-reading-item">
                      <p className="book-title">{book.book_name} by {book.author_name}</p>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                      </div>
                      <span>{progress}%</span>
                    </div>
                  );
                })
              ) : (
                <p className="no-data-message">You're not currently reading any books.</p>
              )}
            </div>
          </div>
        </div> 

        <div className="ReadingGoals">
          <h2 className="ReadingGoals-h2">
            <MdFlag style={{ fontSize: '1.6rem', marginBottom: '-2px' }} />Reading Goals
          </h2>
          <p className="ReadingGoals-p">Track your reading progress based on completed books</p>

          <GoalProgress 
            title="Yearly Goal" 
            current={goals.yearly_progress} 
            total={goals.yearly_goal} 
          />
          <GoalProgress 
            title="Monthly Goal" 
            current={goals.monthly_progress} 
            total={goals.monthly_goal} 
          />
          <GoalProgress 
            title="Weekly Goal" 
            current={goals.weekly_progress} 
            total={goals.weekly_goal} 
          />

          <button className="edit-button" onClick={handleEditClick}>Edit Goals</button>
        </div>
      </div>

      {isEditing && (
        <>
          <div className="modal-backdrop" onClick={handleClose}></div>
          <div className="modal">
            <div className="modal-content">
              <h3>Edit Your Goals</h3>
              <label>
                Yearly Goal: 
                <input 
                  type="text" 
                  name="yearly_goal" 
                  value={updatedGoals.yearly_goal}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </label>
              <label>
                Monthly Goal: 
                <input 
                  type="text" 
                  name="monthly_goal" 
                  value={updatedGoals.monthly_goal}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </label>
              <label>
                Weekly Goal: 
                <input 
                  type="text" 
                  name="weekly_goal" 
                  value={updatedGoals.weekly_goal}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </label>

              <div className="modal-buttons">
                <button onClick={handleSave}>Save</button>
                <button onClick={handleClose}>Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;