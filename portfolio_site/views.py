from django.conf import settings
from django.contrib import messages
from django.core.cache import cache
from django.core.mail import send_mail
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.cache import cache_control
from django.views.decorators.http import require_POST
from .forms import ContactForm
from .models import Category, Project, Service, Skill, SiteProfile
from .presentation import (
    EXPERIENCES, INTERFACE_STUDIES, PORTFOLIO_CONCEPTS, PORTFOLIO_FAQ,
    VISUAL_STUDIES, navigation, skill_groups,
)

def public_page_cache(view):
    """Cache public portfolio pages briefly in browsers and longer at the edge."""
    return cache_control(
        public=True,
        max_age=60,
        s_maxage=300,
        stale_while_revalidate=3600,
    )(view)

def render_portfolio(request, screen="home", *, form=None, project=None, status=200):
    projects = Project.objects.filter(status=Project.Status.PUBLISHED).select_related("category")
    selected = request.GET.get("category", "") if screen == "project_list" else ""
    if selected:
        projects = projects.filter(category__slug=selected)
    projects = list(projects)
    active_project = request.GET.get("project", "")
    if not any(item.slug == active_project for item in projects):
        active_project = projects[0].slug if projects else ""
    context = {
        "active_screen": screen, "navigation": navigation(),
        "active_label": next(item['label'] for item in navigation() if item['key'] == screen),
        "projects": projects, "selected_category": selected, "active_project": active_project,
        "categories": Category.objects.filter(projects__status=Project.Status.PUBLISHED).distinct(),
        "skill_groups": skill_groups(Skill.objects.filter(active=True)),
        "experiences": EXPERIENCES, "form": form if form is not None else ContactForm(),
        "initial_project": project,
        "portfolio_concepts": PORTFOLIO_CONCEPTS, "visual_studies": VISUAL_STUDIES,
        "interface_studies": INTERFACE_STUDIES, "portfolio_faq": PORTFOLIO_FAQ,
        "empty_project_slots": range(max(0, 12 - len(projects) - len(PORTFOLIO_CONCEPTS))),
        "empty_study_slots": range(4), "empty_photo_slots": range(11),
    }
    response = render(request, "portfolio_site/desktop.html", context, status=status)
    # Every screen includes the contact form and its session-specific CSRF token.
    response["Cache-Control"] = "private, no-cache"
    return response


def home(request):
    return render_portfolio(request)

def about(request):
    return render_portfolio(request, "about")


def skills(request):
    return render_portfolio(request, "skills")


def experience(request):
    return render_portfolio(request, "experience")

def project_list(request):
    return render_portfolio(request, "project_list")

def project_detail(request, slug):
    project = get_object_or_404(Project.objects.select_related("category").prefetch_related("images"), slug=slug, status=Project.Status.PUBLISHED)
    if request.GET.get("fragment") == "1":
        return render(request, "portfolio_site/includes/project_case.html", {"project": project})
    return render_portfolio(request, "project_list", project=project)

@public_page_cache
def services(request):
    return render(request, "portfolio_site/services.html", {"services": Service.objects.filter(active=True)})

def contact(request):
    return render_portfolio(request, "contact")

@require_POST
def contact_submit(request):
    form = ContactForm(request.POST)
    wants_json = "application/json" in request.headers.get("Accept", "")
    ip = request.META.get("REMOTE_ADDR", "unknown")
    key = f"contact-rate:{ip}"
    if cache.get(key, 0) >= 5:
        if wants_json:
            return JsonResponse({"ok": False, "message": "Trop de tentatives. Merci de réessayer dans une heure."}, status=429)
        messages.error(request, "Trop de tentatives. Merci de réessayer dans une heure.")
        return redirect("contact")
    cache.set(key, cache.get(key, 0) + 1, 3600)
    if form.is_valid():
        message = form.save()
        profile = SiteProfile.objects.first()
        recipient = settings.CONTACT_NOTIFY_EMAIL or (profile.email if profile else "")
        if recipient:
            body = f"De : {message.name} <{message.email}>\n\n{message.message}"
            send_mail(f"Portfolio — {message.subject}", body, settings.DEFAULT_FROM_EMAIL, [recipient], fail_silently=True)
        if wants_json:
            return JsonResponse({"ok": True, "message": "Merci, votre message a bien été envoyé. Je vous répondrai dès que possible."})
        messages.success(request, "Merci, votre message a bien été envoyé. Je vous répondrai dès que possible.")
        return redirect("contact")
    if wants_json:
        return JsonResponse({"ok": False, "errors": form.errors.get_json_data()}, status=400)
    return render_portfolio(request, "contact", form=form, status=400)

@public_page_cache
def legal(request):
    profile = SiteProfile.objects.first()
    if not profile or (not profile.legal_notice and not profile.privacy_notice):
        return render(request, "portfolio_site/legal.html")
    return render(request, "portfolio_site/legal.html", {"profile": profile})

@cache_control(public=True, max_age=0, s_maxage=86400, stale_while_revalidate=86400)
def robots_txt(request):
    return HttpResponse("User-agent: *\nAllow: /\nSitemap: https://" + request.get_host() + "/sitemap.xml\n", content_type="text/plain")

def custom_404(request, exception):
    return render(request, "404.html", status=404)
