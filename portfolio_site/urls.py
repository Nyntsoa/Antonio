from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("a-propos/", views.about, name="about"),
    path("competences/", views.skills, name="skills"),
    path("parcours/", views.experience, name="experience"),
    path("projets/", views.project_list, name="project_list"),
    path("projets/<slug:slug>/", views.project_detail, name="project_detail"),
    path("explorations/", views.explorations, name="explorations"),
    path("matieres/", views.materials, name="materials"),
    path("interfaces/", views.interfaces, name="interfaces"),
    path("photographie/", views.photography, name="photography"),
    path("realisations/", views.legacy_projects),
    path("realisations/<slug:slug>/", views.legacy_projects),
    path("services/", views.services, name="services"),
    path("contact/", views.contact, name="contact"),
    path("contact/envoyer/", views.contact_submit, name="contact_submit"),
    path("mentions-legales/", views.legal, name="legal"),
    path("robots.txt", views.robots_txt, name="robots_txt"),
    path("<str:space>/<slug:slug>/", views.creative_detail, name="creative_detail"),
]
