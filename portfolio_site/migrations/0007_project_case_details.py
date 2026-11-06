from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('portfolio_site', '0006_update_vakansy_mada_project')]
    operations = [
        migrations.AddField(model_name='project', name='design_notes', field=models.TextField('design et identité visuelle', blank=True)),
        migrations.AddField(model_name='project', name='challenges', field=models.TextField('difficultés rencontrées', blank=True)),
        migrations.AddField(model_name='project', name='solutions', field=models.TextField('solutions apportées', blank=True)),
    ]
