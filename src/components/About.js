import React from "react";
import AboutBackground from "../images/ultralytics-about-background.png";
import AboutImage from "../images/object-detection.png";
import "../style/About.css"


// What is YOLO component
const About = () => {
  const handleClick = () => {
    const url = "https://github.com/ultralytics/ultralytics";

    window.open(url, "_blank");
  };
  return (
    <div className="about-section-container">
      <div className="overlay"></div>
      <div className="about-background-image-container">
        <img className="background-image" src={AboutBackground} alt="" />
      </div>
      <div className="about-section-image-container">
        <img src={AboutImage} alt="" />
      </div>
      <div className="about-section-text-container">
        <p className="primary-subheading">About</p>
        <h1 className="primary-heading">
          What is YOLO?
        </h1>
        <p className="about-primary-text">
          YOLO stands for 'You Only Look Once'. It's an algorithm that detects and recognizes various objects in photos in real-time. The object detection by YOLO is treated as a regression problem, providing class probabilities for the detected images.
        </p>
        <p className="about-primary-text">
          Ultralytics' YOLOv8, released in January 2023, is a model in the YOLO detector series. This website utilizes the model to offer functionality for detecting skin cancer.
        </p>
        <div className="about-buttons-container">
          <button className="secondary-button" onClick={handleClick}>Learn More</button>
        </div>
      </div>
    </div>
  );
};

export default About;
