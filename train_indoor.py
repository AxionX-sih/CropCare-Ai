import os
import json
import torch
from torch import nn, optim
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms, models

# =========================
# SETTINGS
# =========================

DATA_DIR = r"dataset\indoor\raw\raw_dataset"
MODEL_DIR = "backend"
MODEL_PATH = os.path.join(MODEL_DIR, "indoor_model.pth")
CLASS_PATH = os.path.join(MODEL_DIR, "indoor_classes.json")

IMAGE_SIZE = 224
BATCH_SIZE = 16
EPOCHS = 5
LEARNING_RATE = 0.0005

# =========================
# DEVICE
# =========================

device = torch.device("cpu")
print("Using device:", device)

# =========================
# TRANSFORMS
# =========================

train_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ColorJitter(
        brightness=0.2,
        contrast=0.2,
        saturation=0.2
    ),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])

val_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])

# =========================
# LOAD DATASET
# =========================

print("\nLoading dataset...")

full_dataset = datasets.ImageFolder(
    DATA_DIR,
    transform=train_transform
)

print("Total images:", len(full_dataset))
print("Classes:", full_dataset.classes)

# Save class names
os.makedirs(MODEL_DIR, exist_ok=True)

with open(CLASS_PATH, "w", encoding="utf-8") as f:
    json.dump(full_dataset.classes, f, indent=2)

# =========================
# TRAIN / VALIDATION SPLIT
# =========================

train_size = int(0.8 * len(full_dataset))
val_size = len(full_dataset) - train_size

generator = torch.Generator().manual_seed(42)

train_dataset, val_dataset = random_split(
    full_dataset,
    [train_size, val_size],
    generator=generator
)

# Use validation transforms
val_dataset.dataset.transform = val_transform

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0
)

print("\nTraining images:", len(train_dataset))
print("Validation images:", len(val_dataset))

# =========================
# MODEL
# =========================

print("\nLoading MobileNetV3...")

model = models.mobilenet_v3_small(
    weights=models.MobileNet_V3_Small_Weights.DEFAULT
)

# Freeze most of the pretrained network
for param in model.features.parameters():
    param.requires_grad = False

# Replace classifier
input_features = model.classifier[3].in_features

model.classifier[3] = nn.Linear(
    input_features,
    len(full_dataset.classes)
)

model = model.to(device)

# =========================
# LOSS + OPTIMIZER
# =========================

criterion = nn.CrossEntropyLoss()

optimizer = optim.Adam(
    model.classifier[3].parameters(),
    lr=LEARNING_RATE
)

# =========================
# TRAINING
# =========================

best_accuracy = 0.0

print("\nStarting training...\n")

for epoch in range(EPOCHS):

    model.train()

    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in train_loader:

        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(outputs, labels)

        loss.backward()

        optimizer.step()

        running_loss += loss.item()

        _, predicted = torch.max(outputs, 1)

        total += labels.size(0)
        correct += (predicted == labels).sum().item()

    train_accuracy = 100 * correct / total

    # =========================
    # VALIDATION
    # =========================

    model.eval()

    val_correct = 0
    val_total = 0

    with torch.no_grad():

        for images, labels in val_loader:

            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)

            _, predicted = torch.max(outputs, 1)

            val_total += labels.size(0)
            val_correct += (predicted == labels).sum().item()

    val_accuracy = 100 * val_correct / val_total

    print(
        f"Epoch {epoch + 1}/{EPOCHS} | "
        f"Loss: {running_loss / len(train_loader):.4f} | "
        f"Train Acc: {train_accuracy:.2f}% | "
        f"Val Acc: {val_accuracy:.2f}%"
    )

    # Save best model
    if val_accuracy > best_accuracy:

        best_accuracy = val_accuracy

        torch.save(
            model.state_dict(),
            MODEL_PATH
        )

        print("  ✓ Best model saved!")

print("\n==============================")
print("TRAINING COMPLETE")
print("==============================")
print("Best validation accuracy:", f"{best_accuracy:.2f}%")
print("Model:", MODEL_PATH)
print("Classes:", CLASS_PATH)