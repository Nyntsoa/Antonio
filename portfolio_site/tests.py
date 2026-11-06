from django.core.cache import cache
from django.test import TestCase, override_settings
from django.urls import reverse
from .models import Category, ContactMessage, Project

class PortfolioPagesTests(TestCase):
    def setUp(self):
        self.category, _ = Category.objects.get_or_create(
            slug="site-vitrine", defaults={"name": "Site vitrine"},
        )
        self.published = Project.objects.create(
            title="Projet publié", slug="projet-publie", category=self.category,
            summary="Un exemple publié.", status=Project.Status.PUBLISHED,
        )
        self.draft = Project.objects.create(
            title="Projet brouillon", slug="projet-brouillon", category=self.category,
            summary="Un exemple privé.", status=Project.Status.DRAFT,
        )

    def test_main_pages_render(self):
        for name in ("home", "about", "skills", "project_list", "explorations", "materials", "interfaces", "photography", "services", "contact", "legal"):
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

    def test_screen_deep_links_are_session_private(self):
        for name in ("home", "about", "skills", "project_list", "explorations", "materials", "interfaces", "photography", "contact"):
            with self.subTest(screen=name):
                response = self.client.get(reverse(name))
                self.assertContains(response, f'data-active-screen="{name}"')
                self.assertIn("private", response.headers["Cache-Control"])
                if name == 'contact':
                    self.assertContains(response, 'name="csrfmiddlewaretoken"')
                else:
                    self.assertNotContains(response, 'data-contact-form')

    def test_pages_render_only_their_own_content(self):
        home = self.client.get(reverse('home'))
        self.assertNotContains(home, 'id="skills"')
        self.assertNotContains(home, 'id="experience"')
        projects = self.client.get(reverse('project_list'))
        self.assertContains(projects, 'data-project-card')
        self.assertNotContains(projects, 'class="concept-art')
        self.assertNotContains(projects, 'id="home"')
        explorations = self.client.get(reverse('explorations'))
        self.assertContains(explorations, 'class="concept-art')
        self.assertNotContains(explorations, 'data-project-card')
        self.assertContains(self.client.get(reverse('about')), 'id="experience"')

    def test_project_is_an_independent_case_study(self):
        self.published.design_notes = 'Une identité contrastée.'
        self.published.challenges = 'Un retour technique documenté.'
        self.published.solutions = 'Une solution renseignée par Antonio.'
        self.published.save()
        response = self.client.get(self.published.get_absolute_url())
        for text in ('Une identité contrastée.', 'Un retour technique documenté.', 'Une solution renseignée par Antonio.', 'id="galerie"', 'id="bilan"'):
            self.assertContains(response, text)
        self.assertNotContains(response, 'id="project-dialog"')
        self.assertNotContains(response, self.draft.get_absolute_url())
        self.assertTrue(self.published.get_absolute_url().startswith('/projets/'))

    def test_creative_detail_urls_and_labels(self):
        from .presentation import creative_items
        for url in (item['url'] for item in creative_items()):
            with self.subTest(url=url):
                response = self.client.get(url)
                self.assertContains(response, 'sans commande client')
                self.assertContains(response, 'data-art-stage')
                self.assertContains(response, f'<link rel="canonical" href="http://testserver{url}">')
        self.assertEqual(self.client.get('/matieres/mora/').status_code, 404)
        self.assertEqual(self.client.get('/explorations/inconnue/').status_code, 404)

    def test_legacy_urls_redirect_to_canonical_pages(self):
        self.assertRedirects(self.client.get('/realisations/'), reverse('project_list'), status_code=301)
        self.assertRedirects(self.client.get('/realisations/projet-publie/'), self.published.get_absolute_url(), status_code=301)
        self.assertRedirects(self.client.get(reverse('experience')), reverse('about') + '#experience', status_code=301)

    def test_page_metadata_and_search_follow_routes(self):
        response = self.client.get(reverse('materials'))
        self.assertContains(response, '<title>Matières —')
        self.assertContains(response, 'href="/matieres/" aria-current="page"')
        self.assertContains(response, 'href="/interfaces/focus/" data-search-result')
        self.assertContains(response, f'href="{self.published.get_absolute_url()}" data-search-result')
        self.assertNotContains(response, self.draft.get_absolute_url())

    def test_old_fragment_query_still_opens_full_page_and_excludes_drafts(self):
        response = self.client.get(self.published.get_absolute_url(), {"fragment": "1"})
        self.assertContains(response, 'class="project-detail ')
        self.assertContains(response, '<html')
        self.assertEqual(self.client.get(self.draft.get_absolute_url(), {"fragment": "1"}).status_code, 404)

    def test_contact_json_validation_and_delivery(self):
        url = reverse("contact_submit")
        response = self.client.post(url, {"name": "Test"}, HTTP_ACCEPT="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.json()["errors"])
        self.assertEqual(ContactMessage.objects.count(), 0)
        response = self.client.post(url, {
            "name": "Samira", "email": "samira@example.com", "subject": "Projet web",
            "message": "Bonjour, je souhaite discuter de mon prochain projet web.",
        }, HTTP_ACCEPT="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["ok"])
        self.assertEqual(ContactMessage.objects.count(), 1)

    def test_contact_json_rate_limit_and_honeypot(self):
        url = reverse("contact_submit")
        response = self.client.post(url, {"website": "spam.example"}, HTTP_ACCEPT="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("website", response.json()["errors"])
        cache.set("contact-rate:127.0.0.1", 5, 60)
        response = self.client.post(url, {}, HTTP_ACCEPT="application/json")
        self.assertEqual(response.status_code, 429)
        self.assertFalse(response.json()["ok"])
        self.assertEqual(ContactMessage.objects.count(), 0)

    def tearDown(self):
        cache.clear()
