from django.shortcuts import render
from .models import Event, Booking, Ticket, Volunteer
from django.core.mail import send_mail
from rest_framework import generics, filters, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .serializers import (EventSerializer, EventListSerializer, BookingSerializer, BookingWithTicketsSerializer, TicketSerializer)
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
import random 
import datetime 

# Create your views here.
class EventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return EventListSerializer
        return EventSerializer
    
    def get_permissions(self):
        # TEMPORARILY allowing POST (Create Event) without authentication
        if self.request.method in ['GET', 'POST']:
            return [AllowAny()]
        # All other methods (PUT, DELETE) still require IsAuthenticated.
        return [IsAuthenticated()]
    
class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    parser_classes = (MultiPartParser, FormParser)
    def get_permissions(self):
        # 🚨 TEMPORARY FIX APPLIED HERE:
        # Allowing GET (View) and DELETE (Delete) without authentication for testing.
        if self.request.method in ['GET', 'DELETE']:
            return [AllowAny()]
        return [IsAuthenticated()] # PUT (Edit) still requires authentication (make it auth for safety purpose )

@api_view(['POST'])
@permission_classes([AllowAny])
def create_booking(request, event_id):
    """
    Step 1: Create a booking with PENDING status.
    The frontend calls this immediately after the registration form is validated.
    """
    event = get_object_or_404(Event, id=event_id)
    # Ensure tickets_requested is an integer, default to 1
    tickets_requested = int(request.data.get('number_of_tickets', 1))
    
    if event.available_seats < tickets_requested:
        return Response(
            {'error': 'Not enough seats available'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    booking_data = request.data.copy()
    booking_data['event'] = event.id
    # Ensure payment status is pending for the first step
    booking_data['payment_status'] = 'pending' 
    booking_data['number_of_tickets'] = tickets_requested
    
    serializer = BookingSerializer(data=booking_data)
    if serializer.is_valid():
        # Save the booking object (tickets are NOT created yet)
        booking = serializer.save() 
        
        # Return booking details without tickets for the next step (payment)
        response_data = BookingSerializer(booking).data 
        response_data['message'] = "Booking initiated. Proceed to payment."
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny]) 
def complete_payment(request, booking_id):
    """
    Step 2: Mark payment as completed, reduce seats, generate tickets, and send email.
    The frontend calls this after the payment processing simulation.
    """
    booking = get_object_or_404(Booking, id=booking_id)

    if booking.payment_status == 'completed':
        return Response({'error': 'Payment already completed.'}, status=status.HTTP_400_BAD_REQUEST)

    # 1. Update Payment Status & ID (using current time/booking ID for simulated ID)
    booking.payment_status = 'completed'
    booking.payment_id = request.data.get('payment_id', f'PAY-{booking_id}-{random.randint(1000, 9999)}')
    
    # 2. Update Available Seats on Event
    event = booking.event
    event.available_seats -= booking.number_of_tickets
    event.save()
    
    # 3. Create Tickets 
    if not booking.tickets.exists():
        for i in range(booking.number_of_tickets):
            Ticket.objects.create(
                booking=booking,
                ticket_number=i + 1
            )
            
    # Save the updated booking status
    booking.save() 

    # 4. Send Confirmation Email 
    if booking.email:
        send_mail(
            subject=f'Ticket Booking Confirmation for {event.title}',
            message=f'Your payment for {event.title} is complete. Booking ID: {booking.id}. Please check the app for your ticket OTPs.',
            from_email=None, 
            recipient_list=[booking.email],
            fail_silently=False,
        )

    # Return booking details with tickets for the success page
    response_serializer = BookingWithTicketsSerializer(booking)
    return Response(response_serializer.data, status=status.HTTP_200_OK)

# ===== VOLUNTEER MANAGEMENT VIEWS =====

# Admin: Create volunteer
@api_view(['POST'])
@permission_classes([AllowAny])
def create_volunteer(request):
    # if not request.user.is_staff:
    #     return Response({'error': 'Admin access required'}, status=403)
    
    name = request.data.get('name')
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not all([name, username, password]):
        return Response({'error': 'All fields required'}, status=400)
    
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)
    
    user = User.objects.create_user(username=username, password=password)
    volunteer = Volunteer.objects.create(user=user, name=name)
    
    return Response({
        'message': 'Volunteer created successfully',
        'volunteer': {'id': volunteer.id, 'name': name, 'username': username}
    })

