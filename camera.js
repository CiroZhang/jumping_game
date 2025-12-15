export class FaceController {
  static LEFT_THRESHOLD = 0.4;
  static RIGHT_THRESHOLD = 0.6;
  static UP_THRESHOLD = 0.6;

  constructor() {
    this.videoElement = document.getElementById("video");
    this.videoElement.style.display = "none";

    this.inputs = {
      left: false,
      right: false,
      up: false
    };

    this.initializeFaceDetection();
    this.startCamera();
  }

  initializeFaceDetection() {
    this.faceDetection = new FaceDetection({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
    });

    this.faceDetection.setOptions({
      model: "short",
      minDetectionConfidence: 0.5,
    });

    this.faceDetection.onResults((results) => this.handleFaceDetectionResults(results));
  }

  startCamera() {
    this.camera = new window.Camera(this.videoElement, {
      onFrame: async () => {
        await this.faceDetection.send({ image: this.videoElement });
      },
      width: 640,
      height: 480,
    });

    this.camera.start();
  }

  handleFaceDetectionResults(results) {
    // Reset inputs
    this.inputs.left = false;
    this.inputs.right = false;
    this.inputs.up = false;

    if (!results.detections || results.detections.length === 0) return;

    const boundingBox = results.detections[0].boundingBox;
    const faceX = boundingBox.xCenter;
    const faceY = boundingBox.yCenter;

    // Map face position to controls (inverted for natural feel)
    if (faceX < FaceController.LEFT_THRESHOLD) {
      this.inputs.right = true;
    }
    if (faceX > FaceController.RIGHT_THRESHOLD) {
      this.inputs.left = true;
    }
    if (faceY < FaceController.UP_THRESHOLD) {
      this.inputs.up = true;
    }
  }

  getInputs() {
    return this.inputs;
  }
}
