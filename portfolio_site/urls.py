from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("a-propos/", views.about, name="about"),
    path("realisations/", views.project_list, name="project_list"),
    path("realisations/<slug:slug>/", views.project_detail, name="project_detail"),
    path("services/", views.services, name="services"),
    path("contact/", views.contact, name="contact"),
    path("contact/envoyer/", views.contact_submit, name="contact_submit"),
    path("mentions-legales/", views.legal, name="legal"),
    path("robots.txt", views.robots_txt, name="robots_txt"),
]
