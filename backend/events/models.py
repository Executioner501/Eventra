from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
import random
import string
from django.core.mail import send_mail

# Create your models here.
class Event(models.Model):
    EventType = (
        ('conference', 'Conference'),
        ('workshop', 'Workshop'),
        ('seminar', 'Seminar'),
        ('movie', 'Movie Screening'),
        ('other', 'Other'),
    )

    title = models.CharField(max_length=200)
    event_type = models.CharField(max_length=20, choices=EventType, default='other')
    organizer = models.CharField(max_length=100)
    venue = models.CharField(max_length=200)
    ticket_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_seats = models.PositiveIntegerField(default=0)
    available_seats = models.PositiveIntegerField(default=0)
    event_date = models.DateField()
    event_time = models.TimeField()
    location = models.CharField(max_length=200)
    description = models.TextField()
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    poster = models.ImageField(upload_to='posters/', blank=True, null=True)

    def __str__(self):
        return self.title

class Booking(models.Model):
    # Payment status options
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'), 
        ('failed', 'Failed'),
    ]
    
    # Which event is this booking for?
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='bookings')
    
    # Customer information
    customer_name = models.CharField(max_length=100)
    roll_number = models.CharField(max_length=20)
    section = models.CharField(max_length=10)
    email = models.EmailField(blank=True, null=True)  # Optional
    phone = models.CharField(max_length=15)
    
    # How many tickets?
    number_of_tickets = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(4)]
    )
    
    # Money stuff
    total_amount = models.DecimalField(max_digits=8, decimal_places=2)
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_id = models.CharField(max_length=100, blank=True)  # From payment gateway
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        # Calculate total amount before saving
        if not self.total_amount or self.total_amount == 0:  # Re-calculate only if not set or zero
            self.total_amount = self.event.ticket_price * self.number_of_tickets
        
        # NOTE: Removed automatic ticket creation and email sending.
        # This logic is now handled in the `complete_payment` view for a more robust flow.
        
        super().save(*args, **kwargs)
        
    def __str__(self):
        return f"{self.customer_name} - {self.event.title} ({self.number_of_tickets} tickets)"

# Function to generate random 6-digit OTP
def generate_otp():
    return ''.join(random.choices(string.digits, k=6))
    # This creates something like "482913"

class Ticket(models.Model):
    # Which booking does this ticket belong to?
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='tickets')
    
    # Ticket details
    ticket_number = models.PositiveIntegerField()  # 1st, 2nd, 3rd, or 4th ticket
    otp_code = models.CharField(max_length=6, default=generate_otp, unique=True)
    # Each ticket gets a unique OTP code
    
    # Verification info
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(blank=True, null=True)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['booking', 'ticket_number']
        
    def __str__(self):
        return f"Ticket {self.ticket_number} - {self.booking.customer_name} - OTP: {self.otp_code}"
    
class Volunteer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='volunteer_profile')
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.user.username})"