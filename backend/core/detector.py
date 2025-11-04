import tensorflow as tf
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import numpy as np
from pathlib import Path

# Load the model once when the app starts
MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "brain_tumor_model.h5"
print(f"Loading model from: {MODEL_PATH}")
model = tf.keras.models.load_model(MODEL_PATH)

IMG_HEIGHT, IMG_WIDTH = 128, 128  # must match model training size

def predict(image_path: str):
    """
    Predict tumor presence in a brain scan image.
    Args:
        image_path (str): Path to the uploaded image
    Returns:
        tuple[str, float]: (label, confidence)
    """

    img = load_img(image_path, target_size=(IMG_HEIGHT, IMG_WIDTH))
    img_array = img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0  # normalize

    # Model outputs a single sigmoid value (0 = healthy, 1 = tumor)
    prediction = model.predict(img_array)[0][0]
    confidence = float(prediction if prediction > 0.5 else 1 - prediction)

    if prediction > 0.5:
        return "Tumor Detected", confidence
    else:
        return "Healthy", confidence
