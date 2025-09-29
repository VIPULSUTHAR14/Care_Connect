"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  Clock,
  Send,
  MessageCircle,
  Headphones,
  HelpCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function ContactPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        category: "general",
      });
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-cyan-800"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Or a redirect component
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-mono font-extrabold text-cyan-900 mb-6 tracking-tight">
            Get in Touch
          </h2>
          <p className="text-xl font-mono text-cyan-700 max-w-3xl mx-auto">
            We&apos;re here to help! Reach out to us for any questions, support,
            or feedback about our healthcare services.
          </p>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <Mail className="w-12 h-12 text-cyan-700 mx-auto mb-4" />
              <h3 className="text-lg font-mono font-semibold text-cyan-900">
                Email Us
              </h3>
              <p className="text-gray-600">support@hospital.com</p>
            </div>
            <div className="p-6">
              <Phone className="w-12 h-12 text-cyan-700 mx-auto mb-4" />
              <h3 className="text-lg font-mono font-semibold text-cyan-900">
                Call Us
              </h3>
              <p className="text-gray-600">+91 123 456 7890</p>
            </div>
            <div className="p-6">
              <Clock className="w-12 h-12 text-cyan-700 mx-auto mb-4" />
              <h3 className="text-lg font-mono font-semibold text-cyan-900">
                Operating Hours
              </h3>
              <p className="text-gray-600">Mon - Sat, 9:00 AM - 7:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-mono font-bold text-cyan-900 mb-6">
                Send us a Message
              </h3>

              {submitStatus === "success" && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                  <p className="text-green-800 font-mono">
                    Thank you! Your message has been sent successfully. We&apos;ll
                    get back to you within 24 hours.
                  </p>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                  <p className="text-red-800 font-mono">
                    Something went wrong. Please try again later.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" name="name" id="name" required value={formData.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"/>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" id="email" required value={formData.email} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"/>
                  </div>
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                  <select id="category" name="category" value={formData.category} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md">
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing Questions</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                  <input type="text" name="subject" id="subject" required value={formData.subject} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"/>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea id="message" name="message" rows={5} required value={formData.message} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                </div>
                <div>
                  <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-800 hover:bg-cyan-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                    {isSubmitting ? "Sending..." : "Send Message"}
                    <Send className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </form>
            </div>

            {/* Support Information */}
            <div className="bg-cyan-50 p-8 rounded-lg border border-cyan-200">
               <h3 className="text-2xl font-mono font-bold text-cyan-900 mb-6">
                Support Center
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <Headphones className="w-6 h-6 text-cyan-700 mr-4 mt-1 flex-shrink-0"/>
                  <div>
                    <h4 className="font-semibold text-cyan-800">24/7 Live Support</h4>
                    <p className="text-gray-600">Our team is available around the clock to assist you with any urgent issues.</p>
                  </div>
                </li>
                 <li className="flex items-start">
                  <HelpCircle className="w-6 h-6 text-cyan-700 mr-4 mt-1 flex-shrink-0"/>
                  <div>
                    <h4 className="font-semibold text-cyan-800">Frequently Asked Questions</h4>
                    <p className="text-gray-600">Find quick answers to common questions in our comprehensive FAQ section.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}