"use client";

import MainLayout from "@/app/main-layout";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

export default function ContactPage() {
  return (
    <MainLayout>
      <div className="bg-white">
        {/* Hero Section */}
        <div className="relative bg-indigo-600" aria-hidden="true"></div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Contact Us
          </h1>
          <p className="mt-6 text-xl text-indigo-100 max-w-3xl">
            We'd love to hear from you! Whether you're interested in joining our
            club, have questions about upcoming events, or want to learn more
            about our facilities, our team is here to help.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="col-span-1">
            <h2 className="text-2xl font-bold text-gray-900">Get in Touch</h2>
            <p className="mt-4 text-gray-500">
              Have questions about membership, events, or facility rentals? Our
              administrative office is open Monday through Friday.
            </p>

            <dl className="mt-8 space-y-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <MapPin
                    className="h-6 w-6 text-indigo-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3 text-base text-gray-500">
                  <h3 className="font-medium text-gray-900">Main Facility</h3>
                  <p>125 Mississauga Valley Blvd</p>
                  <p>Mississauga, ON L5A 3M8</p>
                  <p className="mt-1">Canada</p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <Phone
                    className="h-6 w-6 text-indigo-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3 text-base text-gray-500">
                  <h3 className="font-medium text-gray-900">Phone</h3>
                  <p>Main Office: (647) 555-1234</p>
                  <p>Membership: (647) 555-2345</p>
                  <p>Facility Booking: (647) 555-3456</p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <Mail
                    className="h-6 w-6 text-indigo-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3 text-base text-gray-500">
                  <h3 className="font-medium text-gray-900">Email</h3>
                  <p>General Inquiries: info@ceylonsportsclub.ca</p>
                  <p>Membership: members@ceylonsportsclub.ca</p>
                  <p>Events: events@ceylonsportsclub.ca</p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <Clock
                    className="h-6 w-6 text-indigo-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3 text-base text-gray-500">
                  <h3 className="font-medium text-gray-900">Hours</h3>
                  <p>Monday - Friday: 9:00 AM - 8:00 PM</p>
                  <p>Saturday: 10:00 AM - 6:00 PM</p>
                  <p>Sunday: 12:00 PM - 5:00 PM</p>
                </div>
              </div>
            </dl>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900">Follow Us</h3>
              <div className="flex space-x-6 mt-4">
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <Facebook className="h-6 w-6" aria-hidden="true" />
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <Instagram className="h-6 w-6" aria-hidden="true" />
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <Twitter className="h-6 w-6" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>

          {/* You can add a contact form or map in the remaining grid columns */}
          <div className="col-span-2">{/* Placeholder for map or form */}</div>
        </div>
      </div>
    </MainLayout>
  );
}
