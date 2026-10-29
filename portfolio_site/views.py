from django.conf import settings
from django.contrib import messages
from django.core.cache import cache
from django.core.paginator import Paginator
from django.core.mail import send_mail
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils.html import strip_tags
from django.views.decorators.http import require_POST
from .forms import ContactForm
from .models import Category, Project, Service, Skill, SiteProfile

def home(request):
    return render(request, "portfolio_site/home.html")

def about(request):
    return render(request, "portfolio_site/about.html", {"skills": Skill.objects.filter(active=True)})

def project_list(request):
    categories = Category.objects.filter(projects__status=Project.Status.PUBLISHED).distinct()
    selected = request.GET.get("category", "")
    projects = Project.objects.filter(status=Project.Status.PUBLISHED).select_related("category")
    if selected:
        projects = projects.filter(category__slug=selected)
    page_obj = Paginator(projects, 3).get_page(request.GET.get("page"))
    return render(request, "portfolio_site/projects.html", {"projects": page_obj.object_list, "page_obj": page_obj, "categories": categories, "selected_category": selected})

def project_detail(request, slug):
    project = get_object_or_404(Project.objects.select_related("category").prefetch_related("images"), slug=slug, status=Project.Status.PUBLISHED)
    return render(request, "portfolio_site/project_detail.html", {"project": project})

def services(request):
    return render(request, "portfolio_site/services.html", {"services": Service.objects.filter(active=True)})

def contact(request):
    form = ContactForm()
    return render(request, "portfolio_site/contact.html", {"form": form})

@require_POST
def contact_submit(request):
    form = ContactForm(request.POST)
    ip = request.META.get("REMOTE_ADDR", "unknown")
    key = f"contact-rate:{ip}"
    if cache.get(key, 0) >= 5:
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
        messages.success(request, "Merci, votre message a bien été envoyé. Je vous répondrai dès que possible.")
        return redirect("contact")
    return render(request, "portfolio_site/contact.html", {"form": form}, status=400)

def legal(request):
    profile = SiteProfile.objects.first()
    if not profile or (not profile.legal_notice and not profile.privacy_notice):
        return render(request, "portfolio_site/legal.html")
    return render(request, "portfolio_site/legal.html", {"profile": profile})

def robots_txt(request):
    return HttpResponse("User-agent: *\nAllow: /\nSitemap: https://" + request.get_host() + "/sitemap.xml\n", content_type="text/plain")

def custom_404(request, exception):
    return render(request, "404.html", status=404)
