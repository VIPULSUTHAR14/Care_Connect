"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { 
  ArrowLeft,
  Heart,
  Users,
  Shield,
  Award,
  Globe,
  Target,
  Lightbulb,
  CheckCircle,
  Star
} from "lucide-react";

export default function AboutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

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
                <Heart className="w-6 h-6 text-cyan-800" />
                <h1 className="text-2xl font-mono font-bold text-cyan-800">
                  About Us
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
              Nabha Health Care
            </h2>
            <p className="text-xl font-mono text-cyan-700 max-w-3xl mx-auto">
              Empowering healthcare through technology, connecting patients with quality medical services across Punjab and beyond.
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-mono font-bold text-cyan-900 mb-4">
                Our Mission
              </h3>
              <p className="text-lg font-mono text-gray-700">
                To revolutionize healthcare accessibility by providing a comprehensive digital platform that connects patients with trusted medical professionals, ensuring quality care is available to everyone, everywhere.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-mono font-bold text-cyan-900 mb-4">
                Our Vision
              </h3>
              <p className="text-lg font-mono text-gray-700">
                To become the leading healthcare technology platform in India, transforming how people access and experience medical care through innovative solutions and compassionate service.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-mono font-bold text-cyan-900 mb-4">
              Our Core Values
            </h3>
            <p className="text-lg font-mono text-gray-700">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-xl font-mono font-bold text-cyan-900 mb-3">
                Compassion
              </h4>
              <p className="font-mono text-gray-700">
                We treat every patient with empathy, understanding, and genuine care for their wellbeing.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-mono font-bold text-cyan-900 mb-3">
                Trust & Security
              </h4>
              <p className="font-mono text-gray-700">
                Your health data and privacy are protected with the highest security standards and ethical practices.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-xl font-mono font-bold text-cyan-900 mb-3">
                Excellence
              </h4>
              <p className="font-mono text-gray-700">
                We strive for the highest quality in all our services, from technology to patient care.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="text-xl font-mono font-bold text-cyan-900 mb-3">
                Accessibility
              </h4>
              <p className="font-mono text-gray-700">
                Quality healthcare should be accessible to everyone, regardless of location or background.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-cyan-600" />
              </div>
              <h4 className="text-xl font-mono font-bold text-cyan-900 mb-3">
                Innovation
              </h4>
              <p className="font-mono text-gray-700">
                We continuously innovate to improve healthcare delivery through cutting-edge technology.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-red-600" />
              </div>
              <h4 className="text-xl font-mono font-bold text-cyan-900 mb-3">
                Integrity
              </h4>
              <p className="font-mono text-gray-700">
                We maintain the highest ethical standards in all our interactions and business practices.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="py-16 bg-cyan-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-mono font-bold text-white mb-4">
              Our Impact
            </h3>
            <p className="text-lg font-mono text-cyan-200">
              Making a difference in healthcare delivery
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-white mb-2">50K+</div>
              <div className="text-lg font-mono text-cyan-200">Patients Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-white mb-2">200+</div>
              <div className="text-lg font-mono text-cyan-200">Partner Hospitals</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-white mb-2">1000+</div>
              <div className="text-lg font-mono text-cyan-200">Verified Doctors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-white mb-2">24/7</div>
              <div className="text-lg font-mono text-cyan-200">Support Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-mono font-bold text-cyan-900 mb-4">
              Leadership Team
            </h3>
            <p className="text-lg font-mono text-gray-700">
              Meet the people behind Nabha Health Care
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl font-mono font-bold text-white">DR</span>
              </div>
              <h4 className="text-xl font-mono font-bold text-cyan-900 mb-2">
                Dr. Rajesh Kumar
              </h4>
              <p className="text-lg font-mono text-cyan-700 mb-3">
                Chief Executive Officer
              </p>
              <p className="font-mono text-gray-700">
                With over 15 years in healthcare management, Dr. Kumar leads our mission to transform healthcare accessibility.
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl font-mono font-bold text-white">PS</span>
              </div>
              <h4 className="text-xl font-mono font-bold text-cyan-900 mb-2">
                Priya Sharma
              </h4>
              <p className="text-lg font-mono text-cyan-700 mb-3">
                Chief Technology Officer
              </p>
              <p className="font-mono text-gray-700">
                A technology visionary with expertise in healthcare systems and patient data management.
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl font-mono font-bold text-white">AS</span>
              </div>
              <h4 className="text-xl font-mono font-bold text-cyan-900 mb-2">
                Dr. Amit Singh
              </h4>
              <p className="text-lg font-mono text-cyan-700 mb-3">
                Chief Medical Officer
              </p>
              <p className="font-mono text-gray-700">
                A renowned cardiologist ensuring our medical standards and quality of care remain exceptional.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-br from-cyan-50 to-cyan-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-mono font-bold text-cyan-900 mb-6">
            Join Our Healthcare Revolution
          </h3>
          <p className="text-lg font-mono text-cyan-700 mb-8">
            Experience the future of healthcare today. Get started with Nabha Health Care and take control of your health journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-8 py-3 bg-cyan-800 text-white rounded-lg hover:bg-cyan-700 transition-colors font-mono font-bold text-lg"
            >
              Get Started
            </button>
            <button
              onClick={() => router.push("/contact")}
              className="px-8 py-3 border-2 border-cyan-800 text-cyan-800 rounded-lg hover:bg-cyan-800 hover:text-white transition-colors font-mono font-bold text-lg"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
