from io import BytesIO
from pathlib import PurePosixPath

from django.core.files.base import ContentFile
from PIL import Image, ImageOps


VARIANT_WIDTHS = (160, 320, 640, 960, 1280)


def variant_name(image_name, width):
    path = PurePosixPath(image_name)
    return str(path.with_name(f"{path.stem}-{width}.webp"))


def create_image_variants(field_file):
    """Write responsive WebP derivatives beside an uploaded image."""
    if not field_file:
        return

    storage = field_file.storage
    with storage.open(field_file.name, "rb") as original:
        with Image.open(original) as source:
            image = ImageOps.exif_transpose(source)
            has_alpha = image.mode in {"RGBA", "LA"} or "transparency" in image.info
            image = image.convert("RGBA" if has_alpha else "RGB")
            source_width = image.width

            for width in VARIANT_WIDTHS:
                name = variant_name(field_file.name, width)
                if source_width <= width:
                    if storage.exists(name):
                        storage.delete(name)
                    continue

                derivative = image.copy()
                derivative.thumbnail((width, width), Image.Resampling.LANCZOS)
                output = BytesIO()
                derivative.save(output, format="WEBP", quality=82, method=6)
                if storage.exists(name):
                    storage.delete(name)
                storage.save(name, ContentFile(output.getvalue()))


def image_srcset(field_file):
    """Return only the WebP variants that exist for an uploaded image."""
    if not field_file:
        return ""

    storage = field_file.storage
    candidates = []
    for width in VARIANT_WIDTHS:
        name = variant_name(field_file.name, width)
        if storage.exists(name):
            candidates.append(f"{storage.url(name)} {width}w")
    return ", ".join(candidates)
