from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.db import models
from django.urls import reverse
from django.utils.functional import cached_property
from .image_variants import create_image_variants, image_srcset

IMAGE_VALIDATOR = FileExtensionValidator(["jpg", "jpeg", "png", "webp"])
DOC_VALIDATOR = FileExtensionValidator(["pdf"])
DEMO_IMAGE_ASSETS = {
    "tsarakaly": "portfolio_site/images/projects/tsarakaly",
    "mada-market": "portfolio_site/images/projects/mada-market",
    "gilasy": "portfolio_site/images/projects/gilasy",
    "vakansy-mada": "portfolio_site/images/projects/vakansy-mada",
}
DEMO_IMAGE_WIDTHS = (320, 640, 960, 1440)

def validate_upload_size(file):
    if file.size > 5 * 1024 * 1024:
        raise ValidationError("Le fichier ne doit pas dépasser 5 Mo.")

def validate_pdf(file):
    position = file.tell()
    file.seek(0)
    signature = file.read(5)
    file.seek(position)
    if signature != b"%PDF-":
        raise ValidationError("Le fichier doit être un document PDF valide.")

class Category(models.Model):
    name = models.CharField("nom", max_length=80, unique=True)
    slug = models.SlugField(unique=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]
        verbose_name = "catégorie"
        verbose_name_plural = "catégories"

    def __str__(self):
        return self.name

