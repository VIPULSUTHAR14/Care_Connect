"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Headphones,
  HelpCircle,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function ContactPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general'
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-green-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-6 h-6 text-cyan-800" />
                <h1 className="text-2xl font-mono font-bold text-cyan-800">
                  Contact Us
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-mono font-bold text-cyan-900 mb-6">
              Get in Touch
            </h2>
            <p className="text-xl font-mono text-cyan-700 max-w-3xl mx-auto">
              We're here to help! Reach out to us for any questions, support, or feedback about our healthcare services.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-mono font-bold text-cyan-900 mb-3">
                Phone Support
              </h3>
              <p className="font-mono text-gray-700 mb-2">
                General Inquiries
              </p>
              <a href="tel:+91-9876543210" className="text-lg font-mono text-cyan-600 hover:text-cyan-800">
                +91-9876543210
              </a>
              <p className="font-mono text-gray-700 mt-2">
                Emergency Support
              </p>
              <a href="tel:+91-9876543211" className="text-lg font-mono text-red-600 hover:text-red-800">
                +91-9876543211
              </a>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-mono font-bold text-cyan-900 mb-3">
                Email Support
              </h3>
              <p className="font-mono text-gray-700 mb-2">
                General Support
              </p>
              <a href="mailto:support@nabhahealthcare.com" className="text-lg font-mono text-cyan-600 hover:text-cyan-800">
                support@nabhahealthcare.com
              </a>
              <p className="font-mono text-gray-700 mt-2">
                Technical Issues
              </p>
              <a href="mailto:tech@nabhahealthcare.com" className="text-lg font-mono text-cyan-600 hover:text-cyan-800">
                tech@nabhahealthcare.com
              </a>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-mono font-bold text-cyan-900 mb-3">
                Office Address
              </h3>
              <p className="font-mono text-gray-700">
                Nabha Health Care Headquarters<br />
                123 Medical Plaza, Sector 17<br />
                Chandigarh, Punjab 160017<br />
                India
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form & Support Hours */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-mono font-bold text-cyan-900 mb-6">
                Send us a Message
              </h3>
              
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <p className="text-green-800 font-mono">
                    Thank you! Your message has been sent successfully. We'll get back to you within 24 hours.
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                  <p className="text-red-800 font-mono">
                    Sorry, there was an error sending your message. Please try again or contact us directly.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-mono font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-mono font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-mono font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="appointment">Appointment Booking</option>
                    <option value="feedback">Feedback & Suggestions</option>
                    <option value="partnership">Partnership Opportunities</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-mono font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono"
                    placeholder="Brief subject of your message"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-mono font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono resize-none"
                    placeholder="Please describe your inquiry in detail..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-cyan-800 text-white rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-mono font-bold text-lg transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-3" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Support Information */}
            <div className="space-y-8">
              {/* Support Hours */}
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center mb-6">
                  <Clock className="w-6 h-6 text-cyan-800 mr-3" />
                  <h3 className="text-2xl font-mono font-bold text-cyan-900">
                    Support Hours
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="font-mono text-gray-700">Monday - Friday</span>
                    <span className="font-mono font-medium text-cyan-900">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="font-mono text-gray-700">Saturday</span>
                    <span className="font-mono font-medium text-cyan-900">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="font-mono text-gray-700">Sunday</span>
                    <span className="font-mono font-medium text-cyan-900">Emergency Only</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-mono text-gray-700">Emergency Support</span>
                    <span className="font-mono font-medium text-red-600">24/7 Available</span>
                  </div>
                </div>
              </div>

              {/* Quick Support Options */}
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center mb-6">
                  <Headphones className="w-6 h-6 text-cyan-800 mr-3" />
                  <h3 className="text-2xl font-mono font-bold text-cyan-900">
                    Quick Support
                  </h3>
                </div>
                <div className="space-y-4">
                  <button
                    onClick={() => router.push("/chatbot")}
                    className="w-full p-4 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors text-left"
                  >
                    <div className="flex items-center">
                      <MessageCircle className="w-5 h-5 text-cyan-600 mr-3" />
                      <div>
                        <h4 className="font-mono font-bold text-cyan-900">AI Health Assistant</h4>
                        <p className="font-mono text-sm text-cyan-700">Get instant answers to health questions</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => router.push("/hospitals")}
                    className="w-full p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
                  >
                    <div className="flex items-center">
                      <HelpCircle className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <h4 className="font-mono font-bold text-green-900">Book Appointment</h4>
                        <p className="font-mono text-sm text-green-700">Find and book with nearby hospitals</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => router.push("/notifications")}
                    className="w-full p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
                  >
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-purple-600 mr-3" />
                      <div>
                        <h4 className="font-mono font-bold text-purple-900">Check Notifications</h4>
                        <p className="font-mono text-sm text-purple-700">View your latest updates and alerts</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* FAQ Link */}
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-8 rounded-lg">
                <h3 className="text-xl font-mono font-bold text-cyan-900 mb-4">
                  Frequently Asked Questions
                </h3>
                <p className="font-mono text-cyan-700 mb-4">
                  Find quick answers to common questions about our services, appointments, and platform features.
                </p>
                <button className="px-6 py-3 bg-cyan-800 text-white rounded-lg hover:bg-cyan-700 transition-colors font-mono font-bold">
                  View FAQ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
