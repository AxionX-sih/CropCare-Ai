import os
import json
import random
from pathlib import Path

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import models, transforms
from PIL import Image


# ============================================================
# CROPCARE AI
# PlantDoc + PlantWild Training
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

PLANTDOC_DIR = BASE_DIR / "dataset" / "crops" / "plantdoc"
PLANTWILD_DIR = (
    BASE_DIR
    / "dataset"
    / "crops"
    / "plantwild"
    / "data"
    / "plantwild_v2"
)

BACKEND_DIR = BASE_DIR / "backend"

MODEL_PATH = BACKEND_DIR / "plantdoc_plantwild_model.pth"
CLASS_PATH = BACKEND_DIR / "plantdoc_plantwild_classes.json"

IMAGE_SIZE = 224
BATCH_SIZE = 16
EPOCHS = 3
LEARNING_RATE = 0.0005

VAL_SPLIT = 0.15
SEED = 42

# CPU-friendly limit.
# Set to None later if you want to train on every image.
MAX_IMAGES_PER_CLASS = 250


# ============================================================
# DEVICE
# ============================================================

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("=" * 60)
print("CropCare AI - PlantDoc + PlantWild Training")
print("=" * 60)

print("Device:", device)

if device.type == "cuda":
    print("CUDA is available.")
else:
    print("CPU mode.")
    print("This will take longer than GPU training.")


# ============================================================
# RANDOM SEED
# ============================================================

random.seed(SEED)
torch.manual_seed(SEED)

if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)


# ============================================================
# IMAGE EXTENSIONS
# ============================================================

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".webp"
}


# ============================================================
# CLEAN CLASS NAME
# ============================================================

def clean_class_name(name):
    """
    Convert dataset folder names into readable labels.
    """

    name = str(name)

    name = name.replace("_", " ")
    name = name.replace("-", " ")

    name = " ".join(name.split())

    return name.strip()


# ============================================================
# COLLECT IMAGES
# ============================================================

def collect_images():
    samples = []

    # --------------------------------------------------------
    # PlantDoc
    # --------------------------------------------------------

    print()
    print("Scanning PlantDoc...")

    plantdoc_count = 0

    if not PLANTDOC_DIR.exists():
        raise FileNotFoundError(
            f"PlantDoc folder not found:\n{PLANTDOC_DIR}"
        )

    # PlantDoc has train/test directories.
    for split_name in ["train", "test"]:

        split_dir = PLANTDOC_DIR / split_name

        if not split_dir.exists():
            continue

        for class_dir in sorted(split_dir.iterdir()):

            if not class_dir.is_dir():
                continue

            # Ignore the duplicate folder.
            if class_dir.name.lower() == "duplicates":
                continue

            label = clean_class_name(class_dir.name)

            files = []

            for file in class_dir.rglob("*"):

                if (
                    file.is_file()
                    and file.suffix.lower() in IMAGE_EXTENSIONS
                ):
                    files.append(file)

            random.shuffle(files)

            if MAX_IMAGES_PER_CLASS is not None:
                files = files[:MAX_IMAGES_PER_CLASS]

            for file in files:
                samples.append(
                    (str(file), label, "PlantDoc")
                )

                plantdoc_count += 1

    print("PlantDoc images:", plantdoc_count)

    # --------------------------------------------------------
    # PlantWild
    # --------------------------------------------------------

    print()
    print("Scanning PlantWild...")

    plantwild_count = 0

    if not PLANTWILD_DIR.exists():
        raise FileNotFoundError(
            f"PlantWild folder not found:\n{PLANTWILD_DIR}"
        )

    for class_dir in sorted(PLANTWILD_DIR.iterdir()):

        if not class_dir.is_dir():
            continue

        label = clean_class_name(class_dir.name)

        files = []

        for file in class_dir.rglob("*"):

            if (
                file.is_file()
                and file.suffix.lower() in IMAGE_EXTENSIONS
            ):
                files.append(file)

        random.shuffle(files)

        if MAX_IMAGES_PER_CLASS is not None:
            files = files[:MAX_IMAGES_PER_CLASS]

        for file in files:
            samples.append(
                (str(file), label, "PlantWild")
            )

            plantwild_count += 1

    print("PlantWild images:", plantwild_count)

    return samples


# ============================================================
# LOAD DATA
# ============================================================

samples = collect_images()

if not samples:
    raise RuntimeError(
        "No images were found in PlantDoc or PlantWild."
    )

print()
print("=" * 60)
print("Total images:", len(samples))
print("=" * 60)


# ============================================================
# BUILD CLASS LIST
# ============================================================

classes = sorted(
    list(
        set(
            sample[1]
            for sample in samples
        )
    )
)

class_to_index = {
    name: index
    for index, name in enumerate(classes)
}

print("Number of classes:", len(classes))

print()
print("First classes:")

for name in classes[:30]:
    print(" -", name)

if len(classes) > 30:
    print(" ...")


# ============================================================
# TRAIN / VALIDATION SPLIT
# ============================================================

random.shuffle(samples)

validation_count = int(
    len(samples) * VAL_SPLIT
)

validation_samples = samples[:validation_count]
training_samples = samples[validation_count:]

print()
print("Training images:", len(training_samples))
print("Validation images:", len(validation_samples))


