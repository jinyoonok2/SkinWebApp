import React from "react";
import ProjectBackground from "../images/about-project-background.png";
import ProjectImage from "../images/project-detection.png";
import "../style/Project.css"


// What is YOLO component
const About = () => {
  const handleClick = () => {
    const url = "https://github.com/jinyoonok2/Skin-Cancer-Detection-Capstone";

    window.open(url, "_blank");
  };
  return (
    <div className="project-section-container">
      <div className="project-overlay"></div>
      <div className="project-background-image-container">
        <img className="background-image" src={ProjectBackground} alt="" />
      </div>
      <div className="project-section-text-container">
        <p className="project-primary-subheading">Project</p>
        <h1 className="project-primary-heading">
          Project Title
        </h1>
        <p className="project-primary-text">
          Project description will be added here1.
        </p>
        <p className="project-primary-text">
          Project description will be added here2.
        </p>
        <div className="project-buttons-container">
          <button className="secondary-button" onClick={handleClick}>Repository</button>
        </div>
      </div>
      <div className="project-section-image-container">
        <img src={ProjectImage} alt="" />
      </div>
    </div>
  );
};

export default About;
