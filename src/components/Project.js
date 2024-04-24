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
        <h1 className="project-primary-heading">
          Enhanced Architecture with Advanced Image Processing and Integration of Feature Modules
        </h1>
        <p className="project-primary-text">
          The Image Processing stage of the research successfully removes confounding factors from the skin lesion image data to correct model comprehension of the input and improve accuracy.
        </p>
        <p className="project-primary-text">
          The Modular Modification stage of the research enhances the accuracy and generalization of model performance by integrating new feature modules, such as BiFPN, into the original YOLOv8 architecture.
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
