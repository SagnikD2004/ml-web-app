from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from tensorflow.keras.utils import img_to_array   # type: ignore
from PIL import Image
import io
import numpy as np
import tensorflow as tf

app = FastAPI()


model = tf.keras.models.load_model("model.keras")

class_name = ["Early Blight", "Late Blight", "Healthy"]

@app.post("/predict")
async def predict_image(request: Request):
    try:
        image_bytes = await request.body()

        # Load and preprocess image
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_array = img_to_array(image)
        img_array = tf.expand_dims(img_array, axis=0)

        # Predict
        predictions = model.predict(img_array)
        predicted_class = class_name[np.argmax(predictions[0])]
        confidence = round(100 * np.max(predictions[0]), 2)

        return JSONResponse(content={
            "class": predicted_class,
            "confidence": confidence
        })

    except Exception as e:
        print("Prediction error:", e)
        return JSONResponse(status_code=500, content={"error": "Prediction failed"})
