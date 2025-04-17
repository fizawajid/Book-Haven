// components/Reread.jsx
import React, { useEffect, useState } from 'react';
import "../Reread.css";
import { IoArrowRedoCircleSharp } from "react-icons/io5";
const Reread = ({ bookid }) => {
  const [rereadHistory, setRereadHistory] = useState([]);

  useEffect(() => {
    const fetchRereadHistory = async () => {
      try {
        const res = await fetch(`http://localhost:8000/book/${bookid}/rereads`);
        const data = await res.json();
        setRereadHistory(data);
      } catch (err) {
        console.error('Failed to fetch reread history:', err);
      }
    };

    if (bookid) fetchRereadHistory();
  }, [bookid]);

  return (
    <div className="reread-history-table">
  {rereadHistory.length > 0 ? (
    <>
      <h3> <IoArrowRedoCircleSharp style={{marginBottom: '-2px'  }}/> Reread History</h3>
      <table >
        <thead>
          <tr>
            <th >Start Date</th>
            <th >End Date</th>
          </tr>
        </thead>
        <tbody>
          {rereadHistory.map((entry) => (
            <tr key={entry.reread_id}>
             
              <td >{entry.startDate || '-'}</td>
              <td >{entry.endDate || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  ) : (
    <p>No reread history available.</p>
  )}
</div>
  );
};

export default Reread;
