from django.db import models
from django.contrib.auth.models import User

class Dataset(models.Model):
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='datasets'
    )
    name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    # Cached summary fields
    summary_total = models.IntegerField(null=True, blank=True)
    summary_avg_flowrate = models.FloatField(null=True, blank=True)
    summary_avg_pressure = models.FloatField(null=True, blank=True)
    summary_avg_temperature = models.FloatField(null=True, blank=True)
    summary_type_distribution = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.uploaded_at.strftime('%Y-%m-%d %H:%M')})"


class Equipment(models.Model):
    dataset = models.ForeignKey(
        Dataset,
        related_name='equipments',
        on_delete=models.CASCADE,
    )
    equipment_name = models.CharField(max_length=255)
    equipment_type = models.CharField(max_length=100)
    flowrate = models.FloatField()
    pressure = models.FloatField()
    temperature = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.equipment_name