# ============================================================
# TRANSFORMS
# ============================================================

train_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),

    transforms.RandomHorizontalFlip(),

    transforms.RandomRotation(10),

    transforms.ColorJitter(
        brightness=0.15,
        contrast=0.15,
        saturation=0.15
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


# ============================================================
# DATASET
# ============================================================

class PlantDataset(Dataset):

    def __init__(
        self,
        samples,
        class_to_index,
        transform=None
    ):

        self.samples = samples
        self.class_to_index = class_to_index
        self.transform = transform

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, index):

        path, label, source = self.samples[index]

        try:
            image = Image.open(path).convert("RGB")

        except Exception:
            # If an image is broken, try another image.
            new_index = random.randint(
                0,
                len(self.samples) - 1
            )

            return self.__getitem__(new_index)

        if self.transform:
            image = self.transform(image)

        target = self.class_to_index[label]

        return image, target


# ============================================================
# DATASETS
# ============================================================

train_dataset = PlantDataset(
    training_samples,
    class_to_index,
    train_transform
)

val_dataset = PlantDataset(
    validation_samples,
    class_to_index,
    val_transform
)


# ============================================================
# DATALOADERS
# ============================================================

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


# ============================================================
# MODEL
# ============================================================

print()
print("Loading MobileNetV3 Small...")

weights = models.MobileNet_V3_Small_Weights.DEFAULT

model = models.mobilenet_v3_small(
    weights=weights
)


# ============================================================
# FREEZE BACKBONE
# ============================================================

for parameter in model.features.parameters():
    parameter.requires_grad = False


# ============================================================
# REPLACE CLASSIFIER
# ============================================================

input_features = model.classifier[3].in_features

model.classifier[3] = nn.Linear(
    input_features,
    len(classes)
)

model = model.to(device)


# ============================================================
# LOSS
# ============================================================

criterion = nn.CrossEntropyLoss()


# ============================================================
# OPTIMIZER
# ============================================================

optimizer = torch.optim.Adam(
    model.classifier.parameters(),
    lr=LEARNING_RATE
)


# ============================================================
# TRAINING FUNCTION
# ============================================================

def train_one_epoch():

    model.train()

    total_loss = 0.0
    correct = 0
    total = 0

    for batch_index, (images, labels) in enumerate(
        train_loader
    ):

        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(
            outputs,
            labels
        )

        loss.backward()

        optimizer.step()

        total_loss += loss.item()

        predictions = outputs.argmax(
            dim=1
        )

        correct += (
            predictions == labels
        ).sum().item()

        total += labels.size(0)

        if (batch_index + 1) % 50 == 0:

            print(
                f"  Batch {batch_index + 1}"
                f"/{len(train_loader)}"
            )

    average_loss = (
        total_loss / len(train_loader)
    )

    accuracy = (
        correct / total
    ) * 100

    return average_loss, accuracy


# ============================================================
# VALIDATION FUNCTION
# ============================================================

def validate():

    model.eval()

    correct = 0
    total = 0

    total_loss = 0.0

    with torch.no_grad():

        for images, labels in val_loader:

            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)

            loss = criterion(
                outputs,
                labels
            )

            total_loss += loss.item()

            predictions = outputs.argmax(
                dim=1
            )

            correct += (
                predictions == labels
            ).sum().item()

            total += labels.size(0)

    average_loss = (
        total_loss / len(val_loader)
    )

    accuracy = (
        correct / total
    ) * 100

    return average_loss, accuracy


# ============================================================
# TRAIN
# ============================================================

best_accuracy = 0.0

print()
print("=" * 60)
print("STARTING TRAINING")
print("=" * 60)

for epoch in range(EPOCHS):

    print()
    print(
        f"Epoch {epoch + 1}/{EPOCHS}"
    )

    print("-" * 40)

    train_loss, train_accuracy = (
        train_one_epoch()
    )

    val_loss, val_accuracy = validate()

    print()
    print(
        f"Train Loss: {train_loss:.4f}"
    )

    print(
        f"Train Accuracy: "
        f"{train_accuracy:.2f}%"
    )

    print(
        f"Validation Loss: "
        f"{val_loss:.4f}"
    )

    print(
        f"Validation Accuracy: "
        f"{val_accuracy:.2f}%"
    )

    # --------------------------------------------------------
    # SAVE BEST MODEL
    # --------------------------------------------------------

    if val_accuracy > best_accuracy:

        best_accuracy = val_accuracy

        print()
        print(
            "New best model!"
        )

        torch.save(
            model.state_dict(),
            MODEL_PATH
        )


# ============================================================
# SAVE CLASS NAMES
# ============================================================

BACKEND_DIR.mkdir(
    parents=True,
    exist_ok=True
)

with open(
    CLASS_PATH,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        classes,
        file,
        indent=2,
        ensure_ascii=False
    )


# ============================================================
# FINISHED
# ============================================================

print()
print("=" * 60)
print("TRAINING COMPLETE")
print("=" * 60)

print(
    f"Best validation accuracy: "
    f"{best_accuracy:.2f}%"
)

print()
print("Model saved to:")
print(MODEL_PATH)

print()
print("Classes saved to:")
print(CLASS_PATH)

print()
print("PlantDoc + PlantWild model is ready.")