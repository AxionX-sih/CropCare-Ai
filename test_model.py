from transformers import pipeline
from PIL import Image

MODEL_NAME = "kimcomehome/plantvillage-vit-leaf-disease"

print("Loading PlantVillage AI model...")

classifier = pipeline(
    "image-classification",
    model=MODEL_NAME
)

print("Model loaded successfully!")

print("Opening test image...")

image = Image.open("test_leaf.jpg").convert("RGB")

print("Analyzing test image...")

results = classifier(
    image,
    top_k=5
)

print("\nPredictions:")

for result in results:
    label = result["label"].replace("___", " - ").replace("_", " ")
    confidence = result["score"] * 100

    print(f"{label} -> {confidence:.2f}%")