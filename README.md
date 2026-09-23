# CropCare AI

## What works in this website


- CropCare AI redesigned frontend
- Image upload
- Camera capture
- Plant/category selection
- AI image classification using the existing PlantVillage ViT model
- Top predictions returned by Flask
- Local prediction history through `/predict` and `/history`
- Basic `/chat` assistant endpoint
- Browser text-to-speech and voice input
- Multilingual UI foundation

## Important model limitation

The current model is the existing:
`kimcomehome/plantvillage-vit-leaf-disease`

Adding a plant to the website's dropdown does **not** teach the model that plant. A later training step is required to expand recognition to additional crops, outdoor plants and indoor plants.

## Run locally

1. Create/activate a Python virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Start Flask:

```bash
python app.py
```

4. Open the local Flask address shown in the terminal.

The first image analysis may take longer because the Hugging Face model has to be downloaded/loaded.

## Next build step

Create a proper expanded dataset/training pipeline and connect the disease knowledge base to the model's actual class labels.
