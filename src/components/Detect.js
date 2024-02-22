import * as tf from '@tensorflow/tfjs';
import { renderBoxes, Colors } from "../utils/renderBox";
import labels from "../utils/labels.json";

const numClass = labels.length;
const colors = new Colors();

// Image preprocess before model detection
const preprocess = (source, modelWidth, modelHeight) => {
    let xRatio, yRatio; // 바운딩 박스 비율

    const input = tf.tidy(() => {
        const img = tf.browser.fromPixels(source);

        // 이미지를 사각형으로 패딩 => [n, m] to [n, n], n > m
        const [h, w] = img.shape.slice(0, 2); // 너비와 높이 추출
        const maxSize = Math.max(w, h);

    // 이미지 크기가 모델의 입력 크기보다 크거나 같도록 확인
    if (maxSize > modelWidth || maxSize > modelHeight) {
        throw new Error("Image size exceeds model input size");
    }

        const imgPadded = img.pad([
            [0, maxSize - h], // padding y [아래쪽으로만]
            [0, maxSize - w], // padding x [오른쪽으로만]
            [0, 0],
        ]);

        xRatio = maxSize / w;
        yRatio = maxSize / h;

        return tf.image
            .resizeBilinear(imgPadded, [modelWidth, modelHeight]) // 프레임 resize
            .div(255.0) // 정규화
            .expandDims(0); // add batch
    });

    return [input, xRatio, yRatio];
};

// ** IMAGE DETECTION FUNCTION
const detectFrame = async (source, model, canvasRef, setDict, callback = () => { }) => {

    // TAKE MODEL WIDTH AND HEIGHT
    const [modelHeight, modelWidth] = model.inputShape.slice(1, 3);

    // start scoping tf engine
    tf.engine().startScope();

    const [input, xRatio, yRatio] = preprocess(source, modelWidth, modelHeight); // 이미지 전처리 (모델 크기에 맞게 이미지 리사이즈)
    const res = model.net.execute(input); // 모델 실행
    const transRes = tf.tidy(() => res.transpose([0, 2, 1]).squeeze()); // transpose main result

    //  바운딩 박스들 얻기 [y1, x1, y2, x2]
    const boxes = tf.tidy(() => {
        const w = transRes.slice([0, 2], [-1, 1]);
        const h = transRes.slice([0, 3], [-1, 1]);
        const x1 = tf.sub(transRes.slice([0, 0], [-1, 1]), tf.div(w, 2)); 
        const y1 = tf.sub(transRes.slice([0, 1], [-1, 1]), tf.div(h, 2)); 
        return tf
            .concat(
                [
                    y1,
                    x1,
                    tf.add(y1, h), //y2
                    tf.add(x1, w), //x2
                ],
                1
            ) // [y1, x1, y2, x2]
            .squeeze(); // [n, 4]
    });

    
    // 1. Instead of directly applying NMS to all detections, first separate detections by class
    const [allScores, allClasses] = tf.tidy(() => {
        const rawScores = transRes.slice([0, 4], [-1, -1]).squeeze(); // Adjusted to get all classes
        return [rawScores, rawScores.argMax(1)];
    });

    // Separate boxes and scores by class
    let filteredBoxes = [];
    let filteredScores = [];
    let filteredClasses = [];
    const numClasses = allScores.shape[1]; // Assuming number of classes is the second dimension of allScores

    for (let i = 0; i < numClasses; i++) {
        const classScores = allScores.transpose().gather(i).squeeze(); // Get scores for class i
        const classBoxes = boxes; // Use all boxes as we filter by score after NMS

        // Apply NMS for class i
        /*
        * Tensorflow.js NMS, remove duplicated boxes from the detections
        */
        const nmsIndices = await tf.image.nonMaxSuppressionAsync(
            classBoxes, classScores, 10, 0.45, 0.01 //last one is confidence threshold
        );

        // Filter boxes, scores, and add class index for NMS results
        const nmsBoxes = classBoxes.gather(nmsIndices);
        const nmsScores = classScores.gather(nmsIndices);
        const nmsClasses = tf.fill([nmsIndices.size], i); // Create a tensor filled with the class index

        // Collect filtered results
        filteredBoxes.push(nmsBoxes);
        filteredScores.push(nmsScores);
        filteredClasses.push(nmsClasses);
    }

    // Concatenate filtered results from all classes
    const finalBoxes = tf.concat(filteredBoxes);
    const finalScores = tf.concat(filteredScores);
    const finalClasses = tf.concat(filteredClasses);

    // Conversion to array for further processing
    const boxesArray = await finalBoxes.array();
    const scoresArray = await finalScores.array();
    const classesArray = await finalClasses.array();

    // Logging detections
    scoresArray.forEach((score, index) => {
        const classIndex = classesArray[index];
        console.log(`Class ${classIndex}: Score=${score.toFixed(2)}`);
    });

    // Time to draw boxes
    const toDraw = [];
    let value = {};

    for (let i = 0; i < boxesArray.length; i++) {
        const [y1, x1, y2, x2] = boxesArray[i];
        const score = scoresArray[i];
        const label = classesArray[i]; // The class index now directly from our NMS filtered arrays
        const color = colors.get(label);

        const upSampleBox = [
            Math.floor(y1 * yRatio),
            Math.floor(x1 * xRatio),
            Math.round((y2 - y1) * yRatio),
            Math.round((x2 - x1) * xRatio),
        ];

        toDraw.push({
            box: upSampleBox,
            score: score,
            class: label,
            label: labels[label],
            color: color,
        });

        // The next line leverages the pattern of variable re-use, here promoting or highlighting the best confidence
        if (!value.hasOwnProperty(labels[label]) || value[labels[label]].score < score) {
            value[labels[label]] = {
                score: score,
                color: color,
            };
        }
    }

    // scoresArray is already populated with scores from all detections
    const maxScoreIndex = scoresArray.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);


    setDict(value);

    const ctx = canvasRef.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const highestConfidenceBox = toDraw[maxScoreIndex];
    renderBoxes(ctx, [highestConfidenceBox]); // Wrap in array

    tf.engine().endScope(); // Rounding out the work from the inner function to tidy up

    // Return maxScoreIndex
    return maxScoreIndex;
};

export default detectFrame;