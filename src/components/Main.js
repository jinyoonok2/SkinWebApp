import React, { useCallback, useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl"; // set backend to webgl
import Webcam from "react-webcam";


import LinearWithValueLabel from "./LinearWithValueLabel";
import Button from '@mui/material/Button';
import ClassBar from "./ClassBar";
import "../style/Main.css";
import { Box, Slider } from "@mui/material";
import { CameraAlt, InsertPhoto } from "@mui/icons-material";
import cancerDescriptions from '../utils/cancer-description';
import cancerNames from '../utils/cancer-list';
import detectFrame from './Detect';


const Main = () => {

    const [loading, setLoading] = useState({ loading: true, progress: 0 });
    const [model, setModel] = useState({
        net: null,
        inputShape: [1, 0, 0, 3],
    });

    const canvasRef = useRef(null);
    const [dict, setDict] = useState({});
    const [myDict, setMyDict] = useState({});
    const [settingVisible, setSettingVisible] = useState(false);
    const [scoreThreshold, setScoreThreshold] = useState(0.5);

    // This is to add name & description
    const [cancerInfo, setCancerInfo] = useState({
        name: "",
        description: "",
        analysisDate: ""
    });
    

    // const modelName = "yolov8n";
    const modelName = "skin";

    useEffect(() => {
        const loadModel = async () => {
            try {
                const currentPath = window.location.href.replace('/main', '');
                const yolov8 = await tf.loadGraphModel(
                    `${currentPath}/${modelName}_web_model/model.json`,
                    {
                        onProgress: (fractions) => {
                            setLoading({ loading: true, progress: fractions });
                        },
                    }
                );
                /* 
                *   tf.randomUniform, use random tensor input
                *   warm up with dummy data
                */
                const dummyInput = tf.randomUniform(yolov8.inputs[0].shape, 0, 1, "float32");
                const warmupResults = yolov8.execute(dummyInput);
                setLoading({ loading: false, progress: 1 });


                // dummy input to get to know the form of print
                setModel({
                    net: yolov8,
                    inputShape: yolov8.inputs[0].shape,
                    outputShape: warmupResults.shape,
                });
                tf.dispose([warmupResults, dummyInput]);
            } catch (error) {
                console.error("모델 로드 중 오류 발생:", error);
                setLoading({ loading: false, progress: 0 });
            }
        };

        // model not loaded yet? load again.
        if (!model.net) {
            tf.ready().then(loadModel);
        }
    }, [model.net]);


    /*
    * detectFrame take the result of the frame(image) as dict and save it to myDict
    * useEffect correct myDict using the values saved in dict.
    */

    /*
    *   use for loop for each of the flowers detected in one image. 
    *   if label already exist, check score and update
    *   if current key does not exist in myDict and not undefined, update to myDict
    */
    useEffect(() => {
        for (const key in dict) {
            const value = dict[key];
            if (key in myDict) {
                if (parseFloat((value.score * 100).toFixed(1)) > myDict[key].score) {
                    setMyDict((prevDict) => ({
                        ...prevDict,
                        [key]: {
                            ...prevDict[key],
                            score: parseFloat((value.score * 100).toFixed(1)),
                            color: value.color,
                        },
                    }));
                }
            } else {
                if (key !== '' && value !== undefined) {
                    setMyDict((prevDict) => ({
                        ...prevDict,
                        [key]: {
                            score: parseFloat((value.score * 100).toFixed(1)),
                            color: value.color,
                        },
                    }));
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dict]);
    
    // image resize function
    const resizeImage = (imageSrc, callback) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = 256;
            canvas.height = 256;
            ctx.drawImage(img, 0, 0, 256, 256);
            callback(canvas.toDataURL("image/jpeg"));
        };
        img.src = imageSrc;
    };

    // handle file change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            resizeImage(url, resizedImage => {
                setImg(resizedImage);
                URL.revokeObjectURL(url); // Clean up the blob URL
            });
        }
    };
    


    /* 
    *   --------------------------------------------------------------------------
    *   react-webcam related Logic
    */
    const [img, setImg] = useState(null);
    const webcamRef = useRef(null);
    const imageElement = new Image();
    const inputImageRef = useRef(null);
    const [selectedClassBar, setSelectedClassBar] = useState(null);

    // 후면카메라 사용
    const videoConstraints = {
        // facingMode: { exact: "environment" },
        facingMode: "environment",
    };

    /* 
    *   use getScreenShot() func to capture from webcam then setting image with useState
    */
    // const capture = useCallback(() => {
    //     const imageSrc = webcamRef.current.getScreenshot();
    //     setImg(imageSrc);
    // }, [webcamRef]);
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        resizeImage(imageSrc, resizedImage => {
            setImg(resizedImage);
        });
    }, [webcamRef]);
    

    const classbar = Object.entries(myDict).map(([key, value]) => (
        <div key={key} style={{ margin: "15px 0" }}>
            <ClassBar
                key={key}
                label={key}
                bgcolor={value.color}
                isSelected={key === selectedClassBar}
                completed={value.score}
                onClick={() => handleClassBarClick(key)} />
        </div>
    ));

    const handleResetMyDict = () => {
        setMyDict({}); // RESET
    };

    const handleClassBarClick = (key) => {
        setSelectedClassBar(key);
    }

    const handleSetting = () => {
        setSettingVisible(!settingVisible);
    };

    const newScoreThreshold = (event, newValue) => {
        setScoreThreshold(newValue);
    };

    return (
        <div className="Main">
            {loading.loading && <LinearWithValueLabel value={parseFloat((loading.progress * 100).toFixed(2))} />}
            <div className="header">
                <h1>Capture or Select Image</h1>
            </div>
            <div className="bg-content">
                <div className="content">
                    {img === null ? (
                        <>
                            <Webcam
                                audio={false}
                                mirrored={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={videoConstraints}
                            />
                        </>
                    ) : (
                        <>
                            <img
                                src={img}
                                alt="screenshot"
                                onLoad={(e) => {
                                    imageElement.src = e.target.src;
                                    detectFrame(imageElement, model, canvasRef.current, setDict)
                                        .then(maxScoreIndex => {
                                            // Use maxScoreIndex to get cancer name and description
                                            const cancerName = cancerNames[maxScoreIndex];
                                            const cancerDescription = cancerDescriptions[maxScoreIndex];

                                            // Update the state with the cancer name, current date/time, and description
                                            setCancerInfo({
                                                name: cancerName,
                                                description: cancerDescription,
                                                analysisDate: new Date().toLocaleString() // Get current date/time as a string
                                            });
                                        })
                                        .catch(error => console.error(error));
                                }}
                            />
                            <canvas width={model.inputShape[1]} height={model.inputShape[2]} ref={canvasRef} />
                        </>
                    )}
                </div>
                <div className="button-set">
                    {img === null ? (
                        <Button
                            variant="contained"
                            color="error"
                            style={{ marginRight: "5px", width: '50%', wordBreak: "keep-all", height: "5rem" }}
                            onClick={capture}
                            startIcon={<CameraAlt />}
                        >
                            Capture</Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="error"
                            style={{ marginRight: "5px", width: '50%', wordBreak: "keep-all", height: "5rem" }}
                            onClick={() => {
                                setImg(null);
                                handleResetMyDict()
                            }}
                            startIcon={<CameraAlt />}
                        >Capture</Button>
                    )}
                    <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    ref={inputImageRef}
                    />

                    <Button
                        variant="contained"
                        style={{ marginRight: "5px", width: '50%', height: "5rem" }}
                        size="medium"
                        onClick={() => { inputImageRef.current.click(); }}
                        width="50%"
                        startIcon={<InsertPhoto />}
                    >Image Selection</Button>
                </div>
                <div className="classbar">
                    {classbar}
                </div>
                {/* Display cancer information */}
                {cancerInfo.name && (
                <div className="cancer-info">
                    <h2>Detection Result</h2>
                    <p><strong>Cancer Type:</strong> {cancerInfo.name}</p>
                    <p><strong>Analysis Date:</strong> {cancerInfo.analysisDate}</p>
                    <p><strong>Description:</strong> {cancerInfo.description}</p>
                </div>
                )}
            </div>
            {settingVisible && (
                <Box sx={{ width: '75%', maxWidth: 500, alignItems: 'center' }}>
                    <Slider
                        aria-label="ScoreThreshold"
                        defaultValue={scoreThreshold}
                        valueLabelDisplay="auto"
                        step={0.05}
                        marks
                        min={0.5}
                        max={0.95}
                        onChange={newScoreThreshold}
                    />
                    <p style={{
                        textAlign: "center",
                        color: "#000000",
                        fontWeight: "bold",
                    }} >ScoreThreshold: {scoreThreshold}</p>
                    <p style={{
                        textAlign: "center",
                        marginBottom: "1rem",
                        color: "#C00000",
                        fontWeight: "bold",
                        wordBreak: "keep-all"
                    }} >* ScoreThreshold is closer to 1, detect more accurate cancer</p>
                </Box>
            )}
            
        </div>
    );
}

export default Main;