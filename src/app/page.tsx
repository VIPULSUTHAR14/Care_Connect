"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Heart,
  Stethoscope,
  Building2,
  ArrowRight,
  Users,
  UserCheck,
  Hospital,
  Shield,
  Clock,
  Activity,
  Menu,
  X,
} from "lucide-react";

/* ─── Portal card data ─── */
const portalCards = [
  {
    id: "patient",
    title: "Patient Portal",
    description:
      "Book appointments, view medical records, manage prescriptions and track your health journey with ease.",
    icon: Heart,
    accentColor: "#00BCD4",
    accentRGB: "0, 188, 212",
    lightBg: "#E0F7FA",
    loginRoute: "/auth/signin",
    registerRoute: "/register",
    animClass: "card-animate-1",
  },
  {
    id: "doctor",
    title: "Doctor Portal",
    description:
      "Manage consultations, access patient records, set schedules and provide expert care to your patients.",
    icon: Stethoscope,
    accentColor: "#008B8B",
    accentRGB: "0, 139, 139",
    lightBg: "#B2EBF2",
    loginRoute: "/doctor_signin",
    registerRoute: "/doctor_register",
    animClass: "card-animate-2",
  },
  {
    id: "hospital",
    title: "Hospital Portal",
    description:
      "Manage staff, track appointments, handle administration and streamline hospital operations efficiently.",
    icon: Building2,
    accentColor: "#006064",
    accentRGB: "0, 96, 100",
    lightBg: "#B2EBF2",
    loginRoute: "/signin-hospital",
    registerRoute: "/register-hospital",
    animClass: "card-animate-3",
  },
];

/* ─── Stats data ─── */
const stats = [
  { icon: Users, value: "1,000+", label: "Active Patients" },
  { icon: UserCheck, value: "200+", label: "Verified Doctors" },
  { icon: Hospital, value: "50+", label: "Partner Hospitals" },
];

