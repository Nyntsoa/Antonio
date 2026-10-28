from django.core.cache import cache
from django.test import TestCase, override_settings
from django.urls import reverse
from .models import Category, ContactMessage, Project

class PortfolioPagesTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Site vitrine", slug="site-vitrine")
        self.published = Project.objects.create(
            title="Projet publié", slug="projet-publie", category=self.category,
            summary="Un exemple publié.", status=Project.Status.PUBLISHED,
        )
        self.draft = Project.objects.create(
            title="Projet brouillon", slug="projet-brouillon", category=self.category,
            summary="Un exemple privé.", status=Project.Status.DRAFT,
        )

    def test_main_pages_render(self):
        for name in ("home", "about", "project_list", "services", "contact", "legal"):
            with self.subTest(page=name):
                self.assertEqual(self.client.get(reverse(name)).status_code, 200)
        self.assertEqual(self.client.get(reverse("project_detail", args=[self.published.slug])).status_code, 200)

    def test_sitemap_contains_published_projects_only(self):
        response = self.client.get(reverse("django.contrib.sitemaps.views.sitemap"))
        self.assertContains(response, self.published.get_absolute_url())
        self.assertNotContains(response, self.draft.get_absolute_url())

    def test_drafts_are_not_visible(self):
        self.assertContains(self.client.get(reverse("project_list")), "Projet publié")
        self.assertNotContains(self.client.get(reverse("project_list")), "Projet brouillon")
        self.assertEqual(self.client.get(reverse("project_detail", args=[self.draft.slug])).status_code, 404)

    @override_settings(DEBUG=False)
    def test_custom_404_page(self):
        response = self.client.get("/page-inconnue/")
        self.assertEqual(response.status_code, 404)
        self.assertContains(response, "Cette page", status_code=404)

    def test_category_filter_shows_matching_projects(self):
        response = self.client.get(reverse("project_list"), {"category": self.category.slug})
        self.assertContains(response, "Projet publié")
        self.assertNotContains(response, "Projet brouillon")

    def test_contact_valid_and_invalid_submissions(self):
        url = reverse("contact_submit")
        valid = {"name": "Samira", "email": "samira@example.com", "subject": "Un projet web", "message": "Bonjour, je souhaite échanger au sujet de mon site web."}
        response = self.client.post(url, valid)
        self.assertRedirects(response, reverse("contact"))
        self.assertEqual(ContactMessage.objects.count(), 1)
        invalid = {**valid, "email": "pas-une-adresse", "message": "Court"}
        response = self.client.post(url, invalid)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(ContactMessage.objects.count(), 1)

    def test_contact_honeypot_is_rejected(self):
        response = self.client.post(reverse("contact_submit"), {
            "name": "Bot", "email": "bot@example.com", "subject": "Spam",
            "message": "Message assez long pour satisfaire la validation.", "website": "spam.example",
        })
        self.assertEqual(response.status_code, 400)
        self.assertEqual(ContactMessage.objects.count(), 0)

    def tearDown(self):
        cache.clear()
