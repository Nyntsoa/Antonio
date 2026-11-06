from django.conf import settings
from django.contrib import messages
from django.core.cache import cache
from django.core.mail import send_mail
from django.http import Http404, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.cache import cache_control
from django.views.decorators.http import require_POST
from .forms import ContactForm
from .models import Category, Project, Service, Skill, SiteProfile
from .presentation import (
    EXPERIENCES, PORTFOLIO_FAQ, PAGE_DESCRIPTIONS, creative_items, navigation, skill_groups,
)
from .project_cases import case_content

def public_page_cache(view):
    """Cache public portfolio pages briefly in browsers and longer at the edge."""
    return cache_control(
        public=True,
        max_age=60,
        s_maxage=300,
        stale_while_revalidate=3600,
    )(view)

def render_portfolio(request, screen="home", *, form=None, project=None, study=None, status=200):
    all_projects = list(Project.objects.filter(status=Project.Status.PUBLISHED).select_related("category"))
    request.portfolio_projects = all_projects
    selected = request.GET.get("category", "") if screen == "project_list" else ""
    projects = [item for item in all_projects if not selected or item.category.slug == selected]
    nav = navigation()
    index = next(i for i, item in enumerate(nav) if item['key'] == screen)
    studies = [item for item in creative_items() if item['family'] == screen]
    context = {
        "active_screen": screen, "navigation": nav, "active_label": nav[index]['label'],
        "page_description": PAGE_DESCRIPTIONS[screen],
        "page_number": nav[index]['number'], "previous_space": nav[(index - 1) % len(nav)],
        "next_space": nav[(index + 1) % len(nav)],
        "projects": projects, "featured_projects": [p for p in all_projects if p.featured][:2] or all_projects[:2],
        "selected_category": selected,
        "categories": Category.objects.filter(projects__status=Project.Status.PUBLISHED).distinct(),
        "skill_groups": skill_groups(Skill.objects.filter(active=True)) if screen == 'skills' else [],
        "experiences": EXPERIENCES, "form": form if form is not None else ContactForm(),
        "project": project, "study": study, "studies": studies,
        "screen_template": f"portfolio_site/pages/{screen}.html",
        "portfolio_faq": PORTFOLIO_FAQ,
    }
    if project:
        project_index = next(i for i, item in enumerate(all_projects) if item.pk == project.pk)
        context.update(case_content(project))
        context.update({"screen_template": "portfolio_site/pages/project_detail.html",
                        "page_title": project.seo_title or project.title,
                        "page_description": project.seo_description or project.summary,
                        "previous_project": all_projects[(project_index - 1) % len(all_projects)] if len(all_projects) > 1 else None,
                        "next_project": all_projects[(project_index + 1) % len(all_projects)] if len(all_projects) > 1 else None})
    if study:
        study_index = studies.index(study)
        context.update({"screen_template": "portfolio_site/pages/creative_detail.html",
                        "page_title": study['title'] + ' · ' + study['label'],
                        "page_description": study['description'],
                        "previous_study": studies[(study_index - 1) % len(studies)],
                        "next_study": studies[(study_index + 1) % len(studies)]})
    response = render(request, "portfolio_site/desktop.html", context, status=status)
    # Contact responses carry a session token. Keep HTML private consistently.
    response["Cache-Control"] = "private, no-cache"
    return response


def home(request):
    return render_portfolio(request)

def about(request):
    return render_portfolio(request, "about")


def skills(request):
    return render_portfolio(request, "skills")


def experience(request):
    return redirect(reverse('about') + '#experience', permanent=True)

def project_list(request):
    return render_portfolio(request, "project_list")

def project_detail(request, slug):
    project = get_object_or_404(Project.objects.select_related("category").prefetch_related("images"), slug=slug, status=Project.Status.PUBLISHED)
    return render_portfolio(request, "project_list", project=project)


def legacy_projects(request, slug=None):
    target = reverse('project_detail', kwargs={'slug': slug}) if slug else reverse('project_list')
    if request.GET.get('category') and not slug:
        from urllib.parse import urlencode
        target += '?' + urlencode({'category': request.GET['category']})
    return redirect(target, permanent=True)


def explorations(request):
    return render_portfolio(request, 'explorations')


def materials(request):
    return render_portfolio(request, 'materials')


def interfaces(request):
    return render_portfolio(request, 'interfaces')


def photography(request):
    return render_portfolio(request, 'photography')


def creative_detail(request, space, slug):
    family = {'explorations': 'explorations', 'matieres': 'materials', 'interfaces': 'interfaces'}.get(space)
    study = next((item for item in creative_items() if item['family'] == family and item['key'] == slug), None)
    if study is None:
        raise Http404('Exploration introuvable')
    return render_portfolio(request, family, study=study)

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