# Admin: List volunteers
@api_view(['GET'])
@permission_classes([AllowAny])
def list_volunteers(request):
    # if not request.user.is_staff:
    #     return Response({'error': 'Admin access required'}, status=403)
    
    volunteers = Volunteer.objects.select_related('user').filter(is_active=True)
    data = [{'id': v.id, 'name': v.name, 'username': v.user.username, 'created_at': v.created_at} 
            for v in volunteers]
    return Response(data)

# Admin: Delete volunteer
@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_volunteer(request, volunteer_id):
    # if not request.user.is_staff:
    #     return Response({'error': 'Admin access required'}, status=403)
    
    try:
        volunteer = Volunteer.objects.get(id=volunteer_id)
        volunteer.user.delete()  # This will cascade delete the volunteer
        return Response({'message': 'Volunteer deleted successfully'})
    except Volunteer.DoesNotExist:
        return Response({'error': 'Volunteer not found'}, status=404)

# Volunteer: Login
@api_view(['POST'])
@permission_classes([AllowAny])
def volunteer_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    
    if user and hasattr(user, 'volunteer_profile'):
        return Response({
            'success': True,
            'name': user.volunteer_profile.name,
            'username': user.username
        })
    
    return Response({'error': 'Invalid credentials or not a volunteer'}, status=401)

# Volunteer: Verify ticket
@api_view(['POST'])
@permission_classes([AllowAny])
def volunteer_verify_ticket(request):
    """
    Verify a ticket using volunteer credentials and OTP code
    """
    username = request.data.get('username')
    password = request.data.get('password')
    otp_code = request.data.get('otp_code')
    
    # Authenticate volunteer
    user = authenticate(username=username, password=password)
    if not user or not hasattr(user, 'volunteer_profile'):
        return Response({'error': 'Invalid volunteer credentials'}, status=401)
    
    # Find ticket
    try:
        ticket = Ticket.objects.select_related('booking', 'booking__event').get(otp_code=otp_code)
        
        if ticket.is_verified:
            return Response({
                'error': 'Ticket already verified',
                'verified_at': ticket.verified_at,
                'verified_by': ticket.verified_by.username if ticket.verified_by else None
            }, status=400)
        
        # Verify ticket
        ticket.is_verified = True
        ticket.verified_at = timezone.now()
        ticket.verified_by = user
        ticket.save()
        
        return Response({
            'success': True,
            'message': 'Ticket verified successfully',
            'ticket': {
                'otp_code': ticket.otp_code,
                'event': ticket.booking.event.title,
                'customer': ticket.booking.customer_name,
                'ticket_number': ticket.ticket_number
            }
        })
        
    except Ticket.DoesNotExist:
        return Response({'error': 'Invalid OTP code'}, status=404)
    
# Admin: Get or update admin profile
@api_view(['GET', 'PUT'])
@permission_classes([AllowAny])
def admin_profile(request):
    """
    Get or update admin profile
    """
    if request.method == 'GET':
        # Get current admin user - for now using the first superuser
        try:
            admin_user = User.objects.filter(is_staff=True).first()
            if not admin_user:
                return Response({'error': 'No admin user found'}, status=404)
            
            return Response({
                'name': f"{admin_user.first_name} {admin_user.last_name}".strip() or admin_user.username,
                'email': admin_user.email,
                'phone': '',  # You can add a profile model to store phone
                'role': 'System Administrator' if admin_user.is_superuser else 'Admin'
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    elif request.method == 'PUT':
        # Update admin profile
        try:
            admin_user = User.objects.filter(is_staff=True).first()
            if not admin_user:
                return Response({'error': 'No admin user found'}, status=404)
            
            name = request.data.get('name', '')
            email = request.data.get('email', '')
            phone = request.data.get('phone', '')
            
            # Split name into first and last name
            name_parts = name.split(' ', 1)
            admin_user.first_name = name_parts[0]
            admin_user.last_name = name_parts[1] if len(name_parts) > 1 else ''
            admin_user.email = email
            admin_user.save()
            
            # Note: Phone number storage would require a separate Profile model
            # For now, we're just acknowledging it
            
            return Response({
                'message': 'Profile updated successfully',
                'name': name,
                'email': email,
                'phone': phone
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)