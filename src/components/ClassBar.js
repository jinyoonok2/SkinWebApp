import React, { useState, useEffect } from "react";
import "../style/ClassBar.css";


// create classbar for predicted class
const ClassBar = (props) => {
  const { label, bgcolor, completed, onClick } = props;
  const [currentLabel, setCurrentLabel] = useState(label);
  const [currentBgColor, setCurrentBgColor] = useState(bgcolor);
  const [currentCompleted, setCurrentCompleted] = useState(completed);

  const handleClick = () => {
    // on click, call onClick func
    onClick(label);
  };

  useEffect(() => {
    setCurrentLabel(label);
    setCurrentBgColor(bgcolor);
    setCurrentCompleted(completed);
  }, [label, bgcolor, completed]);

  const containerStyles = {
    marginBottom: "10px",
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    borderRadius: 20,
  };

  const fillerStyles = {
    height: '100%',
    width: `${currentCompleted}%`,
    backgroundColor: currentBgColor,
    transition: 'width 1s ease-in-out',
    borderRadius: 'inherit',
    textAlign: 'right'
  };

  return (
    <div className="total-container">
      <div style={containerStyles} onClick={handleClick}>
        <p className="label">
          {currentLabel}
        </p>
        <div className="progress-bar">
          <div style={fillerStyles}>
            <span className="percent">{`${currentCompleted}%`}</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ClassBar;
