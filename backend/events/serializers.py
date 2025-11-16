from rest_framework import serializers
from .models import Event, Booking, Ticket

class EventSerializer(serializers.ModelSerializer):
    poster = serializers.ImageField(required=False)
    class Meta:
        model = Event
        fields = '__all__'

class EventListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'event_type', 'organizer', 'venue', 'ticket_price','total_seats',
            'available_seats', 'event_date', 'event_time', 'location', 'is_active','created_at',
            'poster', 'description'
        ]

class BookingSerializer(serializers.ModelSerializer):
    # This converts booking data to/from JSON
    
    class Meta:
        model = Booking
        fields = ['id', 'event', 'customer_name', 'roll_number', 'section', 
                 'email', 'phone', 'number_of_tickets', 'total_amount', 
                 'payment_status', 'created_at']
        
        # These fields are calculated automatically, user can't set them
        read_only_fields = ['id', 'total_amount', 'payment_status', 'created_at']

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['id', 'ticket_number', 'otp_code', 'is_verified']
        read_only_fields = ['id', 'otp_code', 'is_verified']

class BookingWithTicketsSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_date = serializers.DateField(source='event.event_date', read_only=True)
    event_time = serializers.TimeField(source='event.event_time', read_only=True)
    venue = serializers.CharField(source='event.venue', read_only=True)

    # This shows booking details WITH all ticket OTP codes
    tickets = TicketSerializer(many=True, read_only=True)
    # many=True means "include ALL tickets for this booking"
    
    class Meta:
        model = Booking
        fields = ['id', 'event', 'customer_name', 'roll_number', 'section',
                 'email', 'phone', 'number_of_tickets', 'total_amount',
                 'payment_status', 'tickets', 'created_at','event_id',
                 'event_title','event_date','event_time','venue']
        read_only_fields = ['id', 'total_amount', 'payment_status', 'created_at']