/* ─── Feature highlights ─── */
const features = [
  {
    icon: Shield,
    title: "Secure & Private",
    description: "End-to-end encryption for all your health data",
  },
  {
    icon: Clock,
    title: "24/7 Access",
    description: "Access your health records anytime, anywhere",
  },
  {
    icon: Activity,
    title: "Real-time Updates",
    description: "Instant notifications for appointments & results",
  },
];

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: "#E0F7FA", borderTopColor: "#00BCD4" }}
          />
          <p className="text-sm font-medium" style={{ color: "#00BCD4" }}>
            Loading HealthCare Hub...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* ═══════ Floating Gradient Orbs ═══════ */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="gradient-orb gradient-orb-1" />
        <div className="gradient-orb gradient-orb-2" />
        <div className="gradient-orb gradient-orb-3" />
      </div>

      {/* ═══════ Navigation Bar ═══════ */}
      <nav className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}

            {/* Desktop Nav Links */}

            {/* Mobile menu button */}
          </div>

          {/* Mobile Menu */}
          <div>
          </div>
        </div>
      </nav>

      {/* ═══════ Hero Section ═══════ */}
      <section className="relative z-10 pt-16 pb-8 sm:pt-24 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
            style={{
              background: "#E0F7FA",
              color: "#006064",
              animation: "fade-in 0.6s ease-out forwards",
            }}
          >
            <Activity className="w-4 h-4" />
            Trusted by 1,000+ healthcare professionals
          </div>

          {/* Heading */}
          <h1
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6"
            style={{
              color: "#0F172A",
              animation: "fade-in-up 0.7s ease-out forwards",
              lineHeight: 1.1,
            }}
          >
            Welcome to{" "}
            <span className="shimmer-text">HealthCare Hub</span>
          </h1>

          {/* Subtitle */}
          <p
            className="max-w-2xl mx-auto text-lg sm:text-xl mb-4"
            style={{
              color: "#475569",
              animation: "fade-in-up 0.7s ease-out 0.15s forwards",
              opacity: 0,
            }}
          >
            Your unified healthcare management platform. Connect with
            providers, manage your medical history, and take control of your
            wellness in one secure place.
          </p>
        </div>
      </section>

      {/* ═══════ Role Selection Cards ═══════ */}
      <section className="relative z-10 pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section label */}
          <p
            className="text-center text-sm font-semibold uppercase tracking-widest mb-10"
            style={{ color: "#00BCD4" }}
          >
            Choose your portal
          </p>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {portalCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <div
                  key={card.id}
                  className={`glass-card card-animate ${card.animClass} group`}
                  style={
                    {
                      "--accent": card.accentColor,
                      "--accent-rgb": card.accentRGB,
                    } as React.CSSProperties
                  }
                >
                  <div className="p-8 sm:p-10 flex flex-col h-full">
                    {/* Icon */}
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${card.lightBg}, ${card.accentColor}20)`,
                      }}
                    >
                      <IconComponent
                        className="w-8 h-8"
                        style={{ color: card.accentColor }}
                        strokeWidth={1.8}
                      />
                    </div>

                    {/* Title */}
                    <h3
                      className="text-xl font-bold mb-3"
                      style={{ color: "#0F172A" }}
                    >
                      {card.title}
                    </h3>

                    {/* Description */}
                    <p
                      className="text-sm leading-relaxed mb-8 flex-grow"
                      style={{ color: "#64748B" }}
                    >
                      {card.description}
                    </p>

                    {/* Login Button */}
                    <a
                      href={card.loginRoute}
                      className="cta-button"
                      style={{
                        background: `linear-gradient(135deg, ${card.accentColor}, ${card.accentColor}CC)`,
                        boxShadow: `0 4px 16px rgba(${card.accentRGB}, 0.25)`,
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.boxShadow =
                          `0 8px 32px rgba(${card.accentRGB}, 0.4)`;
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.boxShadow =
                          `0 4px 16px rgba(${card.accentRGB}, 0.25)`;
                      }}
                    >
                      Login as{" "}
                      {card.id.charAt(0).toUpperCase() + card.id.slice(1)}
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Create Account Link */}
          <div
            className="text-center mt-10"
            style={{
              animation: "fade-in 0.6s ease-out 0.6s forwards",
              opacity: 0,
            }}
          >
            <p className="text-sm" style={{ color: "#64748B" }}>
              New here?{" "}
              <a
                href="/register"
                className="font-semibold transition-colors duration-200 hover:underline"
                style={{ color: "#00BCD4" }}
              >
                Create an account →
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ Features Strip ═══════ */}
      <section
        className="relative z-10 py-16"
        style={{ background: "#F8FAFC" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex items-start gap-4 card-animate"
                  style={{ animationDelay: `${0.1 + index * 0.15}s` }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "#E0F7FA" }}
                  >
                    <FeatureIcon
                      className="w-6 h-6"
                      style={{ color: "#00BCD4" }}
                    />
                  </div>
                  <div>
                    <h4
                      className="text-base font-bold mb-1"
                      style={{ color: "#0F172A" }}
                    >
                      {feature.title}
                    </h4>
                    <p className="text-sm" style={{ color: "#64748B" }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ Trust Stats Section ═══════ */}
      <section className="relative z-10 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-2xl sm:text-3xl font-bold mb-3"
            style={{ color: "#0F172A" }}
          >
            Find care near you
          </h2>
          <p className="text-base mb-12 max-w-xl mx-auto" style={{ color: "#64748B" }}>
            Locate your nearest participating HealthCare Hub partner hospital
            and book your first consultation in minutes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {stats.map((stat) => {
              const StatIcon = stat.icon;
              return (
                <div key={stat.label} className="stat-item">
                  <div
                    className="glass-card px-6 py-8 flex flex-col items-center"
                    style={{ animation: "none", transform: "none" }}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                      style={{
                        background:
                          "linear-gradient(135deg, #E0F7FA, #B2EBF2)",
                      }}
                    >
                      <StatIcon
                        className="w-7 h-7"
                        style={{ color: "#00BCD4" }}
                      />
                    </div>
                    <span
                      className="text-3xl sm:text-4xl font-extrabold mb-1"
                      style={{ color: "#00BCD4" }}
                    >
                      {stat.value}
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#64748B" }}
                    >
                      {stat.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ Footer ═══════ */}
      <footer
        className="relative z-10 py-10"
        style={{
          borderTop: "1px solid rgba(0, 188, 212, 0.1)",
          background: "#FAFFFE",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #00BCD4, #008B8B)",
                }}
              >
                <Heart className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span
                className="text-base font-bold"
                style={{ color: "#0F172A" }}
              >
                HealthCare Hub
              </span>
            </div>

            {/* Footer Links */}
            <div className="flex items-center gap-6">
              {["Privacy Policy", "Terms of Service", "Support"].map(
                (link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-xs font-medium transition-colors duration-200 hover:text-cyan-600"
                    style={{ color: "#94A3B8" }}
                  >
                    {link}
                  </a>
                )
              )}
            </div>

            {/* Copyright */}
            <p className="text-xs" style={{ color: "#CBD5E1" }}>
              © 2026 HealthCare Hub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
