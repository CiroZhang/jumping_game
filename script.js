import { Environment } from "./environment.js";
import { FaceController } from "./camera.js";


const environment = new Environment();
const faceController = new FaceController();


function gameLoop() {
  const inputs = faceController.getInputs();
  environment.handleInput(inputs);
  environment.update();
  requestAnimationFrame(gameLoop);
}


gameLoop();
