from django import forms
from .models import ContactMessage

class ContactForm(forms.ModelForm):
    website = forms.CharField(required=False, widget=forms.TextInput(attrs={"tabindex": "-1", "autocomplete": "off", "aria-hidden": "true"}))

    class Meta:
        model = ContactMessage
        fields = ["name", "email", "subject", "message"]
        widgets = {
            "name": forms.TextInput(attrs={"autocomplete": "name", "placeholder": "Votre nom"}),
            "email": forms.EmailInput(attrs={"autocomplete": "email", "placeholder": "vous@exemple.com"}),
            "subject": forms.TextInput(attrs={"placeholder": "Comment puis-je vous aider ?"}),
            "message": forms.Textarea(attrs={"rows": 6, "placeholder": "Parlez-moi de votre projet…", "aria-describedby": "message-help"}),
        }

    def clean_website(self):
        value = self.cleaned_data.get("website", "")
        if value:
            raise forms.ValidationError("Une erreur est survenue. Réessayez plus tard.")
        return value

    def clean_message(self):
        value = self.cleaned_data["message"].strip()
        if len(value) < 15:
            raise forms.ValidationError("Votre message doit contenir au moins 15 caractères.")
        return value