class Project(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Brouillon"
        PUBLISHED = "published", "Publié"

    title = models.CharField("titre", max_length=140)
    slug = models.SlugField(unique=True)
    category = models.ForeignKey(Category, verbose_name="catégorie", on_delete=models.PROTECT, related_name="projects")
    summary = models.CharField("résumé", max_length=240)
    live_url = models.URLField("lien du site", blank=True, help_text="Adresse publique du projet, si disponible.")
    context = models.TextField("contexte", blank=True)
    objective = models.TextField("objectif", blank=True)
    role = models.TextField("rôle", blank=True)
    work_done = models.TextField("travail réalisé", blank=True)
    tools = models.CharField("outils utilisés", max_length=300, blank=True, help_text="Séparez les outils par des virgules.")
    results = models.TextField("résultats", blank=True, help_text="À renseigner uniquement avec des résultats vérifiables.")
    cover = models.ImageField("visuel principal", upload_to="projects/", validators=[IMAGE_VALIDATOR, validate_upload_size], blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.DRAFT)
    featured = models.BooleanField("sélection accueil", default=False)
    order = models.PositiveSmallIntegerField("ordre", default=0)
    demo_label = models.CharField("mention de démonstration", max_length=100, blank=True, help_text="Utilisez « Projet de démonstration » pour un contenu fictif.")
    seo_title = models.CharField(max_length=65, blank=True)
    seo_description = models.CharField(max_length=160, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "-created_at"]
        verbose_name = "projet"
        verbose_name_plural = "projets"

    def __str__(self):
        return self.title

    @cached_property
    def cover_srcset(self):
        return image_srcset(self.cover)

    def save(self, *args, **kwargs):
        self.__dict__.pop("cover_srcset", None)
        self.__dict__.pop("demo_image_url", None)
        self.__dict__.pop("demo_image_srcset", None)
        new_cover = bool(self.cover and getattr(self.cover, "_file", None))
        super().save(*args, **kwargs)
        if new_cover:
            create_image_variants(self.cover)

    def get_absolute_url(self):
        return reverse("project_detail", kwargs={"slug": self.slug})

    @property
    def tool_list(self):
        return [item.strip() for item in self.tools.split(",") if item.strip()]

    @cached_property
    def demo_image_url(self):
        from django.templatetags.static import static
        asset = DEMO_IMAGE_ASSETS.get(self.slug)
        if asset:
            return static(f"{asset}-960.webp")
        illustrations = {
            "site-vitrine-cafe": "images/demo-site-vitrine-cafe.svg",
            "boutique-artisanale": "images/demo-boutique-artisanale.svg",
            "tableau-de-bord-associatif": "images/demo-tableau-de-bord-associatif.svg",
        }
        illustration = illustrations.get(self.slug)
        return static(illustration) if illustration else ""

    @cached_property
    def demo_image_srcset(self):
        from django.templatetags.static import static
        asset = DEMO_IMAGE_ASSETS.get(self.slug)
        if not asset:
            return ""
        return ", ".join(
            f"{static(f'{asset}-{width}.webp')} {width}w"
            for width in DEMO_IMAGE_WIDTHS
        )

class ProjectImage(models.Model):
    project = models.ForeignKey(Project, verbose_name="projet", on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="projects/gallery/", validators=[IMAGE_VALIDATOR, validate_upload_size])
    alt_text = models.CharField("texte alternatif", max_length=180)
    caption = models.CharField("légende", max_length=180, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "pk"]
        verbose_name = "visuel de projet"
        verbose_name_plural = "visuels de projet"

    def __str__(self):
        return self.caption or self.project.title

    @cached_property
    def image_srcset(self):
        return image_srcset(self.image)

    def save(self, *args, **kwargs):
        self.__dict__.pop("image_srcset", None)
        new_image = bool(self.image and getattr(self.image, "_file", None))
        super().save(*args, **kwargs)
        if new_image:
            create_image_variants(self.image)

class Service(models.Model):
    title = models.CharField("offre", max_length=120)
    description = models.TextField("description")
    order = models.PositiveSmallIntegerField(default=0)
    active = models.BooleanField("afficher", default=True)

    class Meta:
        ordering = ["order", "title"]
        verbose_name = "service"
        verbose_name_plural = "services"

    def __str__(self):
        return self.title

class Skill(models.Model):
    name = models.CharField("compétence", max_length=80)
    group = models.CharField("domaine", max_length=80, blank=True)
    order = models.PositiveSmallIntegerField(default=0)
    active = models.BooleanField("afficher", default=True)

    class Meta:
        ordering = ["order", "name"]
        verbose_name = "compétence"
        verbose_name_plural = "compétences"

    def __str__(self):
        return self.name

class SiteProfile(models.Model):
    name = models.CharField("nom", max_length=120, default="AMBININTSOA Antonio")
    profession = models.CharField("métier", max_length=120, default="Développeur web")
    intro = models.TextField("présentation", blank=True)
    journey = models.TextField("parcours", blank=True)
    email = models.EmailField("e-mail", blank=True)
    phone = models.CharField("téléphone", max_length=40, blank=True)
    location = models.CharField("localisation", max_length=100, blank=True)
    github_url = models.URLField("GitHub", blank=True)
    linkedin_url = models.URLField("LinkedIn", blank=True)
    photo = models.ImageField("photo", upload_to="profile/", validators=[IMAGE_VALIDATOR, validate_upload_size], blank=True)
    cv = models.FileField("CV (PDF)", upload_to="cv/", validators=[DOC_VALIDATOR, validate_upload_size, validate_pdf], blank=True)
    legal_notice = models.TextField("mentions légales", blank=True, help_text="À compléter avant publication.")
    privacy_notice = models.TextField("confidentialité", blank=True, help_text="À compléter avant publication.")
    seo_title = models.CharField("titre SEO", max_length=65, blank=True)
    seo_description = models.CharField("description SEO", max_length=160, blank=True)

    class Meta:
        verbose_name = "profil du site"
        verbose_name_plural = "profil du site"

    def __str__(self):
        return self.name

    @cached_property
    def photo_srcset(self):
        return image_srcset(self.photo)

    def save(self, *args, **kwargs):
        self.__dict__.pop("photo_srcset", None)
        self.pk = 1
        super().save(*args, **kwargs)
        if self.photo and getattr(self.photo, "_file", None):
            create_image_variants(self.photo)

    @classmethod
    def get_solo(cls):
        return cls.objects.first() or cls.objects.create()

class ContactMessage(models.Model):
    name = models.CharField("nom", max_length=100)
    email = models.EmailField("e-mail")
    subject = models.CharField("objet", max_length=140)
    message = models.TextField("message", max_length=5000)
    created_at = models.DateTimeField("reçu le", auto_now_add=True)
    is_read = models.BooleanField("lu", default=False)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "message reçu"
        verbose_name_plural = "messages reçus"

    def __str__(self):
        return f"{self.subject} — {self.name}"
